import type { Product, Settings } from "../database/schema";

export const TROY_OUNCE_G = 31.1034768;

export type MarketState = {
  xauUsd: number;
  xagUsd: number | null;
  eurUsd: number;
  eurRsdMiddle: number;
  eurRsdBuy: number;
  eurRsdSell: number;
};

export type ModifierBreakdown = {
  key: "weekend" | "volatility" | "gap";
  label: string;
  pct: number;
  active: boolean;
  note: string;
};

export type SpreadContext = {
  /** Base spot, EUR per gram of fine gold — the untouched B4 of the original sheet. */
  baseEurPerGramXau: number;
  baseEurPerGramXag: number | null;
  /** Sell-side spot after all risk modifiers — the corrected B5. */
  sellEurPerGramXau: number;
  totalModifierPct: number;
  modifiers: ModifierBreakdown[];
  volatilityRangePct: number;
  gapHold: boolean;
};

/** Belgrade local time parts, without pulling in a date library. */
function belgradeParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "00";
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { dow: map[weekdayStr] ?? 1, hour: Number(hourStr) };
}

/**
 * Is the market inside the low-liquidity window?
 * Handles windows that wrap across the week (Fri 18:00 -> Sun 23:00).
 */
export function isWeekendWindow(settings: Settings, now = new Date()): boolean {
  if (!settings.weekendEnabled) return false;
  const { dow, hour } = belgradeParts(now);
  const cur = dow * 100 + hour;
  const start = settings.weekendStartDow * 100 + settings.weekendStartHour;
  const end = settings.weekendEndDow * 100 + settings.weekendEndHour;
  return start <= end ? cur >= start && cur <= end : cur >= start || cur <= end;
}

/** Peak-to-trough range of the lookback window, in percent. */
export function volatilityRangePct(samples: number[]): number {
  if (samples.length < 2) return 0;
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  if (min <= 0) return 0;
  return ((max - min) / min) * 100;
}

function volatilityMarkup(settings: Settings, rangePct: number): number {
  if (!settings.volEnabled) return 0;
  if (rangePct >= settings.volTier3RangePct) return settings.volTier3MarkupPct;
  if (rangePct >= settings.volTier2RangePct) return settings.volTier2MarkupPct;
  if (rangePct >= settings.volTier1RangePct) return settings.volTier1MarkupPct;
  return 0;
}

/**
 * Builds the sell-side spot from the raw market state.
 * The buy side deliberately never sees any of these modifiers — you must not
 * overpay a client just because the market is illiquid or jumpy.
 */
export function buildSpreadContext(args: {
  market: MarketState;
  settings: Settings;
  volSamples: number[];
  gapHold: boolean;
  now?: Date;
}): SpreadContext {
  const { market, settings, volSamples, gapHold } = args;
  const now = args.now ?? new Date();

  const eurPerOunce = market.xauUsd / market.eurUsd;
  const baseEurPerGramXau = eurPerOunce / TROY_OUNCE_G;
  const baseEurPerGramXag = market.xagUsd ? market.xagUsd / market.eurUsd / TROY_OUNCE_G : null;

  const weekendActive = isWeekendWindow(settings, now);
  const rangePct = volatilityRangePct(volSamples);
  const volPct = volatilityMarkup(settings, rangePct);

  const modifiers: ModifierBreakdown[] = [
    {
      key: "weekend",
      label: "Vikend / after-hours",
      pct: weekendActive ? settings.weekendPct : 0,
      active: weekendActive,
      note: weekendActive
        ? "Niska likvidnost — berza zatvorena, geopolitički rizik ostaje"
        : "Berza aktivna",
    },
    {
      key: "volatility",
      label: "Volatilnost 24h",
      pct: volPct,
      active: volPct > 0,
      note: `Raspon spota: ${rangePct.toFixed(2)}%`,
    },
    {
      key: "gap",
      label: "Gap zaštita",
      pct: 0,
      active: gapHold,
      note: gapHold
        ? "Nagli skok spota — cena zamrznuta do re-quote-a"
        : "Nema naglih skokova",
    },
  ];

  const totalModifierPct = modifiers.reduce((sum, m) => sum + m.pct, 0);

  return {
    baseEurPerGramXau,
    baseEurPerGramXag,
    sellEurPerGramXau: baseEurPerGramXau * (1 + totalModifierPct),
    totalModifierPct,
    modifiers,
    volatilityRangePct: rangePct,
    gapHold,
  };
}

function roundTo(value: number, step: number, dir: "up" | "down"): number {
  if (!step || step <= 0) return value;
  const q = value / step;
  return (dir === "up" ? Math.ceil(q) : Math.floor(q)) * step;
}

export type ProductPrice = {
  sku: string;
  name: string;
  category: string;
  metal: string;
  grossWeightG: number;
  fineness: number;
  /** Actual fine metal content in grams — what the price is really built on. */
  fineWeightG: number;
  onRequest: boolean;
  vatPct: number;
  sellMarginPct: number;
  buyMarginPct: number;
  /** Base margin + risk modifiers, the number actually applied on the sell side. */
  effectiveSellMarginPct: number;
  sellEur: number;
  buyEur: number;
  sellRsd: number;
  buyRsd: number;
  /** sell/buy gap as % of the sell price. */
  spreadPct: number;
  pricePerGramEur: number;
};

export function priceProduct(
  product: Product,
  ctx: SpreadContext,
  market: MarketState,
  settings: Settings,
): ProductPrice {
  const fineWeightG = product.grossWeightG * (product.fineness / 1000);

  const isSilver = product.metal === "XAG";
  const baseGram = isSilver ? (ctx.baseEurPerGramXag ?? 0) : ctx.baseEurPerGramXau;
  const sellGram = isSilver
    ? (ctx.baseEurPerGramXag ?? 0) * (1 + ctx.totalModifierPct)
    : ctx.sellEurPerGramXau;

  // Sell: risk-adjusted spot * fine content * (1 + base margin), then VAT.
  const sellNet = sellGram * fineWeightG * (1 + product.sellMarginPct);
  const sellEurRaw = sellNet * (1 + product.vatPct);

  // Buy: ALWAYS the untouched base spot. No weekend premium, no volatility markup.
  const buyEurRaw = baseGram * fineWeightG * (1 + product.buyMarginPct);

  const sellEur = roundTo(sellEurRaw, settings.roundEurTo, "up");
  const buyEur = roundTo(buyEurRaw, settings.roundEurTo, "down");

  const pickRate = (which: string) =>
    which === "sell" ? market.eurRsdSell : which === "buy" ? market.eurRsdBuy : market.eurRsdMiddle;

  const sellRate = pickRate(settings.rsdSellRate) * (1 + settings.rsdExtraSpreadPct);
  const buyRate = pickRate(settings.rsdBuyRate) * (1 - settings.rsdExtraSpreadPct);

  const sellRsd = roundTo(sellEurRaw * sellRate, settings.roundRsdTo, "up");
  const buyRsd = roundTo(buyEurRaw * buyRate, settings.roundRsdTo, "down");

  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    metal: product.metal,
    grossWeightG: product.grossWeightG,
    fineness: product.fineness,
    fineWeightG,
    onRequest: product.onRequest,
    vatPct: product.vatPct,
    sellMarginPct: product.sellMarginPct,
    buyMarginPct: product.buyMarginPct,
    effectiveSellMarginPct: (1 + product.sellMarginPct) * (1 + ctx.totalModifierPct) - 1,
    sellEur,
    buyEur,
    sellRsd,
    buyRsd,
    spreadPct: sellEur > 0 ? ((sellEur - buyEur) / sellEur) * 100 : 0,
    pricePerGramEur: fineWeightG > 0 ? sellEur / fineWeightG : 0,
  };
}
