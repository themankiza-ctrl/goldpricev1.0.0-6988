import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Product matrix — replaces rows 8+ of the original Google Sheet. */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  /** XAU | XAG */
  metal: text("metal").notNull().default("XAU"),
  /** poluga | dukat | kovanica | srebro */
  category: text("category").notNull().default("poluga"),
  /** Gross (declared) weight in grams. */
  grossWeightG: real("gross_weight_g").notNull(),
  /** Millesimal fineness: 999.9 for bars, 986.0 for Franc Jozef ducats. */
  fineness: real("fineness").notNull().default(999.9),
  /** Base sell margin over spot, e.g. 0.19 = +19%. */
  sellMarginPct: real("sell_margin_pct").notNull(),
  /** Base buy discount under spot, e.g. -0.05 = -5%. */
  buyMarginPct: real("buy_margin_pct").notNull(),
  /** 0 for investment gold (VAT exempt), 0.20 for silver. */
  vatPct: real("vat_pct").notNull().default(0),
  /** Refinery / mint, e.g. "Argor-Heraeus". Shown on the product card. */
  manufacturer: text("manufacturer"),
  /** Manufacturer logo path under /images/brands/. */
  brandLogo: text("brand_logo"),
  /** Product photo path under /images/products/. */
  imageUrl: text("image_url"),
  /** 2-3 sentence Serbian sales blurb for the card. */
  blurb: text("blurb"),
  /** Price on request only — never published to feeds. */
  onRequest: integer("on_request", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Every successful (or degraded) market read, used for volatility + audit. */
export const spotSnapshots = sqliteTable("spot_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  xauUsd: real("xau_usd").notNull(),
  xagUsd: real("xag_usd"),
  eurUsd: real("eur_usd").notNull(),
  eurRsdMiddle: real("eur_rsd_middle").notNull(),
  eurRsdBuy: real("eur_rsd_buy").notNull(),
  eurRsdSell: real("eur_rsd_sell").notNull(),
  goldSource: text("gold_source").notNull(),
  fxSource: text("fx_source").notNull(),
  rsdSource: text("rsd_source").notNull(),
  /** LIVE | STALE | DOWN */
  status: text("status").notNull().default("LIVE"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Audit log: what price was actually published, and why. */
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  sku: text("sku").notNull(),
  spotEurPerGram: real("spot_eur_per_gram").notNull(),
  appliedMarkupPct: real("applied_markup_pct").notNull(),
  sellEur: real("sell_eur").notNull(),
  buyEur: real("buy_eur").notNull(),
  sellRsd: real("sell_rsd").notNull(),
  buyRsd: real("buy_rsd").notNull(),
  /** Comma separated modifier keys that fired: weekend,volatility,gap */
  modifiers: text("modifiers").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Lead capture + price lock. A client freezes a published sell price for N
 * minutes; the operator gets the request and confirms or lets it expire.
 */
export const priceLocks = sqliteTable("price_locks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Short human reference the client quotes on the phone, e.g. GF-7K3Q. */
  ref: text("ref").notNull().unique(),
  productId: integer("product_id").notNull(),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  /** Locked unit prices at the moment of request. */
  unitSellEur: real("unit_sell_eur").notNull(),
  unitSellRsd: real("unit_sell_rsd").notNull(),
  totalEur: real("total_eur").notNull(),
  totalRsd: real("total_rsd").notNull(),
  spotEurPerGram: real("spot_eur_per_gram").notNull(),
  eurRsdRate: real("eur_rsd_rate").notNull(),
  /** kupovina | prodaja — client buying from us, or selling to us. */
  side: text("side").notNull().default("kupovina"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  note: text("note"),
  lockMinutes: integer("lock_minutes").notNull().default(60),
  /** aktivan | potvrdjen | otkazan | istekao */
  status: text("status").notNull().default("aktivan"),
  /** Where the request came from: sajt | embed | kalkulator */
  source: text("source").notNull().default("sajt"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Single-row configuration (id = 1). */
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),

  // --- Weekend / after-hours premium (the original 1.5% rule) ---
  weekendEnabled: integer("weekend_enabled", { mode: "boolean" }).notNull().default(true),
  weekendPct: real("weekend_pct").notNull().default(0.015),
  /** ISO weekday 1=Mon..7=Sun. Default: Fri 18:00 -> Sun 23:59. */
  weekendStartDow: integer("weekend_start_dow").notNull().default(5),
  weekendStartHour: integer("weekend_start_hour").notNull().default(18),
  weekendEndDow: integer("weekend_end_dow").notNull().default(7),
  weekendEndHour: integer("weekend_end_hour").notNull().default(23),

  // --- Volatility-scaled premium ---
  volEnabled: integer("vol_enabled", { mode: "boolean" }).notNull().default(true),
  volLookbackHours: integer("vol_lookback_hours").notNull().default(24),
  volTier1RangePct: real("vol_tier1_range_pct").notNull().default(0.6),
  volTier1MarkupPct: real("vol_tier1_markup_pct").notNull().default(0.003),
  volTier2RangePct: real("vol_tier2_range_pct").notNull().default(1.2),
  volTier2MarkupPct: real("vol_tier2_markup_pct").notNull().default(0.007),
  volTier3RangePct: real("vol_tier3_range_pct").notNull().default(2.5),
  volTier3MarkupPct: real("vol_tier3_markup_pct").notNull().default(0.015),

  // --- Gap / stale-price protection ---
  gapEnabled: integer("gap_enabled", { mode: "boolean" }).notNull().default(true),
  gapThresholdPct: real("gap_threshold_pct").notNull().default(0.8),
  gapHoldSeconds: integer("gap_hold_seconds").notNull().default(120),

  // --- RSD conversion ---
  /** which NBS rate to use: sell | middle | buy */
  rsdSellRate: text("rsd_sell_rate").notNull().default("sell"),
  rsdBuyRate: text("rsd_buy_rate").notNull().default("middle"),
  /** Extra safety spread on top of the NBS rate, e.g. 0.005 = 0.5%. */
  rsdExtraSpreadPct: real("rsd_extra_spread_pct").notNull().default(0),

  // --- Rounding ---
  roundRsdTo: integer("round_rsd_to").notNull().default(10),
  roundEurTo: real("round_eur_to").notNull().default(0.5),

  // --- Feed / ops ---
  refreshSeconds: integer("refresh_seconds").notNull().default(60),
  staleAfterSeconds: integer("stale_after_seconds").notNull().default(300),
  feedKey: text("feed_key").notNull().default("gf-feed-key"),
  adminPassword: text("admin_password").notNull().default("zlato2026"),

  // --- Lead capture / zaključavanje cene ---
  lockEnabled: integer("lock_enabled", { mode: "boolean" }).notNull().default(true),
  /** Operator phone that receives the generated SMS. */
  contactPhone: text("contact_phone").notNull().default("+381621047693"),
  contactEmail: text("contact_email").notNull().default("office@goldenfeather.rs"),
  /** Allowed lock windows in minutes, comma separated. */
  lockMinuteOptions: text("lock_minute_options").notNull().default("30,60,360,720"),
  lockDefaultMinutes: integer("lock_default_minutes").notNull().default(60),
  /** Max total value (EUR) a client can self-lock; above it we mark as "na upit". */
  lockMaxTotalEur: real("lock_max_total_eur").notNull().default(20000),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type SpotSnapshot = typeof spotSnapshots.$inferSelect;
export type Settings = typeof settings.$inferSelect;
