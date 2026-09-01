import { eq } from "drizzle-orm";
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
  { sku: "GF-BAR-1G", name: "Zlatna pločica 1g", category: "poluga", grossWeightG: 1, fineness: 999.9, sellMarginPct: 0.2, buyMarginPct: 0.14, sortOrder: 10 },
  { sku: "GF-BAR-2G", name: "Zlatna pločica 2g", category: "poluga", grossWeightG: 2, fineness: 999.9, sellMarginPct: 0.135, buyMarginPct: 0.07825, sortOrder: 20 },
  { sku: "GF-BAR-5G", name: "Zlatna pločica 5g", category: "poluga", grossWeightG: 5, fineness: 999.9, sellMarginPct: 0.093, buyMarginPct: 0.03835, sortOrder: 30 },
  { sku: "GF-BAR-10G", name: "Zlatna pločica 10g", category: "poluga", grossWeightG: 10, fineness: 999.9, sellMarginPct: 0.06, buyMarginPct: 0.0176, sortOrder: 40 },
  { sku: "GF-BAR-20G", name: "Zlatna pločica 20g", category: "poluga", grossWeightG: 20, fineness: 999.9, sellMarginPct: 0.05, buyMarginPct: 0.008, sortOrder: 50 },
  { sku: "GF-BAR-1OZ", name: "Zlatna pločica 1 unca", category: "poluga", grossWeightG: 31.1034768, fineness: 999.9, sellMarginPct: 0.05, buyMarginPct: 0.008, sortOrder: 60 },
  { sku: "GF-BAR-50G", name: "Zlatna pločica 50g", category: "poluga", grossWeightG: 50, fineness: 999.9, sellMarginPct: 0.044, buyMarginPct: 0.01268, sortOrder: 70 },
  { sku: "GF-BAR-100G", name: "Zlatna pločica 100g", category: "poluga", grossWeightG: 100, fineness: 999.9, sellMarginPct: 0.0355, buyMarginPct: 0.00443, sortOrder: 80 },
  { sku: "GF-BAR-250G", name: "Zlatna pločica 250g", category: "poluga", grossWeightG: 250, fineness: 999.9, sellMarginPct: 0.035, buyMarginPct: 0.00912, sortOrder: 90 },
  { sku: "GF-BAR-500G", name: "Zlatna pločica 500g", category: "poluga", grossWeightG: 500, fineness: 999.9, sellMarginPct: 0.034, buyMarginPct: 0.00815, sortOrder: 100, onRequest: true },
  { sku: "GF-BAR-1000G", name: "Zlatna pločica 1000g", category: "poluga", grossWeightG: 1000, fineness: 999.9, sellMarginPct: 0.03, buyMarginPct: 0.00425, sortOrder: 110, onRequest: true },

  // --- Dukati (986.0 — Franc Jozef) i kovanice (999.9) ---
  { sku: "GF-WP-1-10OZ", name: "Wiener Philharmoniker 1/10 unca", category: "kovanica", grossWeightG: 3.1103477, fineness: 999.9, sellMarginPct: 0.11, buyMarginPct: 0.0434, sortOrder: 200 },
  { sku: "GF-FJ-MALI", name: "Mali dukat Franc Jozef", category: "dukat", grossWeightG: 3.4909, fineness: 986, sellMarginPct: 0.1135, buyMarginPct: 0.04669, sortOrder: 210 },
  { sku: "GF-WP-1-4OZ", name: "Wiener Philharmoniker 1/4 unca", category: "kovanica", grossWeightG: 7.7758692, fineness: 999.9, sellMarginPct: 0.085, buyMarginPct: 0.03075, sortOrder: 220 },
  { sku: "GF-FJ-VELIKI", name: "Veliki dukat Franc Jozef", category: "dukat", grossWeightG: 13.9636, fineness: 986, sellMarginPct: 0.082, buyMarginPct: 0.0279, sortOrder: 230 },
  { sku: "GF-WP-1-2OZ", name: "Wiener Philharmoniker 1/2 unca", category: "kovanica", grossWeightG: 15.5517384, fineness: 999.9, sellMarginPct: 0.07, buyMarginPct: 0.02185, sortOrder: 240 },
  { sku: "GF-WP-1OZ", name: "Wiener Philharmoniker 1 unca", category: "kovanica", grossWeightG: 31.1034768, fineness: 999.9, sellMarginPct: 0.063, buyMarginPct: 0.02048, sortOrder: 250 },

  // --- Srebro: nije investiciono zlato, ide sa 20% PDV ---
  { sku: "GF-AG-WP-1OZ", name: "Wiener Philharmoniker srebro 1 unca", category: "srebro", metal: "XAG", grossWeightG: 31.1034768, fineness: 999, sellMarginPct: 0.2528, buyMarginPct: -0.15, vatPct: 0.2, sortOrder: 300 },
];

/**
 * Card metadata: refinery/mint, logo, product photo and a short Serbian blurb.
 * Kept separate from pricing so it can be backfilled onto an existing database.
 */
const BRAND = {
  valcambi: { manufacturer: "Valcambi Suisse", brandLogo: "/images/brands/valcambi.png" },
  argor: { manufacturer: "Argor-Heraeus", brandLogo: "/images/brands/argor-heraeus.png" },
  heraeus: { manufacturer: "Heraeus", brandLogo: "/images/brands/heraeus.png" },
  munze: { manufacturer: "Münze Österreich", brandLogo: "/images/brands/munze-osterreich.png" },
} as const;

const IMG = {
  malaPlocica: "/images/products/valcambi-mala-plocica.jpg",
  kinebar: "/images/products/argor-kinebar.jpg",
  heraeusPoluga: "/images/products/heraeus-poluga.jpg",
  livena: "/images/products/valcambi-livena-poluga.jpg",
  wpZlato: "/images/products/wp-zlato.jpg",
  wpSrebro: "/images/products/wp-srebro.jpg",
  dukat: "/images/products/dukat-franc-jozef.jpg",
  argor2g: "/images/products/argor-2g.jpg",
  argor20g: "/images/products/argor-20g.jpg",
  argor50g: "/images/products/argor-50g.jpg",
  argor1oz: "/images/products/argor-1oz.jpg",
  valcambi250g: "/images/products/valcambi-250g.jpg",
  valcambiBlister: "/images/products/valcambi-blister-mala.jpg",
  valcambi50gBlister: "/images/products/valcambi-50g-blister.jpg",
  heraeusBlister: "/images/products/heraeus-blister.jpg",
  munzePlocica: "/images/products/munze-plocica.jpg",
} as const;

/** Extra card-slider photos per SKU (first frame is always imageUrl). */
const GALLERY: Record<string, string[]> = {
  "GF-BAR-1G": [IMG.valcambiBlister, IMG.munzePlocica],
  "GF-BAR-2G": [IMG.argor2g, IMG.valcambiBlister],
  "GF-BAR-5G": [IMG.valcambiBlister, IMG.munzePlocica],
  "GF-BAR-10G": [IMG.heraeusBlister, IMG.valcambiBlister],
  "GF-BAR-20G": [IMG.argor20g, IMG.heraeusBlister],
  "GF-BAR-1OZ": [IMG.argor1oz, IMG.valcambi50gBlister],
  "GF-BAR-50G": [IMG.argor50g, IMG.valcambi50gBlister],
  "GF-BAR-100G": [IMG.valcambi250g, IMG.valcambi50gBlister],
  "GF-BAR-250G": [IMG.valcambi250g, IMG.argor50g],
  "GF-BAR-500G": [IMG.valcambi250g],
  "GF-BAR-1000G": [IMG.valcambi250g],
};

const META: Record<string, { manufacturer: string; brandLogo: string; imageUrl: string; blurb: string }> = {
  "GF-BAR-1G": { ...BRAND.valcambi, imageUrl: IMG.malaPlocica, blurb: "Najmanji format investicionog zlata, finoće 999,9 — ulaz u zlato bez velikog početnog kapitala. Dolazi zavarena u originalnoj Valcambi kartici sa serijskim brojem i certifikatom. Idealna za poklon i za postepeno građenje rezerve gram po gram." },
  "GF-BAR-2G": { ...BRAND.valcambi, imageUrl: IMG.malaPlocica, blurb: "Pločica od 2 g u zavarenoj kartici sa certifikatom, finoća 999,9. Nešto niža marža po gramu od jednogramske, a zadržava maksimalnu deljivost rezerve. Najčešći izbor za prvi ozbiljniji korak u investiciono zlato." },
  "GF-BAR-5G": { ...BRAND.valcambi, imageUrl: IMG.malaPlocica, blurb: "Pet grama zlata finoće 999,9 u originalnom zaštitnom pakovanju sa serijskim brojem. Dobar balans između cene po gramu i mogućnosti da rezervu prodaješ u malim delovima. Lako se čuva i lako preprodaje na celom tržištu EU." },
  "GF-BAR-10G": { ...BRAND.argor, imageUrl: IMG.kinebar, blurb: "Argor-Heraeus Kinebar® — švajcarska poluga od 10 g sa holografskom zaštitom od falsifikovanja, finoća 999,9. Zavarena u certifikovanoj kartici sa potpisom ovlašćenog probirača. Jedan od najlikvidnijih formata na evropskom tržištu." },
  "GF-BAR-20G": { ...BRAND.argor, imageUrl: IMG.kinebar, blurb: "Dvadeset grama švajcarskog zlata finoće 999,9 iz Argor-Heraeus rafinerije, LBMA Good Delivery standard. Kinebar holografska zaštita čini je jednom od najsigurnijih poluga za privatno čuvanje. Marža po gramu je znatno niža nego kod malih gramaža." },
  "GF-BAR-1OZ": { ...BRAND.heraeus, imageUrl: IMG.heraeusPoluga, blurb: "Troj unca (31,1035 g) zlata finoće 999,9 — svetski standardna jedinica u kojoj se kotira berzanska cena. Zbog toga se najlakše upoređuje sa spotom i najbrže prodaje bilo gde u svetu. Dolazi u originalnom zavarenom pakovanju sa certifikatom." },
  "GF-BAR-50G": { ...BRAND.heraeus, imageUrl: IMG.heraeusPoluga, blurb: "Pedeset grama zlata finoće 999,9 iz nemačke Heraeus rafinerije, sa serijskim brojem i certifikatom. Prelazak u srednje gramaže gde marža po gramu značajno pada. Namenjena kupcu koji gradi rezervu, a ne trguje na kratko." },
  "GF-BAR-100G": { ...BRAND.valcambi, imageUrl: IMG.livena, blurb: "Sto grama investicionog zlata finoće 999,9 — jedan od najboljih odnosa cene po gramu i praktičnosti čuvanja. Livena poluga sa utisnutim serijskim brojem, težinom i finoćom, u zaštitnom pakovanju. Standardni format u sefovima i privatnim trezorima." },
  "GF-BAR-250G": { ...BRAND.valcambi, imageUrl: IMG.livena, blurb: "Poluga od 250 g finoće 999,9, LBMA priznata rafinerija. Marža po gramu je među najnižim u ponudi, pa je namenjena većim, dugoročnim ulaganjima. Preporučujemo čuvanje u sefu ili trezoru sa osiguranjem." },
  "GF-BAR-500G": { ...BRAND.valcambi, imageUrl: IMG.livena, blurb: "Pola kilograma zlata finoće 999,9 — format za ozbiljne portfolio pozicije. Cena se ugovara telefonom jer zavisi od trenutne dostupnosti i berzanskog kursa u momentu uplate. Isporuka uz zapisnik i certifikat rafinerije." },
  "GF-BAR-1000G": { ...BRAND.valcambi, imageUrl: IMG.livena, blurb: "Kilogramska poluga, finoća 999,9 — najniža marža po gramu u celoj ponudi. Isključivo po dogovoru: cena i rok isporuke se fiksiraju direktno sa nama, uz zaključenje po aktuelnom spotu. Standard za institucionalne i porodične rezerve." },
  "GF-WP-1-10OZ": { ...BRAND.munze, imageUrl: IMG.wpZlato, blurb: "Wiener Philharmoniker 1/10 unce (3,11 g) — najprodavanija zlatna kovanica u Evropi, finoća 999,9. Zvanično sredstvo plaćanja Republike Austrije, pa uživa dodatno poverenje na tržištu. Najpristupačniji način da se uđe u zlatne kovanice." },
  "GF-FJ-MALI": { ...BRAND.munze, imageUrl: IMG.dukat, blurb: "Mali dukat Franc Jozef, 3,49 g finoće 986,0 — klasika srpskog i austrijskog tržišta zlata. Tradicionalni poklon za svadbe, krštenja i rođenja, uz stalnu tražnju i lak otkup. Kupuje se i prodaje po ceni koja prati berzansku vrednost zlata." },
  "GF-WP-1-4OZ": { ...BRAND.munze, imageUrl: IMG.wpZlato, blurb: "Četvrtina unce (7,78 g) austrijske Filharmonije, finoća 999,9, kovana u Münze Österreich. Motiv orgulja Zlatne sale Bečke filharmonije poznat je kolekcionarima i investitorima širom sveta. Odličan kompromis između deljivosti i cene po gramu." },
  "GF-FJ-VELIKI": { ...BRAND.munze, imageUrl: IMG.dukat, blurb: "Veliki dukat Franc Jozef, 13,96 g finoće 986,0 — četvorostruki dukat, najtraženiji format na domaćem tržištu. Kombinuje investicionu i numizmatičku vrednost, sa vekovnom reputacijom. Uvek likvidan: otkupljujemo ga po dnevnoj berzanskoj ceni." },
  "GF-WP-1-2OZ": { ...BRAND.munze, imageUrl: IMG.wpZlato, blurb: "Pola unce (15,55 g) zlata finoće 999,9 u najpoznatijoj evropskoj kovanici. Nominalna vrednost u evrima i garancija austrijske državne kovnice. Format za kupca koji želi veću poziciju, a da zadrži mogućnost delimične prodaje." },
  "GF-WP-1OZ": { ...BRAND.munze, imageUrl: IMG.wpZlato, blurb: "Jedna troj unca (31,1035 g) finoće 999,9 — referentni format zlatnih kovanica u svetu. Filharmonija se prodaje i otkupljuje na svim većim tržištima, uz najmanji spread u klasi kovanica. Isporučuje se u zaštitnoj kapsuli ili originalnom tubusu." },
  "GF-AG-WP-1OZ": { ...BRAND.munze, imageUrl: IMG.wpSrebro, blurb: "Srebrna Filharmonija, 1 unca finoće 999,0 — najlikvidnija srebrna kovanica u Evropi. Na srebro se, za razliku od investicionog zlata, obračunava PDV od 20%, što je već uračunato u prikazanu cenu. Popularna kao ulaz u plemenite metale sa malim budžetom." },
};

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

  // Backfill card metadata onto rows that predate it (never overwrites operator edits).
  const rows = await db
    .select({
      sku: products.sku,
      manufacturer: products.manufacturer,
      blurb: products.blurb,
      gallery: products.gallery,
      imageUrl: products.imageUrl,
    })
    .from(products);
  let patched = 0;
  for (const row of rows) {
    const meta = META[row.sku];
    if (!meta) continue;
    const extra = GALLERY[row.sku];
    const galleryValue = extra
      ? [row.imageUrl ?? meta.imageUrl, ...extra].filter((v, i, a) => a.indexOf(v) === i).join(",")
      : null;
    const needsGallery = Boolean(galleryValue) && !row.gallery;
    if (row.manufacturer && row.blurb && !needsGallery) continue;
    await db
      .update(products)
      .set({
        manufacturer: row.manufacturer ?? meta.manufacturer,
        brandLogo: meta.brandLogo,
        imageUrl: row.imageUrl ?? meta.imageUrl,
        blurb: row.blurb ?? meta.blurb,
        gallery: row.gallery ?? galleryValue,
      })
      .where(eq(products.sku, row.sku));
    patched += 1;
  }
  if (patched > 0) console.log(`[seed] backfilled card metadata on ${patched} products`);

  const cfg = await db.select({ id: settings.id }).from(settings).limit(1);
  if (cfg.length === 0) {
    await db.insert(settings).values({ id: 1 });
    console.log("[seed] inserted default settings");
  }
}
