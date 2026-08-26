import { desc, gte } from "drizzle-orm";
import { db } from "../database";
import { settings as settingsTable, spotSnapshots } from "../database/schema";
import type { Settings, SpotSnapshot } from "../database/schema";
import { fetchEurRsd, fetchEurUsd, fetchXagUsd, fetchXauUsd } from "./feeds";
import { buildSpreadContext, priceProduct, type MarketState, type SpreadContext } from "./pricing";
import type { Product } from "../database/schema";

export const DEFAULT_SETTINGS_ID = 1;

export async function getSettings(): Promise<Settings> {
  const [row] = await db.select().from(settingsTable).limit(1);
  if (row) return row;
  const [created] = await db
    .insert(settingsTable)
    .values({ id: DEFAULT_SETTINGS_ID })
    .returning();
  return created!;
}

type GapState = { heldSpot: number | null; holdUntil: number; lastPublished: number | null };
const gapState: GapState = { heldSpot: null, holdUntil: 0, lastPublished: null };

type Cache = { snapshot: SpotSnapshot | null; fetchedAt: number; inFlight: Promise<void> | null };
const cache: Cache = { snapshot: null, fetchedAt: 0, inFlight: null };

/** Pull every leg in parallel and persist a snapshot. Falls back to the last DB row. */
async function refreshSnapshot(): Promise<void> {
  const [xau, xag, eurUsd, rsd] = await Promise.all([
    fetchXauUsd(),
    fetchXagUsd(),
    fetchEurUsd(),
    fetchEurRsd(),
  ]);

  const [last] = await db
    .select()
    .from(spotSnapshots)
    .orderBy(desc(spotSnapshots.createdAt))
    .limit(1);

  // Any missing leg degrades the snapshot instead of killing it.
  const xauUsd = xau?.value ?? last?.xauUsd ?? null;
  const eurUsdVal = eurUsd?.value ?? last?.eurUsd ?? null;
  const rsdMid = rsd?.middle ?? last?.eurRsdMiddle ?? null;

  if (xauUsd === null || eurUsdVal === null || rsdMid === null) {
    console.error("[market] no usable data and no cached snapshot — feed is DOWN");
    return;
  }

  const degraded = !xau || !eurUsd || !rsd;

  const [row] = await db
    .insert(spotSnapshots)
    .values({
      xauUsd,
      xagUsd: xag?.value ?? last?.xagUsd ?? null,
      eurUsd: eurUsdVal,
      eurRsdMiddle: rsdMid,
      eurRsdBuy: rsd?.buy ?? last?.eurRsdBuy ?? rsdMid * 0.997,
      eurRsdSell: rsd?.sell ?? last?.eurRsdSell ?? rsdMid * 1.003,
      goldSource: xau?.source ?? `cache: ${last?.goldSource ?? "n/a"}`,
      fxSource: eurUsd?.source ?? `cache: ${last?.fxSource ?? "n/a"}`,
      rsdSource: rsd?.source ?? `cache: ${last?.rsdSource ?? "n/a"}`,
      status: degraded ? "STALE" : "LIVE",
    })
    .returning();

  cache.snapshot = row ?? null;
  cache.fetchedAt = Date.now();
}

/** Cached snapshot getter — at most one network refresh per refreshSeconds. */
export async function getSnapshot(force = false): Promise<SpotSnapshot | null> {
  const cfg = await getSettings();
  const ageMs = Date.now() - cache.fetchedAt;

  if (!cache.snapshot) {
    const [last] = await db
      .select()
      .from(spotSnapshots)
      .orderBy(desc(spotSnapshots.createdAt))
      .limit(1);
    if (last) {
      cache.snapshot = last;
      cache.fetchedAt = last.createdAt.getTime();
    }
  }

  if (force || !cache.snapshot || ageMs > cfg.refreshSeconds * 1000) {
    if (!cache.inFlight) {
      cache.inFlight = refreshSnapshot().finally(() => {
        cache.inFlight = null;
      });
    }
    await cache.inFlight;
  }

  return cache.snapshot;
}

export type FeedStatus = "LIVE" | "STALE" | "DOWN";

export function statusFor(snapshot: SpotSnapshot | null, cfg: Settings): FeedStatus {
  if (!snapshot) return "DOWN";
  const ageSec = (Date.now() - snapshot.createdAt.getTime()) / 1000;
  if (ageSec > cfg.staleAfterSeconds * 4) return "DOWN";
  if (snapshot.status === "STALE" || ageSec > cfg.staleAfterSeconds) return "STALE";
  return "LIVE";
}

export function toMarketState(s: SpotSnapshot): MarketState {
  return {
    xauUsd: s.xauUsd,
    xagUsd: s.xagUsd,
    eurUsd: s.eurUsd,
    eurRsdMiddle: s.eurRsdMiddle,
    eurRsdBuy: s.eurRsdBuy,
    eurRsdSell: s.eurRsdSell,
  };
}

/**
 * Gap protection: if spot jumps more than the threshold since the last published
 * price, keep quoting the held value for gapHoldSeconds instead of instantly
 * repricing. Stops a spike from being arbitraged against the shop.
 */
function applyGapProtection(currentEurGram: number, cfg: Settings) {
  if (!cfg.gapEnabled) {
    gapState.lastPublished = currentEurGram;
    return { publishedSpot: currentEurGram, gapHold: false };
  }

  const now = Date.now();
  if (gapState.lastPublished === null) {
    gapState.lastPublished = currentEurGram;
    return { publishedSpot: currentEurGram, gapHold: false };
  }

  if (now < gapState.holdUntil && gapState.heldSpot !== null) {
    return { publishedSpot: gapState.heldSpot, gapHold: true };
  }

  const movePct = Math.abs((currentEurGram - gapState.lastPublished) / gapState.lastPublished) * 100;
  if (movePct > cfg.gapThresholdPct) {
    gapState.heldSpot = gapState.lastPublished;
    gapState.holdUntil = now + cfg.gapHoldSeconds * 1000;
    return { publishedSpot: gapState.lastPublished, gapHold: true };
  }

  gapState.lastPublished = currentEurGram;
  gapState.heldSpot = null;
  return { publishedSpot: currentEurGram, gapHold: false };
}

async function volatilitySamples(cfg: Settings): Promise<number[]> {
  const since = new Date(Date.now() - cfg.volLookbackHours * 3600 * 1000);
  const rows = await db
    .select({ xauUsd: spotSnapshots.xauUsd, eurUsd: spotSnapshots.eurUsd })
    .from(spotSnapshots)
    .where(gte(spotSnapshots.createdAt, since))
    .orderBy(desc(spotSnapshots.createdAt))
    .limit(500);
  return rows.map((r) => r.xauUsd / r.eurUsd);
}

export type PricingContext = {
  snapshot: SpotSnapshot;
  market: MarketState;
  settings: Settings;
  spread: SpreadContext;
  status: FeedStatus;
};

export async function getPricingContext(force = false): Promise<PricingContext | null> {
  const cfg = await getSettings();
  const snapshot = await getSnapshot(force);
  if (!snapshot) return null;

  const market = toMarketState(snapshot);
  const samples = await volatilitySamples(cfg);

  const rawCtx = buildSpreadContext({ market, settings: cfg, volSamples: samples, gapHold: false });
  const { publishedSpot, gapHold } = applyGapProtection(rawCtx.baseEurPerGramXau, cfg);

  // Rebuild against the published (possibly held) spot so every downstream
  // price uses exactly the value the gap guard approved.
  const publishedMarket: MarketState = {
    ...market,
    xauUsd: publishedSpot * 31.1034768 * market.eurUsd,
  };
  const spread = buildSpreadContext({
    market: publishedMarket,
    settings: cfg,
    volSamples: samples,
    gapHold,
  });

  return { snapshot, market: publishedMarket, settings: cfg, spread, status: statusFor(snapshot, cfg) };
}

export function priceAll(products: Product[], ctx: PricingContext) {
  return products.map((p) => priceProduct(p, ctx.spread, ctx.market, ctx.settings));
}
