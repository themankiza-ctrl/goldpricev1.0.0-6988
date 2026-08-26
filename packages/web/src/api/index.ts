import type { RouterClient } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { createApp } from "./__core/app";
import { db } from "./database";
import { products } from "./database/schema";
import { getPricingContext, priceAll } from "./lib/market";
import { seedIfEmpty } from "./lib/seed";
import { admin } from "./routes/admin";
import { ping } from "./routes/ping";
import { prices } from "./routes/prices";
import { spot } from "./routes/spot";

export const router = {
  ping,
  spot,
  prices,
  admin,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

void seedIfEmpty().catch((err) => console.error("[seed] failed:", err));

/** Shared loader for the shop feeds. */
async function feedRows(key: string | undefined) {
  const ctx = await getPricingContext();
  if (!ctx) return { error: "feed_down" as const, ctx: null, rows: [] };
  if (key !== ctx.settings.feedKey) return { error: "unauthorized" as const, ctx: null, rows: [] };

  const list = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder));

  return { error: null, ctx, rows: priceAll(list, ctx).filter((p) => !p.onRequest) };
}

function csv(rows: string[][]) {
  return rows
    .map((r) => r.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(","))
    .join("\n");
}

/** Public JSON feed — for custom integrations and the shop front-end. */
app.get("/api/feed/prices.json", async (c) => {
  const { error, ctx, rows } = await feedRows(c.req.query("key"));
  if (error === "unauthorized") return c.json({ error: "Invalid key" }, 401);
  if (error || !ctx) return c.json({ error: "Feed unavailable" }, 503);

  return c.json(
    {
      generatedAt: new Date().toISOString(),
      status: ctx.status,
      spot: {
        xauUsd: ctx.market.xauUsd,
        eurUsd: ctx.market.eurUsd,
        eurRsd: ctx.market.eurRsdMiddle,
        baseEurPerGram: ctx.spread.baseEurPerGramXau,
        sellEurPerGram: ctx.spread.sellEurPerGramXau,
      },
      appliedModifiers: ctx.spread.modifiers.filter((m) => m.active).map((m) => m.key),
      products: rows,
    },
    200,
  );
});

/** WooCommerce product CSV — map SKU + Regular price in WP All Import. */
app.get("/api/feed/woocommerce.csv", async (c) => {
  const { error, rows } = await feedRows(c.req.query("key"));
  if (error === "unauthorized") return c.text("Invalid key", 401);
  if (error) return c.text("Feed unavailable", 503);

  const body = csv([
    ["SKU", "Name", "Regular price", "Buyback price", "Currency", "Weight (g)", "Fineness", "Tax status"],
    ...rows.map((p) => [
      p.sku,
      p.name,
      String(Math.round(p.sellRsd)),
      String(Math.round(p.buyRsd)),
      "RSD",
      String(p.grossWeightG),
      String(p.fineness),
      p.vatPct > 0 ? "taxable" : "none",
    ]),
  ]);

  return c.body(body, 200, {
    "content-type": "text/csv; charset=utf-8",
    "cache-control": "no-store",
  });
});

/** Shopify inventory CSV — Variant SKU + Variant Price columns. */
app.get("/api/feed/shopify.csv", async (c) => {
  const { error, rows } = await feedRows(c.req.query("key"));
  if (error === "unauthorized") return c.text("Invalid key", 401);
  if (error) return c.text("Feed unavailable", 503);

  const body = csv([
    ["Handle", "Title", "Variant SKU", "Variant Price", "Variant Compare At Price", "Variant Grams"],
    ...rows.map((p) => [
      p.sku.toLowerCase(),
      p.name,
      p.sku,
      String(Math.round(p.sellRsd)),
      "",
      String(Math.round(p.grossWeightG)),
    ]),
  ]);

  return c.body(body, 200, {
    "content-type": "text/csv; charset=utf-8",
    "cache-control": "no-store",
  });
});

export default app;
