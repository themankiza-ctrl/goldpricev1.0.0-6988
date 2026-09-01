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

## Embed widget (ugradnja na goldenfeather.rs)
- `src/web/pages/embed.tsx` — standalone widget bez chrome-a; parametri `theme`, `currency`, `buy=0`, `only=poluga,kovanica,dukat,srebro`.
- Javlja visinu hostu preko `postMessage({type:"gf-embed-height",height})` + ResizeObserver → nema unutrašnjeg skrola.
- `styles.css` — dodat `.gf-light` scope (light varijanta tokena).
- `app.tsx` — `/embed` ruta izvučena van `<Layout>`; ostale rute ostaju u Layout-u.
- Uputstvo za WordPress: `/home/user/goldenfeather-embed/content.md`.
- Verifikovano: lint 0 grešaka, build prolazi, `/embed?theme=light` → 200, screenshot potvrđuje render.

## Zaključavanje cene / rezervacije (29.08.2026)
- schema.ts: nova tabela `price_locks` (ref GF-XXXX, proizvod, količina, zamrznute cene EUR+RSD, spot i kurs u trenutku, strana kupovina/prodaja, podaci klijenta, trajanje, status, source, expiresAt) — db:push OK.
- settings: `lockEnabled`, `contactPhone` (+381621047693), `contactEmail` (office@prodajazlata.com — potvrdio operater 01.09.2026), `lockMinuteOptions` (30,60,360,720), `lockDefaultMinutes` (60), `lockMaxTotalEur` (20000).
- routes/locks.ts: `config` (javno), `create` (javno, cena se PONOVO računa na serveru — klijent ne može da podmetne cenu; limiti: trajanje iz liste, proizvod aktivan i nije NA UPIT, total <= lockMaxTotalEur), `byRef` (javna provera statusa), `list`/`setStatus`/`purge` (admin ključ). `expireStale()` automatski prebacuje istekle u `istekao`.
- queries/locks.ts + components/lock-dialog.tsx: modal (kupujem/prodajem, količina, trajanje, ime/telefon/email/napomena) → posle uspeha prikazuje šifru GF-XXXX, rok i `sms:` link sa unaprijed napisanom porukom na contactPhone.
- pages/index.tsx: kolona REZERVACIJA (ZAKLJUČAJ / POZOVITE za NA UPIT).
- pages/embed.tsx: novi parametar `lock` (`lock=0` skriva CTA) + kolona CENA sa istim dugmetom → widget hvata lead-ove.
- pages/admin.tsx: novi tab "Rezervacije" (filteri po statusu, brojač aktivnih, Potvrdi/Otkaži, čišćenje isteklih) + kartica "Zaključavanje cene" u Pravilima cena.
- Verifikovano: lint 0, build OK, `locks/config` 200, `locks/create` kreira GF-XQTL, `locks/list` sa x-admin-key vraća redove; screenshot `/` i `/embed?theme=light` pokazuju novu kolonu.
- Git: commit-ovan i push-ovan na github.com/themankiza-ctrl/goldpricev1.0.0-6988 (branch main).

## Kartice proizvoda (29.08.2026)
- schema.ts: `products` dobio nullable kolone `manufacturer`, `brand_logo`, `image_url`, `blurb` — db:push OK.
- seed.ts: META mapa za svih 18 SKU-ova (proizvođač, logo, slika, srpski opis 2-3 rečenice) + backfill koji popunjava samo prazna polja, nikad ne prepisuje operaterove izmene.
- pricing.ts: `ProductPrice` i `priceProduct()` vraćaju nova 4 polja (prices/list ih automatski prosleđuje).
- Slike u `packages/web/public/images/products/` (7 fotografija, 700x700, bela podloga) i `public/images/brands/` (4 logotipa: Argor-Heraeus, Valcambi, Heraeus, Münze Österreich).
- Nova komponenta `components/product-cards.tsx`: grid 4 u redu (xl), slika 4:3, logo brenda, pill sa masom / NA UPIT, spec traka MASA/FINOĆA/METAL, opis (3 linije), PRODAJA + OTKUP, spread i PDV, dugme ZAKLJUČAJ CENU (ili POZOVITE NAS za NA UPIT).
- index.tsx: novi prekidač Kartice / Tabela (localStorage `gf-view`, default Kartice); tabela ostaje nepromenjena.
- Verifikovano: lint 0, build OK, prices/list vraća manufacturer/imageUrl/blurb za sve proizvode, screenshot potvrđuje 4 kartice u redu sa slikama.
- Embed widget ostaje tabelarni.

## Rezervacije preko telefona + slider proizvođača (29.08.2026)
- lock-dialog.tsx: email polje uklonjeno (rezervacija ide isključivo preko broja telefona); posle uspešne rezervacije tri kanala — SMS, VIBER (`viber://chat?number=...&draft=...`) i WHATSAPP (`https://wa.me/<digits>?text=...`) sa istom unaprijed napisanom porukom, plus dugme POZOVI.
- Novi `components/brand-slider.tsx`: auto slider (5 s, pauza na hover, klik na točkice), po jedan slajd za svakog proizvođača — Argor-Heraeus, Valcambi, Heraeus, Münze Österreich; slika + logo na beloj podlozi + zemlja + kratak tekst + CTA ka cenovniku.
- index.tsx: slider ubačen između risk panela i cenovnika.
- Verifikovano: lint 0, build OK, screenshot potvrđuje slajder i logo.

## Izbacen risk panel + novi telefon + Yahoo spot izvor (01.09.2026)
- pages/index.tsx: cela sekcija RISK ENGINE (`RiskPanel`) i njen mount izbaceni; ociscen import (`ArrowUpRight`, `clock/eur/money/num`, `ICONS` uklonjen). Hero i dalje koristi `useSpot()`.
- VAZNO: pravila (vikend / volatilnost / gap) i dalje rade u pricing engine-u i menjaju se u /admin → Pravila cena — sa sajta je izbacen samo prikaz.
- schema.ts: default `contactPhone` = +381621047693; postojeci red u Turso bazi azuriran preko `admin/updateSettings` (verifikovano `locks/config` → "+381621047693"). SMS/Viber/WhatsApp linkovi u lock-dialog-u automatski koriste novi broj.
- feeds.ts: dodat treci live izvor — Yahoo Finance COMEX (`GC=F` za zlato, `SI=F` za srebro). Lanac: gold-api.com → Swissquote → Yahoo Finance → poslednji snapshot (STALE).
- queries/market.ts: `useSpot` i `usePriceList` osvezavaju na 15 s (bilo 30 s).
- Napomena: prilozeni public-apis .zip nije sadrzao README sa spiskom API-ja (samo scripts/ i licenca), pa je izvor izabran rucno.
- Verifikovano: lint 0, build OK, `/` 200, `spot/current` → LIVE, screenshot potvrdjuje da RISK ENGINE sekcije nema a slider i kartice rade.

## Auto-slider slika u svakoj kartici (01.09.2026)
- 9 novih fotografija ubaceno u `public/images/products/` (normalizovane na 800x800, bela podloga): argor-2g/20g/50g/1oz, valcambi-250g, valcambi-blister-mala, valcambi-50g-blister, heraeus-blister, munze-plocica.
- schema.ts: `products` dobio nullable kolonu `gallery` (putanje razdvojene zapetama) — db:push OK.
- seed.ts: `GALLERY` mapa po SKU-u za sve poluge/plocice + backfill koji popunjava `gallery` samo ako je prazna (nikad ne prepisuje operaterove izmene). Prvi kadar je uvek `imageUrl`.
- pricing.ts: `ProductPrice.gallery: string[]` (parsira listu iz baze).
- components/product-cards.tsx: novi `CardSlider` — kadrovi se cross-fade smenjuju svakih 3,5 s, staggered po kartici (idx % 4 * 550 ms) da se cela mreza ne prevrce istovremeno, pauza na hover, tackice za rucno prebacivanje. Kartice bez galerije prikazuju jednu sliku bez tackica.
- Kovanice i dukati za sada imaju po jednu fotografiju (nema dodatnih slika) — slider se automatski gasi kad ima 1 kadar.
- Verifikovano: lint 0, build OK, `/` 200, `prices/list` vraca po 3 kadra za poluge, screenshot potvrdjuje slider i tackice u karticama.
