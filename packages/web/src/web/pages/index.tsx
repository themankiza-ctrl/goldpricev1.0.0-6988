import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Clock3, Activity, ShieldAlert, Layers } from "lucide-react";
import { useSpot, usePriceList } from "../queries/market";
import { clock, eur, money, num, pct } from "../lib/format";
import { cn } from "../lib/utils";
import LockDialog, { type LockTarget } from "../components/lock-dialog";
import ProductCards, { type CardItem } from "../components/product-cards";
import { useLockConfig } from "../queries/locks";

type Currency = "EUR" | "RSD";
type View = "kartice" | "tabela";

const ICONS = { weekend: Clock3, volatility: Activity, gap: ShieldAlert } as const;

function useFlashOnChange(value: number | undefined) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== undefined && value !== undefined && prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  useEffect(() => {
    prev.current = value;
  }, [value]);
  return flash;
}

function Hero() {
  const spot = useSpot();
  const d = spot.data?.data;
  const flash = useFlashOnChange(d?.baseEurPerGram);

  return (
    <section className="relative overflow-hidden bg-gold text-ink rounded-br-[96px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #0a0a0a 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-6 pt-16 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24 lg:pb-28">
        <div>
          <span className="rise num inline-flex items-center gap-2 rounded-full border border-ink/20 px-3 py-1 text-[11px] font-medium tracking-wider">
            <span className="size-1.5 rounded-full bg-ink live-dot" />
            LIVE SPOT ENGINE
          </span>
          <h1 className="display mt-6 text-[clamp(3rem,9vw,6.5rem)] font-extrabold">
            <span className="rise block" style={{ animationDelay: "60ms" }}>
              CENA KOJA
            </span>
            <span
              className="rise block text-ink/35"
              style={{ animationDelay: "140ms" }}
            >
              PRATI BERZU
            </span>
          </h1>
          <p
            className="rise mt-6 max-w-md text-[15px] leading-relaxed text-ink/70"
            style={{ animationDelay: "220ms" }}
          >
            Prodajne i otkupne cene se računaju iz live XAU spota, zvaničnog kursa NBS-a i
            automatskih pravila za rizik. Bez ručnog unosa, bez tabela koje pucaju.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
            <Link
              to="/kalkulator"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Otvori kalkulator <ArrowUpRight className="size-4" />
            </Link>
            <a
              href="#cenovnik"
              className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-5 py-3 text-[13px] font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              Ceo cenovnik
            </a>
          </div>
        </div>

        <div
          className="rise self-end rounded-[26px] border border-ink/15 bg-ink/5 p-6 backdrop-blur-sm"
          style={{ animationDelay: "180ms" }}
        >
          <p className="num text-[11px] font-medium tracking-wider text-ink/60">
            SPOT ZLATA — BAZA ZA SVE CENE
          </p>
          {spot.isLoading ? (
            <div className="mt-4 h-24 animate-pulse rounded-2xl bg-ink/10" />
          ) : d ? (
            <>
              <p
                className={cn(
                  "num mt-3 rounded-xl text-[clamp(2rem,5vw,3rem)] font-bold leading-none",
                  flash && "flash",
                )}
              >
                {num(d.baseEurPerGram)} <span className="text-[0.4em] text-ink/60">€ / g</span>
              </p>
              <div className="num mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
                <Row label="XAU/USD" value={`$${num(d.xauUsd)}`} />
                <Row label="EUR/USD" value={num(d.eurUsd, 4)} />
                <Row label="XAU/EUR unca" value={`${num(d.xauEurPerOunce)} €`} />
                <Row label="EUR/RSD (NBS)" value={num(d.eurRsdMiddle, 4)} />
                <Row label="Spot RSD/g" value={num(d.baseRsdPerGram, 0)} />
                <Row label="Ažurirano" value={clock(d.updatedAt)} />
              </div>
              <p className="num mt-4 border-t border-ink/15 pt-3 text-[10px] leading-relaxed text-ink/50">
                {d.sources.gold} · {d.sources.fx} · {d.sources.rsd}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink/70">
              Nijedan izvor trenutno nije dostupan. Cene su zamrznute na poslednjoj poznatoj
              vrednosti.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-wider text-ink/50">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function RiskPanel() {
  const spot = useSpot();
  const d = spot.data?.data;
  if (!d) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="num text-[11px] tracking-wider text-muted">RISK ENGINE</p>
          <h2 className="display mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-bold">
            Marža se prilagođava.
            <span className="block text-cream/30">Otkup nikad ne.</span>
          </h2>
        </div>
        <div className="hidden text-right sm:block">
          <p className="num text-[11px] tracking-wider text-muted">UKUPNA KOREKCIJA</p>
          <p className="num text-3xl font-bold text-gold">+{pct(d.totalModifierPct)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {d.modifiers.map((m) => {
          const Icon = ICONS[m.key as keyof typeof ICONS] ?? Layers;
          return (
            <div
              key={m.key}
              className={cn(
                "panel p-5 transition-colors",
                m.active && "border-gold/40 bg-gold/[0.04]",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl bg-panel2",
                    m.active && "bg-gold/15",
                  )}
                >
                  <Icon className={cn("size-[18px]", m.active ? "text-gold" : "text-muted")} />
                </span>
                <span
                  className={cn(
                    "num rounded-full px-2.5 py-1 text-[11px] font-medium",
                    m.active ? "bg-gold text-ink" : "bg-panel2 text-muted",
                  )}
                >
                  {m.key === "gap" ? (m.active ? "HOLD" : "OK") : `+${pct(m.pct)}`}
                </span>
              </div>
              <p className="mt-4 text-[14px] font-semibold">{m.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{m.note}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PriceTable() {
  const list = usePriceList();
  const lockCfg = useLockConfig();
  const [lockTarget, setLockTarget] = useState<LockTarget | null>(null);
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === "undefined") return "RSD";
    return (window.localStorage.getItem("gf-currency") as Currency) || "RSD";
  });

  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "kartice";
    return (window.localStorage.getItem("gf-view") as View) || "kartice";
  });

  useEffect(() => {
    window.localStorage.setItem("gf-currency", currency);
  }, [currency]);

  useEffect(() => {
    window.localStorage.setItem("gf-view", view);
  }, [view]);

  const groups = [
    { key: "poluga", label: "Zlatne poluge i pločice" },
    { key: "kovanica", label: "Kovanice" },
    { key: "dukat", label: "Dukati" },
    { key: "srebro", label: "Srebro (sa 20% PDV)" },
  ];

  return (
    <section id="cenovnik" className="mx-auto max-w-[1200px] px-6 pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="num text-[11px] tracking-wider text-muted">CENOVNIK</p>
          <h2 className="display mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-bold">
            Prodaja i otkup
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line bg-panel p-1">
          {(["kartice", "tabela"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "num rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                view === v ? "bg-cream text-ink" : "text-muted hover:text-cream",
              )}
            >
              {v === "kartice" ? "Kartice" : "Tabela"}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-line bg-panel p-1">
          {(["RSD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                "num rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                currency === c ? "bg-gold text-ink" : "text-muted hover:text-cream",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        </div>
      </div>

      {list.isLoading ? (
        <div className="panel mt-6 space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-panel2" />
          ))}
        </div>
      ) : list.isError ? (
        <div className="panel mt-6 border-danger/40 p-6 text-sm text-danger">
          Feed je nedostupan — cenovnik se ne može prikazati.
        </div>
      ) : view === "kartice" ? (
        <div className="mt-2">
          {groups.map((g) => {
            const items = ((list.data?.items ?? []) as CardItem[]).filter(
              (i) => i.category === g.key,
            );
            if (items.length === 0) return null;
            return (
              <div key={g.key} className="mt-8 first:mt-4">
                <p className="num text-[11px] font-medium tracking-wider text-muted">
                  {g.label.toUpperCase()}
                </p>
                <ProductCards
                  items={items}
                  currency={currency}
                  lockEnabled={Boolean(lockCfg.data?.enabled)}
                  phone={lockCfg.data?.phone}
                  onLock={setLockTarget}
                />
              </div>
            );
          })}
          <div className="num panel mt-8 flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[11px] text-muted">
            <span>
              Baza: {eur(list.data?.baseEurPerGram ?? 0)}/g · prodajna baza:{" "}
              {eur(list.data?.sellEurPerGram ?? 0)}/g
            </span>
            <span>
              1 € = {num(list.data?.eurRsdMiddle ?? 0, 4)} RSD ·{" "}
              {list.data ? clock(list.data.updatedAt) : "—"}
            </span>
          </div>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="num px-5 py-3 text-[10px] font-medium tracking-wider text-muted">
                    PROIZVOD
                  </th>
                  <th className="num px-3 py-3 text-right text-[10px] font-medium tracking-wider text-gold">
                    PRODAJA
                  </th>
                  <th className="num px-3 py-3 text-right text-[10px] font-medium tracking-wider text-buy">
                    OTKUP
                  </th>
                  <th className="num px-3 py-3 text-right text-[10px] font-medium tracking-wider text-muted">
                    SPREAD
                  </th>
                  <th className="num px-5 py-3 text-right text-[10px] font-medium tracking-wider text-muted">
                    {lockCfg.data?.enabled ? "REZERVACIJA" : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const items = (list.data?.items ?? []).filter((i) => i.category === g.key);
                  if (items.length === 0) return null;
                  return (
                    <Fragment key={g.key}>
                      <tr className="bg-panel2/60">
                        <td
                          colSpan={5}
                          className="num px-5 py-2 text-[10px] font-medium tracking-wider text-muted"
                        >
                          {g.label.toUpperCase()}
                        </td>
                      </tr>
                      {items.map((p, idx) => (
                        <tr
                          key={p.sku}
                          className="rise border-b border-line/60 last:border-0 hover:bg-panel2/40"
                          style={{ animationDelay: `${idx * 20}ms` }}
                        >
                          <td className="px-5 py-3.5">
                            <p className="text-[14px] font-medium">{p.name}</p>
                            <p className="num text-[10px] text-muted">
                              {p.sku} · finoća {num(p.fineness, 1)}
                            </p>
                          </td>
                          <td className="num px-3 py-3.5 text-right text-[14px] font-semibold text-gold">
                            {p.onRequest ? (
                              <span className="text-[11px] text-muted">NA UPIT</span>
                            ) : (
                              money(currency === "EUR" ? p.sellEur : p.sellRsd, currency)
                            )}
                          </td>
                          <td className="num px-3 py-3.5 text-right text-[14px] font-semibold text-buy">
                            {money(currency === "EUR" ? p.buyEur : p.buyRsd, currency)}
                          </td>
                          <td className="num px-3 py-3 text-right text-[12px] text-muted">
                            {num(p.spreadPct, 1)}%
                          </td>
                          <td className="px-5 py-3 text-right">
                            {lockCfg.data?.enabled && !p.onRequest ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setLockTarget({
                                    sku: p.sku,
                                    name: p.name,
                                    sellEur: p.sellEur,
                                    sellRsd: p.sellRsd,
                                    buyEur: p.buyEur,
                                    buyRsd: p.buyRsd,
                                  })
                                }
                                className="num rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
                              >
                                ZAKLJUČAJ
                              </button>
                            ) : p.onRequest ? (
                              <a
                                href={`tel:${lockCfg.data?.phone ?? ""}`}
                                className="num rounded-full border border-line px-3 py-1.5 text-[11px] text-muted hover:text-cream"
                              >
                                POZOVITE
                              </a>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="num flex flex-wrap items-center justify-between gap-3 border-t border-line bg-panel2/40 px-5 py-3 text-[11px] text-muted">
            <span>
              Baza: {eur(list.data?.baseEurPerGram ?? 0)}/g · prodajna baza:{" "}
              {eur(list.data?.sellEurPerGram ?? 0)}/g
            </span>
            <span>
              1 € = {num(list.data?.eurRsdMiddle ?? 0, 4)} RSD ·{" "}
              {list.data ? clock(list.data.updatedAt) : "—"}
            </span>
          </div>
        </div>
      )}

      <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-muted">
        Otkupne cene se uvek računaju iz baznog spota, bez vikend premije i bez korekcije za
        volatilnost — sistem vas štiti od preplaćivanja robe dok je berza zatvorena. Za investiciono
        zlato se PDV ne obračunava; srebro sadrži 20% PDV.
      </p>

      {lockTarget && (
        <LockDialog
          target={lockTarget}
          currency={currency}
          source="sajt"
          onClose={() => setLockTarget(null)}
        />
      )}
    </section>
  );
}

export default function Index() {
  return (
    <>
      <Hero />
      <RiskPanel />
      <PriceTable />
    </>
  );
}
