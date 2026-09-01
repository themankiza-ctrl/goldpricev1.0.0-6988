/**
 * Market data fetchers. Every value has at least two independent public sources
 * plus a database fallback, so a single broken endpoint can never take the
 * pricing engine down (the failure mode of the original IMPORTXML formula).
 */

const TIMEOUT_MS = 8000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "GoldenFeatherPricing/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export type SourcedValue = { value: number; source: string };

async function firstSuccess(
  label: string,
  attempts: { source: string; run: () => Promise<number> }[],
): Promise<SourcedValue | null> {
  for (const attempt of attempts) {
    try {
      const value = await attempt.run();
      if (Number.isFinite(value) && value > 0) return { value, source: attempt.source };
    } catch (err) {
      console.warn(`[feeds] ${label} via ${attempt.source} failed:`, (err as Error).message);
    }
  }
  return null;
}

/** XAU spot in USD per troy ounce. */
export function fetchXauUsd() {
  return firstSuccess("XAU/USD", [
    {
      source: "gold-api.com",
      run: async () => {
        const d = await getJson<{ price: number }>("https://api.gold-api.com/price/XAU");
        return d.price;
      },
    },
    {
      source: "swissquote",
      run: async () => {
        const d = await getJson<
          { spreadProfilePrices: { spreadProfile: string; bid: number; ask: number }[] }[]
        >("https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD");
        const prices = d[0]?.spreadProfilePrices ?? [];
        const std = prices.find((p) => p.spreadProfile === "standard") ?? prices[0];
        if (!std) throw new Error("no quote");
        return (std.bid + std.ask) / 2;
      },
    },
    {
      source: "yahoo finance (COMEX GC=F)",
      run: async () => {
        const d = await getJson<{
          chart: { result: { meta: { regularMarketPrice: number } }[] };
        }>("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d");
        return d.chart.result[0]!.meta.regularMarketPrice;
      },
    },
  ]);
}

/** XAG spot in USD per troy ounce. */
export function fetchXagUsd() {
  return firstSuccess("XAG/USD", [
    {
      source: "gold-api.com",
      run: async () => {
        const d = await getJson<{ price: number }>("https://api.gold-api.com/price/XAG");
        return d.price;
      },
    },
    {
      source: "swissquote",
      run: async () => {
        const d = await getJson<
          { spreadProfilePrices: { spreadProfile: string; bid: number; ask: number }[] }[]
        >("https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD");
        const prices = d[0]?.spreadProfilePrices ?? [];
        const std = prices.find((p) => p.spreadProfile === "standard") ?? prices[0];
        if (!std) throw new Error("no quote");
        return (std.bid + std.ask) / 2;
      },
    },
    {
      source: "yahoo finance (COMEX SI=F)",
      run: async () => {
        const d = await getJson<{
          chart: { result: { meta: { regularMarketPrice: number } }[] };
        }>("https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1m&range=1d");
        return d.chart.result[0]!.meta.regularMarketPrice;
      },
    },
  ]);
}

/** How many USD one EUR buys. */
export function fetchEurUsd() {
  return firstSuccess("EUR/USD", [
    {
      source: "frankfurter (ECB)",
      run: async () => {
        const d = await getJson<{ rates: { USD: number } }>(
          "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD",
        );
        return d.rates.USD;
      },
    },
    {
      source: "open.er-api",
      run: async () => {
        const d = await getJson<{ rates: { USD: number } }>(
          "https://open.er-api.com/v6/latest/EUR",
        );
        return d.rates.USD;
      },
    },
  ]);
}

export type RsdRates = { middle: number; buy: number; sell: number; source: string };

/** Official National Bank of Serbia EUR/RSD list, with buy / middle / sell legs. */
export async function fetchEurRsd(): Promise<RsdRates | null> {
  try {
    const d = await getJson<{
      exchange_middle: number;
      exchange_buy: number;
      exchange_sell: number;
    }>("https://kurs.resenje.org/api/v1/currencies/eur/rates/today");
    if (d.exchange_middle > 0) {
      return {
        middle: d.exchange_middle,
        buy: d.exchange_buy,
        sell: d.exchange_sell,
        source: "NBS (kurs.resenje.org)",
      };
    }
  } catch (err) {
    console.warn("[feeds] EUR/RSD via NBS failed:", (err as Error).message);
  }

  try {
    const d = await getJson<{ rates: { RSD: number } }>("https://open.er-api.com/v6/latest/EUR");
    const mid = d.rates.RSD;
    if (mid > 0) {
      // No official legs available — synthesize the usual ~0.3% NBS band.
      return {
        middle: mid,
        buy: mid * 0.997,
        sell: mid * 1.003,
        source: "open.er-api (fallback)",
      };
    }
  } catch (err) {
    console.warn("[feeds] EUR/RSD fallback failed:", (err as Error).message);
  }

  return null;
}
