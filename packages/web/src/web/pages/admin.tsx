import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Copy,
  Database,
  KeyRound,
  Loader2,
  Plug,
  Save,
  Sliders,
  Trash2,
} from "lucide-react";
import {
  getAdminKey,
  setAdminKey,
  useAdminLogin,
  useAdminProducts,
  useAdminSettings,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  useUpdateSettings,
} from "../queries/admin";
import { usePriceHistory, useSnapshotAll, useSpot, useSpotHistory } from "../queries/market";
import { clock, eur, num, pct, rsd } from "../lib/format";
import { cn } from "../lib/utils";
import { StatusPill } from "../components/status-pill";

type Tab = "spot" | "proizvodi" | "pravila" | "istorija" | "feeds";

const TABS: { key: Tab; label: string; icon: typeof Activity }[] = [
  { key: "spot", label: "Spot monitor", icon: Activity },
  { key: "proizvodi", label: "Proizvodi", icon: Database },
  { key: "pravila", label: "Pravila cena", icon: Sliders },
  { key: "istorija", label: "Istorija", icon: Save },
  { key: "feeds", label: "Integracije", icon: Plug },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getAdminKey()));
  }, []);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;
  return <Panel onLogout={() => setAuthed(false)} />;
}

/* ------------------------------------------------------------------ login */

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const login = useAdminLogin();

  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-center px-6 py-28">
      <form
        className="panel w-full max-w-sm p-8"
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate(
            { password },
            {
              onSuccess: (res) => {
                setAdminKey(res.key);
                onDone();
              },
            },
          );
        }}
      >
        <span className="grid size-10 place-items-center rounded-full bg-gold">
          <KeyRound className="size-4 text-ink" strokeWidth={2.5} />
        </span>
        <h1 className="display mt-5 text-3xl font-extrabold">Admin panel</h1>
        <p className="mt-2 text-[13px] text-muted">
          Kontrola marži, pravila rizika i feedova za web shop.
        </p>

        <input
          className="field mt-6"
          type="password"
          placeholder="Lozinka"
          aria-label="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {login.isError && (
          <p className="mt-2 text-[12px] text-danger">Pogrešna lozinka. Pokušaj ponovo.</p>
        )}
        <button
          type="submit"
          disabled={login.isPending || password.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-[13px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {login.isPending && <Loader2 className="size-4 animate-spin" />}
          Uđi
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */

function Panel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("spot");
  const settings = useAdminSettings(true);

  if (settings.isError) {
    setAdminKey(null);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="num text-[11px] tracking-wider text-muted">ADMIN</p>
          <h1 className="display mt-2 text-[clamp(1.8rem,4vw,3rem)] font-extrabold">
            Kontrolna tabla
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdminKey(null);
            onLogout();
          }}
          className="rounded-full border border-line px-4 py-2 text-[12px] text-muted transition-colors hover:text-cream"
        >
          Odjavi se
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5 border-b border-line pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
              tab === t.key ? "bg-gold text-ink" : "text-muted hover:text-cream",
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "spot" && <SpotTab />}
        {tab === "proizvodi" && <ProductsTab />}
        {tab === "pravila" && <RulesTab />}
        {tab === "istorija" && <HistoryTab />}
        {tab === "feeds" && <FeedsTab />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- spot */

function SpotTab() {
  const spot = useSpot();
  const history = useSpotHistory(24);
  const snapshot = useSnapshotAll();
  const d = spot.data?.data;

  const series = useMemo(() => history.data ?? [], [history.data]);
  const path = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((s) => s.eurPerGram);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / span) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return { d: `M ${pts.join(" L ")}`, min, max };
  }, [series]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="num text-[11px] tracking-wider text-muted">XAU EUR / GRAM · 24H</p>
            <p className="num mt-1 text-3xl font-semibold text-gold">
              {d ? num(d.baseEurPerGram, 2) : "—"} €
            </p>
          </div>
          <StatusPill status={spot.data?.status} ageSeconds={d?.ageSeconds} />
        </div>

        <div className="mt-6 h-40 w-full">
          {path ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <path
                d={`${path.d} L 100,100 L 0,100 Z`}
                fill="color-mix(in oklab, #f5c518 12%, transparent)"
              />
              <path
                d={path.d}
                fill="none"
                stroke="#f5c518"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : (
            <div className="grid h-full place-items-center text-[12px] text-muted">
              Nema dovoljno snimaka — grafikon se puni kako sistem prikuplja spot.
            </div>
          )}
        </div>
        {path && (
          <div className="num mt-2 flex justify-between text-[11px] text-muted">
            <span>min {num(path.min, 2)} €/g</span>
            <span>{series.length} snimaka</span>
            <span>max {num(path.max, 2)} €/g</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="panel p-6">
          <p className="num text-[11px] tracking-wider text-muted">IZVORI</p>
          <dl className="mt-4 space-y-2.5 text-[12px]">
            <Row label="Zlato (XAU/USD)" value={d?.sources.gold ?? "—"} />
            <Row label="EUR/USD" value={d?.sources.fx ?? "—"} />
            <Row label="EUR/RSD (NBS)" value={d?.sources.rsd ?? "—"} />
            <Row label="XAU USD/oz" value={d ? num(d.xauUsd, 2) : "—"} mono />
            <Row label="XAG USD/oz" value={d?.xagUsd ? num(d.xagUsd, 2) : "—"} mono />
            <Row label="EUR/RSD srednji" value={d ? num(d.eurRsdMiddle, 4) : "—"} mono />
            <Row
              label="Poslednji snimak"
              value={d ? clock(d.updatedAt) : "—"}
              mono
            />
          </dl>
        </div>

        <div className="panel p-6">
          <p className="num text-[11px] tracking-wider text-muted">AKTIVNI MODIFIKATORI</p>
          <div className="mt-4 space-y-2">
            {(d?.modifiers ?? []).map((m) => (
              <div
                key={m.key}
                className="flex items-center justify-between rounded-xl bg-panel2 px-3 py-2"
              >
                <span className="text-[12px]">{m.label}</span>
                <span
                  className={cn(
                    "num text-[12px] font-semibold",
                    m.active ? "text-gold" : "text-muted",
                  )}
                >
                  {m.active ? `+${pct(m.pct)}` : "—"}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 pt-1">
              <span className="text-[12px] text-muted">Ukupno na prodaju</span>
              <span className="num text-[13px] font-semibold text-gold">
                +{d ? pct(d.totalModifierPct) : "0%"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => snapshot.mutate({})}
            disabled={snapshot.isPending}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-line py-2 text-[12px] font-medium transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
          >
            {snapshot.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Sačuvaj trenutni cenovnik u istoriju
          </button>
          {snapshot.isSuccess && (
            <p className="num mt-2 text-center text-[11px] text-buy">
              Upisano {snapshot.data.saved} redova
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("truncate text-right", mono && "num")}>{value}</dd>
    </div>
  );
}

/* --------------------------------------------------------------- products */

function ProductsTab() {
  const products = useAdminProducts(true);
  const update = useUpdateProduct();
  const create = useCreateProduct();
  const remove = useDeleteProduct();
  const [draft, setDraft] = useState<Record<number, { sell: string; buy: string }>>({});

  return (
    <div className="space-y-6">
      <div className="panel overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-panel2/60">
              {["Proizvod", "Bruto g", "Finoća", "Marža prodaja", "Marža otkup", "PDV", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="num px-4 py-3 text-[10px] font-medium tracking-wider text-muted"
                  >
                    {h.toUpperCase()}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {(products.data ?? []).map((p) => {
              const d = draft[p.id] ?? {
                sell: (p.sellMarginPct * 100).toFixed(2),
                buy: (p.buyMarginPct * 100).toFixed(2),
              };
              const dirty =
                Number(d.sell) !== Number((p.sellMarginPct * 100).toFixed(2)) ||
                Number(d.buy) !== Number((p.buyMarginPct * 100).toFixed(2));
              return (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="text-[13px]">{p.name}</p>
                    <p className="num text-[10px] text-muted">
                      {p.sku} · {p.metal} · {p.category}
                      {p.onRequest && " · NA UPIT"}
                    </p>
                  </td>
                  <td className="num px-4 py-2.5 text-[12px] text-muted">
                    {num(p.grossWeightG, 3)}
                  </td>
                  <td className="num px-4 py-2.5 text-[12px] text-muted">{num(p.fineness, 1)}</td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Marža prodaja — ${p.sku}`}
                      className="field w-24 py-1 text-right text-gold"
                      value={d.sell}
                      onChange={(e) =>
                        setDraft((s) => ({ ...s, [p.id]: { ...d, sell: e.target.value } }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Marža otkup — ${p.sku}`}
                      className="field w-24 py-1 text-right text-buy"
                      value={d.buy}
                      onChange={(e) =>
                        setDraft((s) => ({ ...s, [p.id]: { ...d, buy: e.target.value } }))
                      }
                    />
                  </td>
                  <td className="num px-4 py-2.5 text-[12px] text-muted">{pct(p.vatPct, 0)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        aria-label={`Sačuvaj marže za ${p.sku}`}
                        disabled={!dirty || update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: p.id,
                            sellMarginPct: Number(d.sell) / 100,
                            buyMarginPct: Number(d.buy) / 100,
                          })
                        }
                        className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink disabled:opacity-20"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Obriši ${p.sku}`}
                        onClick={() => {
                          if (confirm(`Obrisati ${p.name}?`)) remove.mutate({ id: p.id });
                        }}
                        className="rounded-full border border-line px-3 py-1 text-muted transition-colors hover:border-danger hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewProduct onCreate={(v) => create.mutate(v)} pending={create.isPending} />
    </div>
  );
}

type NewProductValue = {
  sku: string;
  name: string;
  metal: "XAU" | "XAG";
  category: string;
  grossWeightG: number;
  fineness: number;
  sellMarginPct: number;
  buyMarginPct: number;
  vatPct: number;
  onRequest: boolean;
  active: boolean;
  sortOrder: number;
};

function NewProduct({
  onCreate,
  pending,
}: {
  onCreate: (v: NewProductValue) => void;
  pending: boolean;
}) {
  const [f, setF] = useState({
    sku: "",
    name: "",
    metal: "XAU" as "XAU" | "XAG",
    category: "poluga",
    grossWeightG: "10",
    fineness: "999.9",
    sell: "8",
    buy: "-3",
    vat: "0",
  });

  return (
    <form
      className="panel p-6"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          sku: f.sku,
          name: f.name,
          metal: f.metal,
          category: f.category,
          grossWeightG: Number(f.grossWeightG),
          fineness: Number(f.fineness),
          sellMarginPct: Number(f.sell) / 100,
          buyMarginPct: Number(f.buy) / 100,
          vatPct: Number(f.vat) / 100,
          onRequest: false,
          active: true,
          sortOrder: 999,
        });
        setF({ ...f, sku: "", name: "" });
      }}
    >
      <p className="num text-[11px] tracking-wider text-muted">NOVI PROIZVOD</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Field label="SKU">
          <input
            aria-label="SKU"
            className="field"
            required
            value={f.sku}
            onChange={(e) => setF({ ...f, sku: e.target.value })}
          />
        </Field>
        <Field label="Naziv">
          <input
            aria-label="Naziv"
            className="field"
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </Field>
        <Field label="Metal">
          <select
            aria-label="Metal"
            className="field"
            value={f.metal}
            onChange={(e) => setF({ ...f, metal: e.target.value as "XAU" | "XAG" })}
          >
            <option value="XAU">XAU — zlato</option>
            <option value="XAG">XAG — srebro</option>
          </select>
        </Field>
        <Field label="Kategorija">
          <select
            aria-label="Kategorija"
            className="field"
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
          >
            <option value="poluga">poluga</option>
            <option value="kovanica">kovanica</option>
            <option value="dukat">dukat</option>
            <option value="srebro">srebro</option>
          </select>
        </Field>
        <Field label="Bruto (g)">
          <input
            aria-label="Bruto (g)"
            className="field"
            required
            value={f.grossWeightG}
            onChange={(e) => setF({ ...f, grossWeightG: e.target.value })}
          />
        </Field>
        <Field label="Finoća">
          <input
            aria-label="Finoća"
            className="field"
            value={f.fineness}
            onChange={(e) => setF({ ...f, fineness: e.target.value })}
          />
        </Field>
        <Field label="Marža prodaja %">
          <input
            aria-label="Marža prodaja %"
            className="field"
            value={f.sell}
            onChange={(e) => setF({ ...f, sell: e.target.value })}
          />
        </Field>
        <Field label="Marža otkup %">
          <input
            aria-label="Marža otkup %"
            className="field"
            value={f.buy}
            onChange={(e) => setF({ ...f, buy: e.target.value })}
          />
        </Field>
        <Field label="PDV %">
          <input
            aria-label="PDV %"
            className="field"
            value={f.vat}
            onChange={(e) => setF({ ...f, vat: e.target.value })}
          />
        </Field>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-gold py-2 text-[12px] font-semibold text-ink disabled:opacity-40"
          >
            Dodaj
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="num mb-1.5 block text-[10px] tracking-wider text-muted">
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ rules */

function RulesTab() {
  const settings = useAdminSettings(true);
  const update = useUpdateSettings();
  const s = settings.data;
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    if (!s) return;
    setForm({
      weekendEnabled: s.weekendEnabled,
      weekendPct: String(s.weekendPct * 100),
      weekendStartDow: String(s.weekendStartDow),
      weekendStartHour: String(s.weekendStartHour),
      weekendEndDow: String(s.weekendEndDow),
      weekendEndHour: String(s.weekendEndHour),
      volEnabled: s.volEnabled,
      volLookbackHours: String(s.volLookbackHours),
      volTier1RangePct: String(s.volTier1RangePct),
      volTier1MarkupPct: String(s.volTier1MarkupPct * 100),
      volTier2RangePct: String(s.volTier2RangePct),
      volTier2MarkupPct: String(s.volTier2MarkupPct * 100),
      volTier3RangePct: String(s.volTier3RangePct),
      volTier3MarkupPct: String(s.volTier3MarkupPct * 100),
      gapEnabled: s.gapEnabled,
      gapThresholdPct: String(s.gapThresholdPct),
      gapHoldSeconds: String(s.gapHoldSeconds),
      rsdSellRate: s.rsdSellRate,
      rsdBuyRate: s.rsdBuyRate,
      rsdExtraSpreadPct: String(s.rsdExtraSpreadPct * 100),
      roundRsdTo: String(s.roundRsdTo),
      roundEurTo: String(s.roundEurTo),
      refreshSeconds: String(s.refreshSeconds),
      staleAfterSeconds: String(s.staleAfterSeconds),
      feedKey: s.feedKey,
      adminPassword: s.adminPassword,
    });
  }, [s]);

  if (!s) return <p className="text-[13px] text-muted">Učitavanje…</p>;

  const n = (k: string) => Number(form[k]);
  const t = (k: string) => String(form[k] ?? "");
  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const save = () =>
    update.mutate({
      weekendEnabled: Boolean(form.weekendEnabled),
      weekendPct: n("weekendPct") / 100,
      weekendStartDow: n("weekendStartDow"),
      weekendStartHour: n("weekendStartHour"),
      weekendEndDow: n("weekendEndDow"),
      weekendEndHour: n("weekendEndHour"),
      volEnabled: Boolean(form.volEnabled),
      volLookbackHours: n("volLookbackHours"),
      volTier1RangePct: n("volTier1RangePct"),
      volTier1MarkupPct: n("volTier1MarkupPct") / 100,
      volTier2RangePct: n("volTier2RangePct"),
      volTier2MarkupPct: n("volTier2MarkupPct") / 100,
      volTier3RangePct: n("volTier3RangePct"),
      volTier3MarkupPct: n("volTier3MarkupPct") / 100,
      gapEnabled: Boolean(form.gapEnabled),
      gapThresholdPct: n("gapThresholdPct"),
      gapHoldSeconds: n("gapHoldSeconds"),
      rsdSellRate: t("rsdSellRate") as "sell" | "middle" | "buy",
      rsdBuyRate: t("rsdBuyRate") as "sell" | "middle" | "buy",
      rsdExtraSpreadPct: n("rsdExtraSpreadPct") / 100,
      roundRsdTo: n("roundRsdTo"),
      roundEurTo: n("roundEurTo"),
      refreshSeconds: n("refreshSeconds"),
      staleAfterSeconds: n("staleAfterSeconds"),
      feedKey: t("feedKey"),
      adminPassword: t("adminPassword"),
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Vikend / neradno vreme"
          note="Klasično pravilo iz tabele: dok berza ne radi, prodaja dobija fiksnu premiju. Otkup se NIKAD ne menja."
          toggle={{ on: Boolean(form.weekendEnabled), set: (v) => set("weekendEnabled", v) }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Premija %">
              <input
                aria-label="Premija %"
                className="field"
                value={t("weekendPct")}
                onChange={(e) => set("weekendPct", e.target.value)}
              />
            </Field>
            <Field label="Početak — dan">
              <DowSelect value={t("weekendStartDow")} onChange={(v) => set("weekendStartDow", v)} />
            </Field>
            <Field label="Početak — sat">
              <input
                aria-label="Početak — sat"
                className="field"
                value={t("weekendStartHour")}
                onChange={(e) => set("weekendStartHour", e.target.value)}
              />
            </Field>
            <Field label="Kraj — dan">
              <DowSelect value={t("weekendEndDow")} onChange={(v) => set("weekendEndDow", v)} />
            </Field>
            <Field label="Kraj — sat">
              <input
                aria-label="Kraj — sat"
                className="field"
                value={t("weekendEndHour")}
                onChange={(e) => set("weekendEndHour", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Volatilnost"
          note="Raspon spota u zadatom prozoru određuje dodatnu maržu. Ovo je pravi hedž — reaguje na tržište, ne na kalendar."
          toggle={{ on: Boolean(form.volEnabled), set: (v) => set("volEnabled", v) }}
        >
          <Field label="Prozor (h)">
            <input
              aria-label="Prozor (h)"
              className="field"
              value={t("volLookbackHours")}
              onChange={(e) => set("volLookbackHours", e.target.value)}
            />
          </Field>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr] items-end gap-3">
                <span className="num pb-2.5 text-[11px] text-muted">N{i}</span>
                <Field label="Raspon ≥ %">
                  <input
                    aria-label="Raspon ≥ %"
                    className="field"
                    value={t(`volTier${i}RangePct`)}
                    onChange={(e) => set(`volTier${i}RangePct`, e.target.value)}
                  />
                </Field>
                <Field label="Dodatak %">
                  <input
                    aria-label="Dodatak %"
                    className="field"
                    value={t(`volTier${i}MarkupPct`)}
                    onChange={(e) => set(`volTier${i}MarkupPct`, e.target.value)}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Gap zaštita"
          note="Ako spot skoči preko praga, prethodna cena se drži još N sekundi — sprečava arbitražu na skoku."
          toggle={{ on: Boolean(form.gapEnabled), set: (v) => set("gapEnabled", v) }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prag skoka %">
              <input
                aria-label="Prag skoka %"
                className="field"
                value={t("gapThresholdPct")}
                onChange={(e) => set("gapThresholdPct", e.target.value)}
              />
            </Field>
            <Field label="Držanje (s)">
              <input
                aria-label="Držanje (s)"
                className="field"
                value={t("gapHoldSeconds")}
                onChange={(e) => set("gapHoldSeconds", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Dinar i zaokruživanje"
          note="Koji kurs NBS liste se koristi za koju stranu. Prodaja se zaokružuje naviše, otkup naniže."
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kurs za prodaju">
              <RateSelect value={t("rsdSellRate")} onChange={(v) => set("rsdSellRate", v)} />
            </Field>
            <Field label="Kurs za otkup">
              <RateSelect value={t("rsdBuyRate")} onChange={(v) => set("rsdBuyRate", v)} />
            </Field>
            <Field label="Dodatni spred %">
              <input
                aria-label="Dodatni spred %"
                className="field"
                value={t("rsdExtraSpreadPct")}
                onChange={(e) => set("rsdExtraSpreadPct", e.target.value)}
              />
            </Field>
            <Field label="Zaokruži RSD na">
              <input
                aria-label="Zaokruži RSD na"
                className="field"
                value={t("roundRsdTo")}
                onChange={(e) => set("roundRsdTo", e.target.value)}
              />
            </Field>
            <Field label="Zaokruži EUR na">
              <input
                aria-label="Zaokruži EUR na"
                className="field"
                value={t("roundEurTo")}
                onChange={(e) => set("roundEurTo", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Feed i pristup" note="Osvežavanje, prag zastarelosti, ključ feeda i lozinka panela.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Osvežavanje (s)">
              <input
                aria-label="Osvežavanje (s)"
                className="field"
                value={t("refreshSeconds")}
                onChange={(e) => set("refreshSeconds", e.target.value)}
              />
            </Field>
            <Field label="STALE posle (s)">
              <input
                aria-label="STALE posle (s)"
                className="field"
                value={t("staleAfterSeconds")}
                onChange={(e) => set("staleAfterSeconds", e.target.value)}
              />
            </Field>
            <Field label="Ključ feeda">
              <input
                aria-label="Ključ feeda"
                className="field"
                value={t("feedKey")}
                onChange={(e) => set("feedKey", e.target.value)}
              />
            </Field>
            <Field label="Lozinka panela">
              <input
                aria-label="Lozinka panela"
                className="field"
                value={t("adminPassword")}
                onChange={(e) => set("adminPassword", e.target.value)}
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-40"
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Sačuvaj pravila
        </button>
        {update.isSuccess && <span className="text-[12px] text-buy">Sačuvano.</span>}
        {update.isError && <span className="text-[12px] text-danger">Greška pri čuvanju.</span>}
        <span className="text-[12px] text-muted">
          Ako menjaš lozinku, ponovo se prijavi posle čuvanja.
        </span>
      </div>
    </div>
  );
}

function Card({
  title,
  note,
  toggle,
  children,
}: {
  title: string;
  note: string;
  toggle?: { on: boolean; set: (v: boolean) => void };
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="display text-lg font-bold">{title}</h3>
          <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted">{note}</p>
        </div>
        {toggle && (
          <button
            type="button"
            aria-label={`Uključi/isključi: ${title}`}
            onClick={() => toggle.set(!toggle.on)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              toggle.on ? "bg-gold" : "bg-panel2 border border-line",
            )}
            aria-pressed={toggle.on}
          >
            <span
              className={cn(
                "absolute top-1 size-4 rounded-full transition-all",
                toggle.on ? "left-6 bg-ink" : "left-1 bg-muted",
              )}
            />
          </button>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

const DOWS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

function DowSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      {DOWS.map((d, i) => (
        <option key={d} value={String(i + 1)}>
          {d}
        </option>
      ))}
    </select>
  );
}

function RateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="sell">prodajni</option>
      <option value="middle">srednji</option>
      <option value="buy">kupovni</option>
    </select>
  );
}

/* ---------------------------------------------------------------- history */

function HistoryTab() {
  const history = usePriceHistory();
  const rows = history.data ?? [];

  return (
    <div className="panel overflow-hidden">
      {rows.length === 0 ? (
        <p className="p-8 text-center text-[13px] text-muted">
          Istorija je prazna. Snimi cenovnik iz Spot monitora da napraviš prvi zapis.
        </p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-panel2/60">
              {["Vreme", "SKU", "Spot €/g", "Markup", "Prodaja €", "Otkup €", "Prodaja RSD", "Pravila"].map(
                (h) => (
                  <th
                    key={h}
                    className="num px-4 py-3 text-[10px] font-medium tracking-wider text-muted"
                  >
                    {h.toUpperCase()}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60 text-[12px] last:border-0">
                <td className="num px-4 py-2.5 text-muted">{clock(r.createdAt)}</td>
                <td className="num px-4 py-2.5">{r.sku}</td>
                <td className="num px-4 py-2.5 text-muted">{num(r.spotEurPerGram, 2)}</td>
                <td className="num px-4 py-2.5 text-muted">+{pct(r.appliedMarkupPct)}</td>
                <td className="num px-4 py-2.5 text-gold">{eur(r.sellEur)}</td>
                <td className="num px-4 py-2.5 text-buy">{eur(r.buyEur)}</td>
                <td className="num px-4 py-2.5 text-muted">{rsd(r.sellRsd)}</td>
                <td className="num px-4 py-2.5 text-[11px] text-muted">{r.modifiers || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ feeds */

function FeedsTab() {
  const settings = useAdminSettings(true);
  const key = settings.data?.feedKey ?? "";
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const feeds = [
    {
      name: "JSON — univerzalni",
      note: "Za custom integracije, mobilnu aplikaciju ili bilo koji sistem koji čita JSON.",
      url: `${origin}/api/feed/prices.json?key=${key}`,
    },
    {
      name: "WooCommerce CSV",
      note: "Import u WooCommerce: SKU, regular_price (RSD), stock i meta polja za otkupnu cenu.",
      url: `${origin}/api/feed/woocommerce.csv?key=${key}`,
    },
    {
      name: "Shopify CSV",
      note: "Shopify product CSV format — Handle, Title, Variant SKU, Variant Price.",
      url: `${origin}/api/feed/shopify.csv?key=${key}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="panel p-6">
        <h3 className="display text-lg font-bold">Kako se povezuje web shop</h3>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
          Feedovi vraćaju uvek sveže cene po istim pravilima kao sajt. U WooCommerce-u ili Shopify-ju
          zakaži import na svakih 15–60 minuta. Proizvodi označeni kao „na upit" se ne izvoze. Ako je
          feed nedostupan, vraća se status 503 — postavi import tako da tada preskoči, umesto da
          upiše nule.
        </p>
      </div>

      {feeds.map((f) => (
        <FeedRow key={f.name} {...f} />
      ))}
    </div>
  );
}

function FeedRow({ name, note, url }: { name: string; note: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="mt-1 text-[12px] text-muted">{note}</p>
        <p className="num mt-2 truncate text-[11px] text-gold/80">{url}</p>
      </div>
      <div className="flex gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line px-4 py-2 text-[12px] text-muted transition-colors hover:text-cream"
        >
          Otvori
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-[12px] font-semibold text-ink"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Kopirano" : "Kopiraj"}
        </button>
      </div>
    </div>
  );
}
