import { z } from "zod";
import { desc, gte } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import { spotSnapshots } from "../database/schema";
import { getPricingContext } from "../lib/market";
import { TROY_OUNCE_G } from "../lib/pricing";

export const spot = {
  /** Everything the public header + ticker needs in one round trip. */
  current: base.handler(async () => {
    const ctx = await getPricingContext();
    if (!ctx) {
      return {
        status: "DOWN" as const,
        message: "Nijedan izvor nije dostupan i nema keširanog snimka.",
        data: null,
      };
    }

    const { snapshot, market, spread, status } = ctx;
    return {
      status,
      message: null,
      data: {
        xauUsd: market.xauUsd,
        xagUsd: market.xagUsd,
        eurUsd: market.eurUsd,
        eurRsdMiddle: market.eurRsdMiddle,
        eurRsdBuy: market.eurRsdBuy,
        eurRsdSell: market.eurRsdSell,
        xauEurPerOunce: market.xauUsd / market.eurUsd,
        baseEurPerGram: spread.baseEurPerGramXau,
        sellEurPerGram: spread.sellEurPerGramXau,
        baseRsdPerGram: spread.baseEurPerGramXau * market.eurRsdMiddle,
        totalModifierPct: spread.totalModifierPct,
        modifiers: spread.modifiers,
        volatilityRangePct: spread.volatilityRangePct,
        gapHold: spread.gapHold,
        sources: {
          gold: snapshot.goldSource,
          fx: snapshot.fxSource,
          rsd: snapshot.rsdSource,
        },
        updatedAt: snapshot.createdAt,
        ageSeconds: Math.round((Date.now() - snapshot.createdAt.getTime()) / 1000),
        troyOunceG: TROY_OUNCE_G,
      },
    };
  }),

  /** Spot history for the admin chart. */
  history: base
    .input(z.object({ hours: z.number().min(1).max(720).default(24) }))
    .handler(async ({ input }) => {
      const since = new Date(Date.now() - input.hours * 3600 * 1000);
      const rows = await db
        .select()
        .from(spotSnapshots)
        .where(gte(spotSnapshots.createdAt, since))
        .orderBy(desc(spotSnapshots.createdAt))
        .limit(1000);

      return rows
        .map((r) => ({
          at: r.createdAt,
          xauUsd: r.xauUsd,
          eurPerGram: r.xauUsd / r.eurUsd / TROY_OUNCE_G,
          status: r.status,
        }))
        .reverse();
    }),
};
