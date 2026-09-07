import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Clock, Phone, ShieldCheck, Hash } from "lucide-react";
import { usePriceList } from "../queries/market";
import { useLockConfig } from "../queries/locks";
import { money, num, clock } from "../lib/format";
import { cn } from "../lib/utils";
import LockDialog, { type LockTarget } from "../components/lock-dialog";
import { useSeo } from "../lib/seo";

type Currency = "EUR" | "RSD";

function minuteLabel(m: number): string {
  if (m < 60) return `${m} min`;
  const h = m / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

export default function Zakljucaj() {
  const list = usePriceList();
  const cfg = useLockConfig();
  const [currency, setCurrency] = useState<Currency>("RSD");
  const [lockTarget, setLockTarget] = useState<LockTarget | null>(null);

  useSeo(
    "Zaključaj cenu zlata — Golden Feather",
    "Fiksirajte cenu zlata na 30 minuta do 12 sati dok ne dođete po robu. Bez uplate unapred — potrebni su samo ime i broj telefona.",
  );

  const phone = cfg.data?.phone ?? "+381621047693";
  const minuteOptions = cfg.data?.minuteOptions ?? [30, 60, 360, 720];
  const maxEur = cfg.data?.maxTotalEur ?? 20000;
  const items = (list.data?.items ?? []).filter((i) => !i.onRequest);

  const steps = [
    {
      icon: Hash,
      title: "1. Izaberete proizvod",
      text: "Kliknete ZAKLJUČAJ pored gramaže koja vas zanima. Cenu obračunava naš server u tom trenutku, ne prepisuje se sa ekrana.",
    },
    {
      icon: Clock,
      title: "2. Birate rok",
      text: `Cena važi ${minuteOptions.map(minuteLabel).join(", ")} — koliko vam treba da stignete do nas.`,
    },
    {
      icon: Phone,
      title: "3. Ostavljate ime i telefon",
      text: "Bez uplate unapred, bez kartice, bez avansa. Dobijate broj rezervacije u formatu GF-XXXX.",
    },
    {
      icon: ShieldCheck,
      title: "4. Preuzimate po toj ceni",
      text: "Dolazite u dogovorenom roku i plaćate zaključanu cenu, bez obzira šta je berza u međuvremenu uradila.",
    },
  ];

  return (
    <main className="pb-8">
      <section className="relative overflow-hidden bg-gold text-ink rounded-br-[96px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #0a0a0a 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-16 pb-16">
          <span className="rise num inline-flex items-center gap-2 rounded-full border border-ink/20 px-3 py-1 text-[11px] font-medium tracking-wider">
            REZERVACIJA CENE
          </span>
          <h1 className="display mt-6 max-w-3xl text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.02] font-extrabold">
            <span className="rise block">ZAKLJUČAJTE CENU</span>
            <span className="rise block text-ink/35" style={{ animationDelay: "120ms" }}>
              DOK NE STIGNETE
            </span>
          </h1>
          <p
            className="rise mt-6 max-w-lg text-[15px] leading-relaxed text-ink/70"
            style={{ animationDelay: "200ms" }}
          >
            Zlato se kreće ceo dan. Fiksirajte cenu na dogovoreni rok, dođite i preuzmite robu po
            njoj. Bez uplate unapred — potrebni su samo ime i broj telefona.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            <a
              href="#izbor"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Izaberi proizvod <ArrowUpRight className="size-4" />
            </a>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-5 py-3 text-[13px] font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              <Phone className="size-4" /> Pozovi
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-[1200px] gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="panel rise rounded-[22px] p-6"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid size-10 place-items-center rounded-full bg-gold/10 text-gold">
              <s.icon className="size-4" />
            </span>
            <p className="display mt-4 text-[15px] font-bold text-cream">{s.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.text}</p>
          </div>
        ))}
      </section>

      <section id="izbor" className="mx-auto mt-20 max-w-[1200px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="num text-[11px] tracking-wider text-muted">IZBOR PROIZVODA</p>
            <h2 className="display mt-2 text-[clamp(1.6rem,4vw,2.5rem)] font-bold text-cream">
              Cene uživo
            </h2>
          </div>
          <div className="flex rounded-full border border-line bg-panel p-1">
            {(["RSD", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "num rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                  currency === c ? "bg-cream text-ink" : "text-muted hover:text-cream",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="panel mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="num px-5 py-3 text-[10px] font-medium tracking-wider text-muted">
                    PROIZVOD
                  </th>
                  <th className="num px-3 py-3 text-right text-[10px] font-medium tracking-wider text-gold">
                    PRODAJA
                  </th>
                  <th className="num px-5 py-3 text-right text-[10px] font-medium tracking-wider text-muted">
                    REZERVACIJA
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, idx) => (
                  <tr
                    key={p.sku}
                    className="rise border-b border-line/60 last:border-0 hover:bg-panel2/40"
                    style={{ animationDelay: `${idx * 15}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-[14px] font-medium text-cream">{p.name}</p>
                      <p className="num text-[10px] text-muted">
                        {p.sku} · finoća {num(p.fineness, 1)}
                      </p>
                    </td>
                    <td className="num px-3 py-3.5 text-right text-[14px] font-semibold text-gold">
                      {money(currency === "EUR" ? p.sellEur : p.sellRsd, currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {cfg.data?.enabled ? (
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
                      ) : (
                        <a
                          href={`tel:${phone}`}
                          className="num rounded-full border border-line px-3 py-1.5 text-[11px] text-muted hover:text-cream"
                        >
                          POZOVITE
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="num flex flex-wrap items-center justify-between gap-3 border-t border-line bg-panel2/40 px-5 py-3 text-[11px] text-muted">
            <span>Cene se preračunavaju automatski, na svakih 30 sekundi.</span>
            <span>{list.data ? clock(list.data.updatedAt) : "—"}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="panel rounded-[22px] p-6">
            <p className="num text-[11px] tracking-wider text-muted">GORNJA GRANICA</p>
            <p className="display num mt-2 text-[24px] font-bold text-cream">
              {maxEur.toLocaleString("sr-RS")} €
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Toliko iznosi maksimalna vrednost jedne online rezervacije. Za veće iznose se
              dogovaramo telefonom.
            </p>
          </div>
          <div className="panel rounded-[22px] p-6">
            <p className="num text-[11px] tracking-wider text-muted">ROKOVI</p>
            <p className="display num mt-2 text-[24px] font-bold text-cream">
              {minuteOptions.map(minuteLabel).join(" · ")}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Podrazumevani rok je {minuteLabel(cfg.data?.defaultMinutes ?? 60)}. Ako ne dođete,
              rezervacija istekne — bez penala i bez obaveze.
            </p>
          </div>
          <div className="panel rounded-[22px] p-6">
            <p className="num text-[11px] tracking-wider text-muted">ŠTA TRAŽIMO</p>
            <p className="display mt-2 text-[24px] font-bold text-cream">Ime i telefon</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Ništa više. Nema uplate unapred, nema kartice, nema avansne cene.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-muted">
          Zaključavanje cene nije kupovina na daljinu i ne obavezuje vas da kupite. Za investiciono
          zlato se PDV ne obračunava; srebro sadrži 20% PDV.
        </p>

        <div className="panel mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[22px] p-6">
          <p className="text-[14px] text-muted">
            Niste sigurni koja gramaža vam odgovara? Pročitajte poređenje poluga i dukata.
          </p>
          <Link
            to="/blog/poluge-ili-dukati"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-cream hover:bg-panel2"
          >
            Otvori vodič <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {lockTarget && (
        <LockDialog
          target={lockTarget}
          currency={currency}
          source="sajt"
          onClose={() => setLockTarget(null)}
        />
      )}
    </main>
  );
}
