import { db } from "../database";
import { products, settings } from "../database/schema";

/**
 * Golden Feather catalogue. Margins are reverse-engineered from the published
 * RSD price list so the engine starts out reproducing real shop prices; they
 * are fully editable from the admin panel afterwards.
 *
 * grossWeightG is the declared coin/bar weight, fineness the millesimal purity.
 * Pricing always runs on gross * fineness / 1000 — the actual fine metal.
 */
const CATALOGUE = [
  // --- Zlatne poluge / pločice (999.9) ---
  { sku: "GF-BAR-1G", name: "Zlatna pločica 1g", category: "poluga", grossWeightG: 1, fineness: 999.9, sellMarginPct: 0.2433, buyMarginPct: -0.05, sortOrder: 10 },
  { sku: "GF-BAR-2G", name: "Zlatna pločica 2g", category: "poluga", grossWeightG: 2, fineness: 999.9, sellMarginPct: 0.1842, buyMarginPct: -0.045, sortOrder: 20 },
  { sku: "GF-BAR-5G", name: "Zlatna pločica 5g", category: "poluga", grossWeightG: 5, fineness: 999.9, sellMarginPct: 0.1509, buyMarginPct: -0.035, sortOrder: 30 },
  { sku: "GF-BAR-10G", name: "Zlatna pločica 10g", category: "poluga", grossWeightG: 10, fineness: 999.9, sellMarginPct: 0.1075, buyMarginPct: -0.03, sortOrder: 40 },
  { sku: "GF-BAR-20G", name: "Zlatna pločica 20g", category: "poluga", grossWeightG: 20, fineness: 999.9, sellMarginPct: 0.093, buyMarginPct: -0.025, sortOrder: 50 },
  { sku: "GF-BAR-1OZ", name: "Zlatna pločica 1 unca", category: "poluga", grossWeightG: 31.1034768, fineness: 999.9, sellMarginPct: 0.0888, buyMarginPct: -0.02, sortOrder: 60 },
  { sku: "GF-BAR-50G", name: "Zlatna pločica 50g", category: "poluga", grossWeightG: 50, fineness: 999.9, sellMarginPct: 0.0877, buyMarginPct: -0.018, sortOrder: 70 },
  { sku: "GF-BAR-100G", name: "Zlatna pločica 100g", category: "poluga", grossWeightG: 100, fineness: 999.9, sellMarginPct: 0.0847, buyMarginPct: -0.015, sortOrder: 80 },
  { sku: "GF-BAR-250G", name: "Zlatna pločica 250g", category: "poluga", grossWeightG: 250, fineness: 999.9, sellMarginPct: 0.0701, buyMarginPct: -0.012, sortOrder: 90 },
  { sku: "GF-BAR-500G", name: "Zlatna pločica 500g", category: "poluga", grossWeightG: 500, fineness: 999.9, sellMarginPct: 0.06, buyMarginPct: -0.01, sortOrder: 100, onRequest: true },
  { sku: "GF-BAR-1000G", name: "Zlatna pločica 1000g", category: "poluga", grossWeightG: 1000, fineness: 999.9, sellMarginPct: 0.055, buyMarginPct: -0.008, sortOrder: 110, onRequest: true },

  // --- Dukati (986.0 — Franc Jozef) i kovanice (999.9) ---
  { sku: "GF-WP-1-10OZ", name: "Wiener Philharmoniker 1/10 unca", category: "kovanica", grossWeightG: 3.1103477, fineness: 999.9, sellMarginPct: 0.2546, buyMarginPct: -0.04, sortOrder: 200 },
  { sku: "GF-FJ-MALI", name: "Mali dukat Franc Jozef", category: "dukat", grossWeightG: 3.4909, fineness: 986, sellMarginPct: 0.1659, buyMarginPct: -0.03, sortOrder: 210 },
  { sku: "GF-WP-1-4OZ", name: "Wiener Philharmoniker 1/4 unca", category: "kovanica", grossWeightG: 7.7758692, fineness: 999.9, sellMarginPct: 0.2222, buyMarginPct: -0.03, sortOrder: 220 },
  { sku: "GF-FJ-VELIKI", name: "Veliki dukat Franc Jozef", category: "dukat", grossWeightG: 13.9636, fineness: 986, sellMarginPct: 0.1293, buyMarginPct: -0.025, sortOrder: 230 },
  { sku: "GF-WP-1-2OZ", name: "Wiener Philharmoniker 1/2 unca", category: "kovanica", grossWeightG: 15.5517384, fineness: 999.9, sellMarginPct: 0.2368, buyMarginPct: -0.025, sortOrder: 240 },
  { sku: "GF-WP-1OZ", name: "Wiener Philharmoniker 1 unca", category: "kovanica", grossWeightG: 31.1034768, fineness: 999.9, sellMarginPct: 0.0992, buyMarginPct: -0.02, sortOrder: 250 },

  // --- Srebro: nije investiciono zlato, ide sa 20% PDV ---
  { sku: "GF-AG-WP-1OZ", name: "Wiener Philharmoniker srebro 1 unca", category: "srebro", metal: "XAG", grossWeightG: 31.1034768, fineness: 999, sellMarginPct: 0.2528, buyMarginPct: -0.15, vatPct: 0.2, sortOrder: 300 },
];

export async function seedIfEmpty() {
  const existing = await db.select({ sku: products.sku }).from(products).limit(1);
  if (existing.length === 0) {
    await db.insert(products).values(
      CATALOGUE.map((p) => ({
        metal: "XAU",
        vatPct: 0,
        onRequest: false,
        active: true,
        ...p,
      })),
    );
    console.log(`[seed] inserted ${CATALOGUE.length} products`);
  }

  const cfg = await db.select({ id: settings.id }).from(settings).limit(1);
  if (cfg.length === 0) {
    await db.insert(settings).values({ id: 1 });
    console.log("[seed] inserted default settings");
  }
}
