import { z } from "zod";
import { and, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { priceLocks, products } from "../database/schema";
import { getPricingContext, getSettings } from "../lib/market";
import { priceProduct } from "../lib/pricing";

const REF_ALPHABET = "ACDEFGHJKLMNPQRSTUVWXYZ2345679";

function makeRef(): string {
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `GF-${out}`;
}

/** Flip anything past its window to "istekao" so lists never lie. */
async function expireStale() {
  await db
    .update(priceLocks)
    .set({ status: "istekao" })
    .where(and(eq(priceLocks.status, "aktivan"), lt(priceLocks.expiresAt, new Date())));
}

function lockOptions(raw: string): number[] {
  const parsed = raw
    .split(",")
    .map((v) => Number.parseInt(v.trim(), 10))
    .filter((v) => Number.isFinite(v) && v > 0);
  return parsed.length ? parsed : [30, 60, 360, 720];
}

/** Public config the lock dialog needs before the client types anything. */
export const locks = {
  config: base.handler(async () => {
    const cfg = await getSettings();
    return {
      enabled: cfg.lockEnabled,
      phone: cfg.contactPhone,
      email: cfg.contactEmail,
      minuteOptions: lockOptions(cfg.lockMinuteOptions),
      defaultMinutes: cfg.lockDefaultMinutes,
      maxTotalEur: cfg.lockMaxTotalEur,
    };
  }),

  /**
   * Freeze the currently published price for one product. Price is recomputed
   * server-side — never trusted from the browser.
   */
  create: base
    .input(
      z.object({
        sku: z.string().min(1),
        quantity: z.number().int().min(1).max(999).default(1),
        side: z.enum(["kupovina", "prodaja"]).default("kupovina"),
        lockMinutes: z.number().int().min(5).max(1440),
        customerName: z.string().min(2).max(120),
        customerPhone: z.string().min(6).max(40),
        customerEmail: z.string().email().optional().or(z.literal("")),
        note: z.string().max(500).optional(),
        source: z.enum(["sajt", "embed", "kalkulator"]).default("sajt"),
      }),
    )
    .handler(async ({ input }) => {
      const cfg = await getSettings();
      if (!cfg.lockEnabled) {
        throw new ORPCError("FORBIDDEN", { message: "Zaključavanje cene je trenutno isključeno" });
      }
      if (!lockOptions(cfg.lockMinuteOptions).includes(input.lockMinutes)) {
        throw new ORPCError("BAD_REQUEST", { message: "Nedozvoljeno trajanje rezervacije" });
      }

      const ctx = await getPricingContext();
      if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Feed nedostupan" });

      const [product] = await db.select().from(products).where(eq(products.sku, input.sku));
      if (!product || !product.active) {
        throw new ORPCError("NOT_FOUND", { message: "Proizvod ne postoji" });
      }
      if (product.onRequest) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Ovaj proizvod je samo na upit — pozovite nas za ponudu",
        });
      }

      const priced = priceProduct(product, ctx.spread, ctx.market, ctx.settings);
      const unitEur = input.side === "kupovina" ? priced.sellEur : priced.buyEur;
      const unitRsd = input.side === "kupovina" ? priced.sellRsd : priced.buyRsd;
      const totalEur = unitEur * input.quantity;
      const totalRsd = unitRsd * input.quantity;

      if (totalEur > cfg.lockMaxTotalEur) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Iznos preko ${cfg.lockMaxTotalEur.toLocaleString("sr-RS")} € ide na upit — pozovite ${cfg.contactPhone}`,
        });
      }

      // Retry a couple of times in the (very unlikely) case of a ref collision.
      let ref = makeRef();
      for (let i = 0; i < 4; i += 1) {
        const [clash] = await db.select().from(priceLocks).where(eq(priceLocks.ref, ref));
        if (!clash) break;
        ref = makeRef();
      }

      const expiresAt = new Date(Date.now() + input.lockMinutes * 60_000);

      const [row] = await db
        .insert(priceLocks)
        .values({
          ref,
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          quantity: input.quantity,
          unitSellEur: unitEur,
          unitSellRsd: unitRsd,
          totalEur,
          totalRsd,
          spotEurPerGram: ctx.spread.baseEurPerGramXau,
          eurRsdRate: ctx.market.eurRsdMiddle,
          side: input.side,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail ? input.customerEmail.trim() : null,
          note: input.note?.trim() || null,
          lockMinutes: input.lockMinutes,
          status: "aktivan",
          source: input.source,
          expiresAt,
        })
        .returning();

      return { lock: row!, phone: cfg.contactPhone, email: cfg.contactEmail };
    }),

  /** Public status lookup by reference — client can re-check their own lock. */
  byRef: base.input(z.object({ ref: z.string().min(4) })).handler(async ({ input }) => {
    await expireStale();
    const [row] = await db
      .select()
      .from(priceLocks)
      .where(eq(priceLocks.ref, input.ref.trim().toUpperCase()));
    if (!row) throw new ORPCError("NOT_FOUND", { message: "Rezervacija ne postoji" });
    return row;
  }),

  /** Operator inbox. Guarded by the same admin key as the rest of the panel. */
  list: base
    .input(
      z.object({
        status: z.enum(["all", "aktivan", "potvrdjen", "otkazan", "istekao"]).default("all"),
        limit: z.number().int().min(1).max(500).default(100),
      }),
    )
    .handler(async ({ input, context }) => {
      const cfg = await getSettings();
      const key = context.headers.get("x-admin-key");
      if (!key || key !== cfg.adminPassword) {
        throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
      }
      await expireStale();

      const q = db.select().from(priceLocks).orderBy(desc(priceLocks.createdAt)).limit(input.limit);
      const rows =
        input.status === "all" ? await q : await db
          .select()
          .from(priceLocks)
          .where(eq(priceLocks.status, input.status))
          .orderBy(desc(priceLocks.createdAt))
          .limit(input.limit);

      const openCount = (
        await db
          .select()
          .from(priceLocks)
          .where(and(eq(priceLocks.status, "aktivan"), gte(priceLocks.expiresAt, new Date())))
      ).length;

      return { rows, openCount };
    }),

  setStatus: base
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(["aktivan", "potvrdjen", "otkazan", "istekao"]),
      }),
    )
    .handler(async ({ input, context }) => {
      const cfg = await getSettings();
      const key = context.headers.get("x-admin-key");
      if (!key || key !== cfg.adminPassword) {
        throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
      }
      const [row] = await db
        .update(priceLocks)
        .set({ status: input.status })
        .where(eq(priceLocks.id, input.id))
        .returning();
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Rezervacija ne postoji" });
      return row;
    }),

  purge: base
    .input(z.object({ statuses: z.array(z.enum(["otkazan", "istekao"])).min(1) }))
    .handler(async ({ input, context }) => {
      const cfg = await getSettings();
      const key = context.headers.get("x-admin-key");
      if (!key || key !== cfg.adminPassword) {
        throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
      }
      await db.delete(priceLocks).where(inArray(priceLocks.status, input.statuses));
      return { ok: true };
    }),
};
