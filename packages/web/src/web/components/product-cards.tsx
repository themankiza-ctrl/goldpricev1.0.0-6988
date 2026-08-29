import { Phone, Lock } from "lucide-react";
import { money, num } from "../lib/format";
import { cn } from "../lib/utils";
import type { LockTarget } from "./lock-dialog";

export type CardItem = {
  sku: string;
  name: string;
  category: string;
  metal: string;
  grossWeightG: number;
  fineness: number;
  onRequest: boolean;
  sellEur: number;
  sellRsd: number;
  buyEur: number;
  buyRsd: number;
  spreadPct: number;
  pricePerGramEur: number;
  vatPct: number;
  manufacturer: string | null;
  brandLogo: string | null;
  imageUrl: string | null;
  blurb: string | null;
};

const MASS_LABEL: Record<string, string> = {
  "31.1034768": "1 unca",
  "15.5517384": "1/2 unce",
  "7.7758692": "1/4 unce",
  "3.1103477": "1/10 unce",
};

function massLabel(grossWeightG: number) {
  const key = String(grossWeightG);
  return MASS_LABEL[key] ?? `${num(grossWeightG, grossWeightG < 10 ? 2 : 0)} g`;
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="num text-[9px] tracking-wider text-muted">{label}</p>
      <p className="num mt-0.5 truncate text-[12px] font-medium text-cream">{value}</p>
    </div>
  );
}

export default function ProductCards({
  items,
  currency,
  lockEnabled,
  phone,
  onLock,
}: {
  items: CardItem[];
  currency: "EUR" | "RSD";
  lockEnabled: boolean;
  phone?: string;
  onLock: (t: LockTarget) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p, idx) => (
        <article
          key={p.sku}
          className="rise panel group flex flex-col overflow-hidden transition-colors hover:border-gold/40"
          style={{ animationDelay: `${Math.min(idx, 12) * 35}ms` }}
        >
          <div className="relative aspect-4/3 overflow-hidden bg-white">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                loading="lazy"
                className="size-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="num flex size-full items-center justify-center text-[11px] text-ink/40">
                BEZ SLIKE
              </div>
            )}
            {p.brandLogo && (
              <div className="absolute top-2.5 left-2.5 flex h-7 items-center rounded-md bg-white/95 px-2 shadow-sm ring-1 ring-black/5">
                <img
                  src={p.brandLogo}
                  alt={p.manufacturer ?? ""}
                  loading="lazy"
                  className="h-4 w-auto max-w-[86px] object-contain"
                />
              </div>
            )}
            {p.onRequest ? (
              <span className="num absolute top-2.5 right-2.5 rounded-full bg-ink/85 px-2 py-1 text-[9px] font-medium tracking-wider text-warn">
                NA UPIT
              </span>
            ) : (
              <span className="num absolute top-2.5 right-2.5 rounded-full bg-ink/85 px-2 py-1 text-[9px] font-medium tracking-wider text-gold">
                {massLabel(p.grossWeightG)}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            {p.manufacturer && (
              <p className="num text-[9px] tracking-wider text-muted">
                {p.manufacturer.toUpperCase()}
              </p>
            )}
            <h3 className="mt-1 text-[14px] leading-snug font-semibold text-cream">{p.name}</h3>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-panel2/60 px-3 py-2.5">
              <Spec label="MASA" value={massLabel(p.grossWeightG)} />
              <Spec label="FINOĆA" value={num(p.fineness, 1)} />
              <Spec
                label="METAL"
                value={p.metal === "XAG" ? "Srebro" : "Zlato"}
              />
            </div>

            {p.blurb && (
              <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-muted">{p.blurb}</p>
            )}

            <div className="mt-auto pt-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="num text-[9px] tracking-wider text-muted">PRODAJA</p>
                  <p
                    className={cn(
                      "num font-semibold text-gold",
                      p.onRequest ? "text-[14px]" : "text-[17px]",
                    )}
                  >
                    {p.onRequest
                      ? "NA UPIT"
                      : money(currency === "EUR" ? p.sellEur : p.sellRsd, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-[9px] tracking-wider text-muted">OTKUP</p>
                  <p className="num text-[13px] font-semibold text-buy">
                    {money(currency === "EUR" ? p.buyEur : p.buyRsd, currency)}
                  </p>
                </div>
              </div>

              <div className="num mt-2 flex items-center justify-between text-[10px] text-muted">
                <span>spread {num(p.spreadPct, 1)}%</span>
                <span>
                  {p.vatPct > 0 ? `sa ${num(p.vatPct * 100, 0)}% PDV` : "bez PDV"}
                </span>
              </div>

              {lockEnabled && !p.onRequest ? (
                <button
                  type="button"
                  onClick={() =>
                    onLock({
                      sku: p.sku,
                      name: p.name,
                      sellEur: p.sellEur,
                      sellRsd: p.sellRsd,
                      buyEur: p.buyEur,
                      buyRsd: p.buyRsd,
                    })
                  }
                  className="num mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-2.5 text-[11px] font-semibold tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  <Lock className="size-3.5" /> ZAKLJUČAJ CENU
                </button>
              ) : (
                <a
                  href={`tel:${phone ?? ""}`}
                  className="num mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line px-3 py-2.5 text-[11px] font-semibold tracking-wider text-muted transition-colors hover:border-gold/40 hover:text-cream"
                >
                  <Phone className="size-3.5" /> POZOVITE NAS
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
