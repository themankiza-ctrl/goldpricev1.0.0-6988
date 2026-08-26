import { useState } from "react";
import { ArrowLeftRight, Scale, Coins } from "lucide-react";
import { usePriceList, useQuote, useSpot } from "../queries/market";
import { eur, num, pct, rsd } from "../lib/format";
import { cn } from "../lib/utils";

const PRESETS = [
  { label: "999.9 (pločica)", value: 999.9 },
  { label: "986 (dukat)", value: 986 },
  { label: "916 (22k)", value: 916 },
  { label: "750 (18k)", value: 750 },
  { label: "585 (14k)", value: 585 },
  { label: "375 (9k)", value: 375 },
];

export default function Kalkulator() {
  const [metal, setMetal] = useState<"XAU" | "XAG">("XAU");
  const [weight, setWeight] = useState("10");
  const [fineness, setFineness] = useState(999.9);
  const [sku, setSku] = useState<string>("");

  const list = usePriceList();
  const spot = useSpot();
  const quote = useQuote({
    metal,
    weightG: Number(weight) || 0,
    fineness,
    sku: sku || undefined,
  });

  const p = quote.data?.price;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <p className="num text-[11px] tracking-wider text-muted">KALKULATOR</p>
      <h1 className="display mt-2 text-[clamp(2rem,5vw,3.5rem)] font-extrabold">
        Koliko vredi
        <span className="text-cream/30"> tačno ovoliko.</span>
      </h1>
      <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-muted">
        Unesi bruto težinu i finoću — kalkulator računa čisto zlato, primenjuje istu maržu kao
        cenovnik i vraća prodajnu i otkupnu cenu u EUR i RSD.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="panel h-fit p-6">
          <div className="flex rounded-full border border-line bg-panel2 p-1">
            {(["XAU", "XAG"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMetal(m);
                  setFineness(m === "XAG" ? 999 : 999.9);
                }}
                className={cn(
                  "num flex-1 rounded-full py-2 text-[12px] font-medium transition-colors",
                  metal === m ? "bg-gold text-ink" : "text-muted hover:text-cream",
                )}
              >
                {m === "XAU" ? "ZLATO" : "SREBRO"}
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="num text-[10px] tracking-wider text-muted">BRUTO TEŽINA (g)</span>
            <input
              aria-label="Bruto težina u gramima"
              className="field mt-2 text-lg"
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>

          <div className="mt-5">
            <span className="num text-[10px] tracking-wider text-muted">FINOĆA</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESETS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFineness(f.value)}
                  className={cn(
                    "num rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors",
                    fineness === f.value
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-line text-muted hover:text-cream",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              aria-label="Finoća"
              className="field mt-2"
              type="number"
              min="1"
              max="1000"
              step="0.1"
              value={fineness}
              onChange={(e) => setFineness(Number(e.target.value))}
            />
          </div>

          <label className="mt-5 block">
            <span className="num text-[10px] tracking-wider text-muted">
              MARŽA PO PROIZVODU (opciono)
            </span>
            <select
              className="field mt-2"
              value={sku}
              onChange={(e) => {
                const value = e.target.value;
                setSku(value);
                const found = list.data?.items.find((i) => i.sku === value);
                if (found) {
                  setFineness(found.fineness);
                  setWeight(String(found.grossWeightG));
                  setMetal(found.metal === "XAG" ? "XAG" : "XAU");
                }
              }}
            >
              <option value="">Standardna marža (8%)</option>
              {list.data?.items.map((i) => (
                <option key={i.sku} value={i.sku}>
                  {i.name} — {pct(i.sellMarginPct, 1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-4">
          {quote.isLoading ? (
            <div className="panel h-56 animate-pulse" />
          ) : !p ? (
            <div className="panel p-8 text-sm text-muted">Unesi težinu za obračun.</div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="panel border-gold/30 bg-gold/[0.04] p-6">
                  <p className="num text-[10px] tracking-wider text-gold">PRODAJEMO KLIJENTU</p>
                  <p className="num mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-gold">
                    {rsd(p.sellRsd)}
                  </p>
                  <p className="num mt-1 text-[13px] text-muted">{eur(p.sellEur)}</p>
                  <p className="num mt-4 border-t border-line pt-3 text-[11px] text-muted">
                    marža {pct(p.effectiveSellMarginPct, 2)}
                    {p.vatPct > 0 && ` · PDV ${pct(p.vatPct, 0)}`}
                  </p>
                </div>

                <div className="panel border-buy/25 bg-buy/[0.03] p-6">
                  <p className="num text-[10px] tracking-wider text-buy">OTKUPLJUJEMO OD KLIJENTA</p>
                  <p className="num mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-buy">
                    {rsd(p.buyRsd)}
                  </p>
                  <p className="num mt-1 text-[13px] text-muted">{eur(p.buyEur)}</p>
                  <p className="num mt-4 border-t border-line pt-3 text-[11px] text-muted">
                    diskont {pct(p.buyMarginPct, 2)} · bazni spot, bez premija
                  </p>
                </div>
              </div>

              <div className="panel p-6">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="size-4 text-muted" />
                  <p className="num text-[10px] tracking-wider text-muted">RAZLAGANJE</p>
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  <Item
                    icon={<Scale className="size-3.5" />}
                    label="Bruto težina"
                    value={`${num(p.grossWeightG, 4)} g`}
                  />
                  <Item
                    icon={<Coins className="size-3.5" />}
                    label="Čisto zlato u proizvodu"
                    value={`${num(p.fineWeightG, 4)} g`}
                  />
                  <Item
                    label="Spot baza"
                    value={`${num(quote.data?.baseEurPerGram ?? 0, 2)} €/g`}
                  />
                  <Item
                    label="Prodajna cena po gramu"
                    value={`${num(p.pricePerGramEur, 2)} €/g`}
                  />
                  <Item label="Spread prodaja/otkup" value={`${num(p.spreadPct, 2)}%`} />
                  <Item
                    label="Kurs EUR/RSD"
                    value={num(quote.data?.eurRsdMiddle ?? 0, 4)}
                  />
                </dl>
                {spot.data?.data && spot.data.data.totalModifierPct > 0 && (
                  <p className="num mt-5 rounded-xl bg-gold/10 px-4 py-3 text-[11px] leading-relaxed text-gold">
                    Aktivna korekcija rizika +{pct(spot.data.data.totalModifierPct)} primenjena je
                    samo na prodajnu stranu.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line/60 pb-2">
      <dt className="flex items-center gap-2 text-[12px] text-muted">
        {icon}
        {label}
      </dt>
      <dd className="num text-[13px] font-medium">{value}</dd>
    </div>
  );
}
