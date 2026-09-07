/**
 * Google Ads / GA4 konverzije.
 *
 * Ništa se ne učitava i ništa se ne šalje dok ID-jevi nisu upisani u .env —
 * sajt radi normalno i bez njih, funkcije samo tiho ne urade ništa.
 *
 * .env:
 *   VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX          (Google Ads tag)
 *   VITE_GA4_ID=G-XXXXXXXXXX                  (opciono, GA4)
 *   VITE_CONV_POZIV=AW-XXXXXXXXXX/oznaka      (konverzija: klik na broj telefona)
 *   VITE_CONV_ZAKLJUCAJ=AW-XXXXXXXXXX/oznaka  (konverzija: poslat zahtev za zaključavanje)
 */

const ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim() || "";
const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim() || "";
const CONV_POZIV = (import.meta.env.VITE_CONV_POZIV as string | undefined)?.trim() || "";
const CONV_ZAKLJUCAJ = (import.meta.env.VITE_CONV_ZAKLJUCAJ as string | undefined)?.trim() || "";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let booted = false;

/** Ubacuje gtag.js jednom, pri prvoj upotrebi. Bez ID-a ne radi ništa. */
export function initTracking(): void {
  if (booted || typeof window === "undefined") return;
  const primary = ADS_ID || GA4_ID;
  if (!primary) return;
  booted = true;

  window.dataLayer = window.dataLayer || [];
  const gtag: Gtag = (...args) => {
    window.dataLayer?.push(args);
  };
  window.gtag = gtag;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primary)}`;
  document.head.appendChild(s);

  gtag("js", new Date());
  if (ADS_ID) gtag("config", ADS_ID);
  if (GA4_ID) gtag("config", GA4_ID);
}

function send(name: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  initTracking();
  window.gtag?.("event", name, params);
}

/** Klik na broj telefona — bilo gde na sajtu. */
export function trackCall(source: string): void {
  if (CONV_POZIV) send("conversion", { send_to: CONV_POZIV, gf_source: source });
  send("klik_na_telefon", { gf_source: source });
}

/** Zahtev za zaključavanje cene je uspešno sačuvan. */
export function trackLock(input: {
  value: number;
  currency: "EUR" | "RSD";
  reference: string;
  source: string;
}): void {
  const params = {
    value: Math.round(input.value),
    currency: input.currency,
    transaction_id: input.reference,
    gf_source: input.source,
  };
  if (CONV_ZAKLJUCAJ) send("conversion", { send_to: CONV_ZAKLJUCAJ, ...params });
  send("zakljucavanje_cene", params);
}

/** Da li je merenje uopšte uključeno — koristi admin panel da to prikaže. */
export const trackingEnabled = Boolean(ADS_ID || GA4_ID);
export const trackingIds = {
  ads: ADS_ID,
  ga4: GA4_ID,
  convCall: CONV_POZIV,
  convLock: CONV_ZAKLJUCAJ,
};
