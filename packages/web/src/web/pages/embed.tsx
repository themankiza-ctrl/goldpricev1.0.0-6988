import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePriceList } from "../queries/market";
import { useLockConfig } from "../queries/locks";
import LockDialog, { type LockTarget } from "../components/lock-dialog";
import { money, num, timeAgo } from "../lib/format";
import { cn } from "../lib/utils";

type Currency = "EUR" | "RSD";

const GROUPS = [
  { key: "poluga", label: "Zlatne poluge i pločice" },
  { key: "kovanica", label: "Kovanice" },
  { key: "dukat", label: "Dukati" },
  { key: "srebro", label: "Srebro (sa 20% PDV)" },
];

function useParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    theme: p.get("theme") === "light" ? "light" : "dark",
    currency: (p.get("currency") === "EUR" ? "EUR" : "RSD") as Currency,
    /** hide the buyback column — some shops only publish sell prices */
    hideBuy: p.get("buy") === "0",
    /** comma separated categories, e.g. ?only=poluga,dukat */
    only: p.get("only")?.split(",").filter(Boolean) ?? null,
    /** ?lock=0 removes the price-lock CTA column */
    showLock: p.get("lock") !== "0",
  };
}

/** Tells the parent page how tall the iframe should be. */
function useAutoHeight() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const post = () => {
      window.parent?.postMessage(
        { type: "gf-embed-height", height: Math.ceil(el.getBoundingClientRect().height) + 8 },
        "*",
      );
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return ref;
}

export default function Embed() {
  const params = useParams();
  const [currency, setCurrency] = useState<Currency>(params.currency);
  const [lockTarget, setLockTarget] = useState<LockTarget | null>(null);
  const list = usePriceList();
  const lockCfg = useLockConfig();
  const ref = useAutoHeight();
  const light = params.theme === "light";

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = light ? "#ffffff" : "transparent";
  }, [light]);

  const groups = params.only ? GROUPS.filter((g) => params.only?.includes(g.key)) : GROUPS;
  const withLock = params.showLock && Boolean(lockCfg.data?.enabled);
  const cols = (params.hideBuy ? 3 : 4) + (withLock ? 1 : 0);

  return (
    <div ref={ref} className={cn("w-full px-3 py-3", light && "gf-light")}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              list.data?.status === "LIVE"
                ? "live-dot bg-gold"
                : list.data?.status === "STALE"
                  ? "bg-warn"
                  : "bg-danger",
            )}
            aria-hidden
          />
          <span className="num text-[10px] tracking-wider text-muted">
            {list.isLoading
              ? "UČITAVANJE CENA"
              : list.data?.status === "LIVE"
                ? "CENE UŽIVO"
                : "CENE — REZERVNI IZVOR"}
            {list.data &&
              ` · ${timeAgo((Date.now() - new Date(list.data.updatedAt).getTime()) / 1000)}`}
          </span>
        </div>

        <div className="flex rounded-full border border-line p-0.5">
          {(["RSD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                "num rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                currency === c ? "bg-gold text-ink" : "text-muted hover:text-cream",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {list.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-panel2" />
          ))}
        </div>
      ) : list.isError ? (
        <p className="rounded-xl border border-danger/40 p-4 text-[12px] text-danger">
          Cenovnik trenutno nije dostupan. Pozovite nas za aktuelnu cenu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="num py-2 text-[9px] font-medium tracking-wider text-muted">
                  PROIZVOD
                </th>
                <th className="num py-2 text-right text-[9px] font-medium tracking-wider text-gold">
                  PRODAJA
                </th>
                {!params.hideBuy && (
                  <th className="num py-2 text-right text-[9px] font-medium tracking-wider text-buy">
                    OTKUP
                  </th>
                )}
                <th className="num py-2 pl-3 text-right text-[9px] font-medium tracking-wider text-muted">
                  MASA
                </th>
                {withLock && (
                  <th className="num py-2 pl-3 text-right text-[9px] font-medium tracking-wider text-muted">
                    CENA
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const items = (list.data?.items ?? []).filter((i) => i.category === g.key);
                if (items.length === 0) return null;
                return (
                  <Fragment key={g.key}>
                    <tr className="bg-panel2/70">
                      <td
                        colSpan={cols}
                        className="num py-1.5 text-[9px] font-medium tracking-wider text-muted"
                      >
                        {g.label.toUpperCase()}
                      </td>
                    </tr>
                    {items.map((p) => (
                      <tr key={p.sku} className="border-b border-line/60 last:border-0">
                        <td className="py-2 pr-3 text-[12px]">{p.name}</td>
                        <td className="num py-2 text-right text-[12px] font-semibold text-gold">
                          {p.onRequest ? (
                            <span className="text-[10px] text-muted">NA UPIT</span>
                          ) : (
                            money(currency === "EUR" ? p.sellEur : p.sellRsd, currency)
                          )}
                        </td>
                        {!params.hideBuy && (
                          <td className="num py-2 text-right text-[12px] font-semibold text-buy">
                            {money(currency === "EUR" ? p.buyEur : p.buyRsd, currency)}
                          </td>
                        )}
                        <td className="num py-2 pl-3 text-right text-[11px] text-muted">
                          {num(p.grossWeightG, p.grossWeightG < 1 ? 2 : 0)} g
                        </td>
                        {withLock && (
                          <td className="py-2 pl-3 text-right">
                            {p.onRequest ? (
                              <a
                                href={`tel:${lockCfg.data?.phone ?? ""}`}
                                className="num text-[10px] text-muted underline"
                              >
                                POZOVITE
                              </a>
                            ) : (
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
                                className="num rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold"
                              >
                                ZAKLJUČAJ
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        Cene se automatski usklađuju sa berzanskim kursom zlata i srednjim kursom NBS. Informativnog
        su karaktera i ne predstavljaju obavezujuću ponudu.
        {withLock && " Cenu možete zaključati na kratak rok — rezervacija nije obavezujuća kupovina."}
      </p>

      {lockTarget && (
        <LockDialog
          target={lockTarget}
          currency={currency}
          source="embed"
          onClose={() => setLockTarget(null)}
        />
      )}
    </div>
  );
}
