# Golden Feather Pricing Engine — progress

App: /home/user/goldprice (managed template, web only, port 4200)

## Done
- design.md (Nova-inspired: gold #F5C518 / black, Bricolage Grotesque + Plus Jakarta Sans + JetBrains Mono)
- schema.ts: products, spot_snapshots, price_history, settings (single row) — db:push OK
- lib/pricing.ts, lib/feeds.ts, lib/market.ts, lib/seed.ts (18 proizvoda, marže iz Apr 2026 liste)
- routes/spot.ts, routes/prices.ts, routes/admin.ts (x-admin-key gate)
- index.ts: router + 3 feed rute (prices.json, woocommerce.csv, shopify.csv) + seed on boot
- Frontend: layout + status pill, pages: index (cenovnik), kalkulator, admin (5 tabova)
- api.ts šalje x-admin-key iz localStorage
- app.tsx rute: / , /kalkulator , /admin + 404, sve u <Layout>
- bun run lint: 0 grešaka; bun run build: OK
- dev server radi na 4200; feedovi vraćaju žive cene, 401 na pogrešan ključ

## Verifikovano uživo (26.08.2026)
- gold-api.com XAU 4617.60 USD, EUR/USD 1.1662, NBS EUR/RSD 117.3838 — status LIVE
- /api/feed/prices.json?key=gf-feed-key -> 18 proizvoda
- /api/feed/woocommerce.csv -> CSV sa RSD cenama
- admin.settings sa x-admin-key: zlato2026 -> 200

## Decisions
- Admin = single password from settings (no Better Auth) — internal tool, one operator
- Buy side NEVER gets weekend/vol markup (base spot only)
- Silver 20% PDV, gold investment = exempt
