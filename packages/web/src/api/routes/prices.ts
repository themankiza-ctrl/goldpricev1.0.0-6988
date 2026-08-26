import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { products, priceHistory } from "../database/schema";
import { getPricingContext, priceAll } from "../lib/market";
import { priceProduct } from "../lib/pricing";

async function activeProducts() {
  return db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.sortOrder));
}

export const prices = {
  /** Public price list — sell + buy, EUR + RSD, with the applied risk breakdown. */
  list: base.handler(async () => {
    const ctx = await getPricingContext();
    if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Feed nedostupan" });

    const rows = await activeProducts();
    return {
      status: ctx.status,
      updatedAt: ctx.snapshot.createdAt,
      modifiers: ctx.spread.modifiers,
      totalModifierPct: ctx.spread.totalModifierPct,
      baseEurPerGram: ctx.spread.baseEurPerGramXau,
      sellEurPerGram: ctx.spread.sellEurPerGramXau,
      eurRsdMiddle: ctx.market.eurRsdMiddle,
      items: priceAll(rows, ctx),
    };
  }),

  /** Free-form calculator: quote any weight/fineness, in either direction. */
  quote: base
    .input(
      z.object({
        metal: z.enum(["XAU", "XAG"]).default("XAU"),
        /** grams of gross weight */
        weightG: z.number().min(0).max(100000).default(0),
        fineness: z.number().min(1).max(1000).default(999.9),
        /** optional: quote against an existing product's margins */
        sku: z.string().optional(),
        marginOverridePct: z.number().min(-0.9).max(2).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const ctx = await getPricingContext();
      if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Feed nedostupan" });

      let sellMargin = input.marginOverridePct ?? 0.08;
      let buyMargin = -0.03;
      let vatPct = input.metal === "XAG" ? 0.2 : 0;

      if (input.sku) {
        const [p] = await db.select().from(products).where(eq(products.sku, input.sku));
        if (p) {
          sellMargin = input.marginOverridePct ?? p.sellMarginPct;
          buyMargin = p.buyMarginPct;
          vatPct = p.vatPct;
        }
      }

      const virtual = {
        id: 0,
        sku: input.sku ?? "CUSTOM",
        name: "Kalkulacija",
        metal: input.metal,
        category: "custom",
        grossWeightG: input.weightG,
        fineness: input.fineness,
        sellMarginPct: sellMargin,
        buyMarginPct: buyMargin,
        vatPct,
        onRequest: false,
        active: true,
        sortOrder: 0,
        createdAt: new Date(),
      };

      return {
        status: ctx.status,
        price: priceProduct(virtual, ctx.spread, ctx.market, ctx.settings),
        baseEurPerGram: ctx.spread.baseEurPerGramXau,
        eurRsdMiddle: ctx.market.eurRsdMiddle,
      };
    }),

  /** Snapshot the current published prices into the audit log. */
  snapshotAll: base.handler(async () => {
    const ctx = await getPricingContext(true);
    if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Feed nedostupan" });

    const rows = await activeProducts();
    const priced = priceAll(rows, ctx);
    const mods = ctx.spread.modifiers
      .filter((m) => m.active)
      .map((m) => m.key)
      .join(",");

    await db.insert(priceHistory).values(
      priced.map((p, i) => ({
        productId: rows[i]!.id,
        sku: p.sku,
        spotEurPerGram: ctx.spread.baseEurPerGramXau,
        appliedMarkupPct: ctx.spread.totalModifierPct,
        sellEur: p.sellEur,
        buyEur: p.buyEur,
        sellRsd: p.sellRsd,
        buyRsd: p.buyRsd,
        modifiers: mods,
      })),
    );

    return { saved: priced.length };
  }),

  history: base
    .input(z.object({ sku: z.string().optional(), limit: z.number().min(1).max(500).default(100) }))
    .handler(async ({ input }) => {
      const where = input.sku ? and(eq(priceHistory.sku, input.sku)) : undefined;
      const q = db.select().from(priceHistory);
      const rows = where ? await q.where(where).limit(input.limit) : await q.limit(input.limit);
      return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }),
};
