import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { products, settings } from "../database/schema";
import { getSettings } from "../lib/market";

/**
 * Single-operator gate: the panel password lives in settings and travels as an
 * x-admin-key header. Swap for Better Auth if more than one operator ever needs
 * their own account.
 */
const guarded = base.use(async ({ context, next }) => {
  const key = context.headers.get("x-admin-key");
  const cfg = await getSettings();
  if (!key || key !== cfg.adminPassword) {
    throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
  }
  return next({ context: { cfg } });
});

const productInput = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  metal: z.enum(["XAU", "XAG"]).default("XAU"),
  category: z.string().default("poluga"),
  grossWeightG: z.number().positive(),
  fineness: z.number().min(1).max(1000),
  sellMarginPct: z.number().min(-0.5).max(3),
  buyMarginPct: z.number().min(-0.9).max(1),
  vatPct: z.number().min(0).max(1).default(0),
  onRequest: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const admin = {
  login: base.input(z.object({ password: z.string() })).handler(async ({ input }) => {
    const cfg = await getSettings();
    if (input.password !== cfg.adminPassword) {
      throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
    }
    return { ok: true, key: cfg.adminPassword };
  }),

  settings: guarded.handler(({ context }) => context.cfg),

  updateSettings: guarded
    .input(
      z.object({
        weekendEnabled: z.boolean().optional(),
        weekendPct: z.number().min(0).max(0.2).optional(),
        weekendStartDow: z.number().int().min(1).max(7).optional(),
        weekendStartHour: z.number().int().min(0).max(23).optional(),
        weekendEndDow: z.number().int().min(1).max(7).optional(),
        weekendEndHour: z.number().int().min(0).max(23).optional(),
        volEnabled: z.boolean().optional(),
        volLookbackHours: z.number().int().min(1).max(168).optional(),
        volTier1RangePct: z.number().min(0).max(50).optional(),
        volTier1MarkupPct: z.number().min(0).max(0.2).optional(),
        volTier2RangePct: z.number().min(0).max(50).optional(),
        volTier2MarkupPct: z.number().min(0).max(0.2).optional(),
        volTier3RangePct: z.number().min(0).max(50).optional(),
        volTier3MarkupPct: z.number().min(0).max(0.2).optional(),
        gapEnabled: z.boolean().optional(),
        gapThresholdPct: z.number().min(0.05).max(20).optional(),
        gapHoldSeconds: z.number().int().min(10).max(3600).optional(),
        rsdSellRate: z.enum(["sell", "middle", "buy"]).optional(),
        rsdBuyRate: z.enum(["sell", "middle", "buy"]).optional(),
        rsdExtraSpreadPct: z.number().min(0).max(0.1).optional(),
        roundRsdTo: z.number().int().min(1).max(1000).optional(),
        roundEurTo: z.number().min(0.01).max(100).optional(),
        refreshSeconds: z.number().int().min(15).max(3600).optional(),
        staleAfterSeconds: z.number().int().min(60).max(86400).optional(),
        feedKey: z.string().min(4).optional(),
        adminPassword: z.string().min(4).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const [row] = await db
        .update(settings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(settings.id, 1))
        .returning();
      return row;
    }),

  products: guarded.handler(() => db.select().from(products).orderBy(asc(products.sortOrder))),

  createProduct: guarded.input(productInput).handler(async ({ input }) => {
    const [row] = await db.insert(products).values(input).returning();
    return row;
  }),

  updateProduct: guarded
    .input(productInput.partial().extend({ id: z.number().int() }))
    .handler(async ({ input }) => {
      const { id, ...rest } = input;
      const [row] = await db.update(products).set(rest).where(eq(products.id, id)).returning();
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Proizvod ne postoji" });
      return row;
    }),

  deleteProduct: guarded.input(z.object({ id: z.number().int() })).handler(async ({ input }) => {
    await db.delete(products).where(eq(products.id, input.id));
    return { ok: true };
  }),
};
