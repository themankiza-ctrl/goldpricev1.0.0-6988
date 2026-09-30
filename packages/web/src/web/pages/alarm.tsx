import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BellRing,
  Check,
  Clock,
  Loader2,
  Mail,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useAlertConfig,
  useConfirmAlert,
  useSubscribeAlert,
  useUnsubscribeAlert,
} from "../queries/alerts";
import { useSeo } from "../lib/seo";
import { cn } from "../lib/utils";

type Kind = "procenat" | "cilj";
type Direction = "dole" | "gore" | "oba";

function num(value: number, digits = 2) {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Token iz mejla: ?potvrda=... ili ?odjava=... */
function tokensFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    confirm: params.get("potvrda"),
    unsubscribe: params.get("odjava"),
  };
}

export default function Alarm() {
  useSeo(
    "Cenovni alarm za zlato — obaveštenje na email | Golden Feather",
    "Prijavite se i dobijte email kada spot cena zlata pomeri 1%, 2% ili 5%, ili kada padne ispod cene koju sami odredite. Bez reklama, odjava jednim klikom.",
  );

  const tokens = useMemo(() => tokensFromUrl(), []);
  const confirm = useConfirmAlert(tokens.confirm);
  const unsub = useUnsubscribeAlert(tokens.unsubscribe);

  if (tokens.confirm) {
    return (
      <Outcome
        loading={confirm.isLoading}
        error={confirm.error ? errText(confirm.error) : null}
        title={confirm.data?.already ? "Alarm je već aktivan" : "Alarm je aktivan"}
        body={
          confirm.data
            ? `Prijavljeni ste na ${confirm.data.description}. Mejl dobijate samo kada se uslov ispuni — ne češće.`
            : ""
        }
      />
    );
  }

  if (tokens.unsubscribe) {
    return (
      <Outcome
        loading={unsub.isLoading}
        error={unsub.error ? errText(unsub.error) : null}
        title="Odjavljeni ste"
        body={
          unsub.data
            ? `Adresa ${unsub.data.email} više ne dobija cenovne alarme. Možete se prijaviti ponovo u svakom trenutku.`
            : ""
        }
      />
    );
  }

  return <SubscribeView />;
}

function errText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Link nije važeći ili je istekao.";
}

function Outcome({
  loading,
  error,
  title,
  body,
}: {
  loading: boolean;
  error: string | null;
  title: string;
  body: string;
}) {
  return (
    <main className="mx-auto max-w-[760px] px-6 pt-20 pb-8">
      <div className="panel rise rounded-[22px] p-9 text-center">
        {loading ? (
          <>
            <Loader2 className="mx-auto size-7 animate-spin text-gold" />
            <p className="mt-4 text-[14px] text-muted">Proveravamo link…</p>
          </>
        ) : error ? (
          <>
            <h1 className="display text-[26px] font-extrabold text-cream">Link ne radi</h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">{error}</p>
            <Link
              to="/alarm"
              className="mt-7 inline-block rounded-full bg-gold px-6 py-3 text-[14px] font-bold text-ink"
            >
              Prijavi se ponovo
            </Link>
          </>
        ) : (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-gold/10 text-gold">
              <Check className="size-6" strokeWidth={2.5} />
            </span>
            <h1 className="display mt-5 text-[26px] font-extrabold text-cream">{title}</h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">{body}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-gold px-6 py-3 text-[14px] font-bold text-ink"
              >
                Vidi cenovnik
              </Link>
              <Link
                to="/zakljucaj"
                className="rounded-full border border-line px-6 py-3 text-[14px] font-semibold text-cream hover:border-gold/50"
              >
                Zaključaj cenu
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SubscribeView() {
  const cfg = useAlertConfig();
  const subscribe = useSubscribeAlert();

  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<Kind>("procenat");
  const [threshold, setThreshold] = useState<1 | 2 | 5>(1);
  const [direction, setDirection] = useState<Direction>("oba");
  const [target, setTarget] = useState("");
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const spot = cfg.data?.spotEurPerGram ?? null;
  const disabled = cfg.data ? !cfg.data.enabled : false;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!consent) {
      setLocalError("Potrebna je saglasnost za slanje obaveštenja na email.");
      return;
    }
    const targetValue = Number(target.replace(",", "."));
    if (kind === "cilj" && (!Number.isFinite(targetValue) || targetValue <= 0)) {
      setLocalError("Unesite ciljnu cenu u evrima po gramu, npr. 95,50.");
      return;
    }

    subscribe.mutate({
      email: email.trim(),
      kind,
      thresholdPct: threshold,
      direction,
      targetEurPerGram: kind === "cilj" ? targetValue : null,
    });
  }

  if (subscribe.data?.ok) {
    return (
      <main className="mx-auto max-w-[760px] px-6 pt-20 pb-8">
        <div className="panel rise rounded-[22px] p-9 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-gold/10 text-gold">
            <Mail className="size-6" />
          </span>
          <h1 className="display mt-5 text-[26px] font-extrabold text-cream">
            Proverite poštu
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
            Poslali smo potvrdni mejl na <span className="text-cream">{email}</span>. Kliknite na
            link u njemu i alarm za {subscribe.data.description} postaje aktivan. Dok ne potvrdite,
            ne šaljemo ništa.
          </p>
          {subscribe.data.warning && (
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-line bg-ink px-4 py-3 text-[13px] leading-relaxed text-muted">
              {subscribe.data.warning}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-8">
      <p className="num text-[11px] tracking-wider text-muted">CENOVNI ALARM</p>
      <h1 className="display mt-2 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-cream">
        Ne pratite grafikone. Mejl vas nađe.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Postavite prag i dobijate obaveštenje samo kada se spot cena zlata zaista pomeri toliko —
        ili kada padne ispod cene koju sami odredite. Nema dnevnog šuma, nema reklama.
      </p>

      {spot !== null && (
        <p className="num mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-[13px] text-cream">
          <span className="size-1.5 rounded-full bg-gold" />
          Spot sada: <span className="font-bold text-gold">{num(spot)} €/g</span>
        </p>
      )}

      <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <form onSubmit={submit} className="panel rise rounded-[22px] p-7">
          {disabled && (
            <p className="mb-6 rounded-xl border border-line bg-ink px-4 py-3 text-[13px] text-muted">
              Prijava je trenutno zatvorena. Pišite nam na{" "}
              <span className="text-cream">{cfg.data?.contactEmail}</span> i uvešćemo vas ručno.
            </p>
          )}

          <fieldset disabled={disabled} className="space-y-7">
            {/* --- tip alarma --- */}
            <div>
              <p className="num text-[11px] tracking-wider text-muted">TIP ALARMA</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <KindCard
                  active={kind === "procenat"}
                  onClick={() => setKind("procenat")}
                  icon={<TrendingDown className="size-4" />}
                  title="Pomeraj u procentima"
                  body="Alarm kad cena skoči ili padne za odabrani procenat."
                />
                <KindCard
                  active={kind === "cilj"}
                  onClick={() => setKind("cilj")}
                  icon={<Target className="size-4" />}
                  title="Ciljna cena"
                  body="Jednokratno obaveštenje kad cena padne ispod vaše granice."
                />
              </div>
            </div>

            {kind === "procenat" ? (
              <>
                <div>
                  <p className="num text-[11px] tracking-wider text-muted">PRAG</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([1, 2, 5] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setThreshold(v)}
                        className={cn(
                          "num rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors",
                          threshold === v
                            ? "bg-gold text-ink"
                            : "border border-line text-cream hover:border-gold/50",
                        )}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                    {threshold === 1
                      ? "Najosetljivije — u mirnoj nedelji obično nula do dva mejla."
                      : threshold === 2
                        ? "Srednje — reaguje na ozbiljnije dnevne pomeraje."
                        : "Samo krupni potezi — po pravilu nekoliko puta godišnje."}
                  </p>
                </div>

                <div>
                  <p className="num text-[11px] tracking-wider text-muted">SMER</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(
                      [
                        { v: "dole" as Direction, label: "Samo pad", icon: TrendingDown },
                        { v: "gore" as Direction, label: "Samo rast", icon: TrendingUp },
                        { v: "oba" as Direction, label: "Oba smera", icon: BellRing },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setDirection(opt.v)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-colors",
                          direction === opt.v
                            ? "bg-gold text-ink"
                            : "border border-line text-cream hover:border-gold/50",
                        )}
                      >
                        <opt.icon className="size-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                    Kupci najčešće biraju „samo pad" — hvata trenutak za ulaz. Ako prodajete zlato,
                    „samo rast" je korisniji.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="num text-[11px] tracking-wider text-muted">
                  CILJNA CENA (EUR PO GRAMU)
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    aria-label="Ciljna cena u evrima po gramu"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    inputMode="decimal"
                    placeholder={spot !== null ? num(spot * 0.97) : "95,00"}
                    className="num w-40 rounded-xl border border-line bg-ink px-4 py-3 text-[16px] font-semibold text-cream outline-none focus:border-gold/60"
                  />
                  <span className="num text-[14px] text-muted">€/g</span>
                  {spot !== null && (
                    <button
                      type="button"
                      onClick={() => setTarget(num(spot * 0.97))}
                      className="rounded-full border border-line px-4 py-2 text-[12.5px] font-medium text-muted hover:border-gold/50 hover:text-cream"
                    >
                      −3% od spota
                    </button>
                  )}
                </div>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                  Pošaljemo jedan mejl kada spot padne na ili ispod te vrednosti, pa se alarm gasi.
                  Novu granicu možete postaviti odmah posle toga.
                </p>
              </div>
            )}

            {/* --- email --- */}
            <div>
              <p className="num text-[11px] tracking-wider text-muted">EMAIL</p>
              <input
                aria-label="Vaša email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="vase.ime@primer.com"
                className="mt-3 w-full rounded-xl border border-line bg-ink px-4 py-3 text-[15px] text-cream outline-none focus:border-gold/60"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                aria-label="Saglasnost za primanje mejlova"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 accent-[#F5C518]"
              />
              <span className="text-[12.5px] leading-relaxed text-muted">
                Saglasan/na sam da mi Golden Feather DOO pošalje obaveštenje o ceni na ovu adresu.
                Adresu ne delimo ni sa kim i ne koristimo je za reklame. Odjava je jedan klik u
                svakom mejlu.
              </span>
            </label>

            {(localError || subscribe.error) && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                {localError ?? errText(subscribe.error)}
              </p>
            )}

            <button
              type="submit"
              disabled={subscribe.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[14.5px] font-bold text-ink transition-opacity disabled:opacity-60"
            >
              {subscribe.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BellRing className="size-4" />
              )}
              Prijavi me na alarm
            </button>
          </fieldset>
        </form>

        {/* --- objašnjenje --- */}
        <div className="space-y-4">
          <div className="panel rise rounded-[22px] p-7">
            <p className="num text-[11px] tracking-wider text-muted">KAKO RADI</p>
            <ol className="mt-4 space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Potvrda u dva klika",
                  body: "Posle prijave dobijate jedan potvrdni mejl. Bez klika na njega ne šaljemo ništa — tako niko ne može da prijavi vašu adresu.",
                },
                {
                  icon: BellRing,
                  title: "Merimo od zadnjeg alarma",
                  body: "Kad vam pošaljemo obaveštenje, referentna cena se pomera na novu. Trend od 5% tako daje pet mejlova, a ne stotinu.",
                },
                {
                  icon: Clock,
                  title: "Najviše nekoliko mejlova dnevno",
                  body: cfg.data
                    ? `Između dva mejla prolazi najmanje ${cfg.data.cooldownMinutes} minuta, a gornja granica je ${cfg.data.maxPerDay} mejla dnevno.`
                    : "Između dva mejla prolazi najmanje sat vremena, sa čvrstim dnevnim limitom.",
                },
                {
                  icon: ShieldCheck,
                  title: "Odjava jednim klikom",
                  body: "Svaki mejl nosi link za odjavu koji radi odmah, bez pitanja i bez formulara.",
                },
              ].map((step) => (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                    <step.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-cream">{step.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel rise rounded-[22px] p-7">
            <p className="num text-[11px] tracking-wider text-muted">ŠTA PIŠE U MEJLU</p>
            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                Spot cena u evrima i dinarima po gramu, u trenutku slanja.
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                Promena u procentima i razlika u dinarima na 10 g i 100 g.
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                Opseg cene za poslednjih 7 i 30 dana, da vidite kontekst.
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                Link za zaključavanje cene, ako hoćete da reagujete odmah.
              </li>
            </ul>
            <Link
              to="/zakljucaj"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold hover:underline"
            >
              Kako radi zaključavanje cene
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function KindCard({
  active,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[16px] border p-4 text-left transition-colors",
        active ? "border-gold/60 bg-gold/[0.06]" : "border-line hover:border-gold/40",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-full",
          active ? "bg-gold text-ink" : "bg-gold/10 text-gold",
        )}
      >
        {icon}
      </span>
      <p className="mt-3 text-[14px] font-semibold text-cream">{title}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{body}</p>
    </button>
  );
}
