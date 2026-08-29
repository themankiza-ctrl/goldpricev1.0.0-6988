import { useEffect, useState } from "react";
import { useCreateLock, useLockConfig } from "../queries/locks";
import { money } from "../lib/format";
import { cn } from "../lib/utils";

type Currency = "EUR" | "RSD";

export type LockTarget = {
  sku: string;
  name: string;
  sellEur: number;
  sellRsd: number;
  buyEur: number;
  buyRsd: number;
};

type Props = {
  target: LockTarget;
  currency: Currency;
  source: "sajt" | "embed" | "kalkulator";
  onClose: () => void;
};

function minuteLabel(m: number): string {
  if (m < 60) return `${m} min`;
  const h = m / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

/**
 * Lead capture + price lock. The client freezes the published price for a set
 * window; we store the request and hand them a reference plus a prefilled SMS
 * to our number, so the operator gets it even if they never check the panel.
 */
export default function LockDialog({ target, currency, source, onClose }: Props) {
  const cfg = useLockConfig();
  const create = useCreateLock();

  const [side, setSide] = useState<"kupovina" | "prodaja">("kupovina");
  const [quantity, setQuantity] = useState(1);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (minutes === null && cfg.data) setMinutes(cfg.data.defaultMinutes);
  }, [cfg.data, minutes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const unit =
    side === "kupovina"
      ? currency === "EUR"
        ? target.sellEur
        : target.sellRsd
      : currency === "EUR"
        ? target.buyEur
        : target.buyRsd;
  const total = unit * quantity;

  const created = create.data?.lock;
  const options = cfg.data?.minuteOptions ?? [30, 60, 360, 720];

  const smsHref = created
    ? `sms:${create.data?.phone}?body=${encodeURIComponent(
        [
          `ZAKLJUCAVANJE CENE ${created.ref}`,
          `${created.side === "kupovina" ? "Kupujem" : "Prodajem"}: ${created.productName} x${created.quantity}`,
          `Cena: ${Math.round(created.totalRsd).toLocaleString("sr-RS")} RSD (${created.totalEur.toFixed(2)} EUR)`,
          `Vazi do: ${new Date(created.expiresAt).toLocaleString("sr-RS")}`,
          `Ime: ${created.customerName}, tel: ${created.customerPhone}`,
        ].join("\n"),
      )}`
    : "#";

  const canSubmit =
    name.trim().length >= 2 && phone.trim().length >= 6 && minutes !== null && !create.isPending;

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex size-full max-h-none max-w-none items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      aria-modal="true"
      aria-label="Zaključavanje cene"
    >
      <div className="panel max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-line p-6 sm:rounded-3xl">
        {created ? (
          <div className="space-y-5">
            <div>
              <p className="num text-[11px] tracking-wider text-buy">CENA JE ZAKLJUČANA</p>
              <h3 className="display mt-2 text-[28px] leading-none font-bold">{created.ref}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Sačuvajte ovu šifru. Cena vam je rezervisana do{" "}
                <span className="num text-cream">
                  {new Date(created.expiresAt).toLocaleString("sr-RS", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                .
              </p>
            </div>

            <dl className="space-y-2 rounded-2xl bg-panel2 p-4 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Proizvod</dt>
                <dd className="text-right font-medium">
                  {created.productName} × {created.quantity}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Ukupno</dt>
                <dd className="num text-right font-semibold text-gold">
                  {money(created.totalRsd, "RSD")} · {money(created.totalEur, "EUR")}
                </dd>
              </div>
            </dl>

            <a
              href={smsHref}
              className="num block w-full rounded-full bg-gold py-3 text-center text-[13px] font-semibold text-ink"
            >
              POŠALJI SMS POTVRDU
            </a>
            <p className="text-[11px] leading-relaxed text-muted">
              SMS ide na {create.data?.phone}. Ako ste na računaru, samo nas pozovite i pročitajte
              šifru — zahtev je već zabeležen u sistemu.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-line py-2.5 text-[13px] text-muted hover:text-cream"
            >
              Zatvori
            </button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit || minutes === null) return;
              create.mutate({
                sku: target.sku,
                quantity,
                side,
                lockMinutes: minutes,
                customerName: name,
                customerPhone: phone,
                customerEmail: email || undefined,
                note: note || undefined,
                source,
              });
            }}
          >
            <div>
              <p className="num text-[11px] tracking-wider text-gold">ZAKLJUČAJ CENU</p>
              <h3 className="display mt-1.5 text-[22px] leading-tight font-bold">{target.name}</h3>
            </div>

            <div className="flex rounded-full border border-line bg-panel2 p-1">
              {(["kupovina", "prodaja"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={cn(
                    "num flex-1 rounded-full py-2 text-[11px] font-medium transition-colors",
                    side === s ? "bg-gold text-ink" : "text-muted hover:text-cream",
                  )}
                >
                  {s === "kupovina" ? "KUPUJEM" : "PRODAJEM VAMA"}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-panel2 px-4 py-3">
              <div>
                <p className="num text-[10px] tracking-wider text-muted">
                  {side === "kupovina" ? "PRODAJNA CENA" : "OTKUPNA CENA"}
                </p>
                <p className="num mt-1 text-[18px] font-semibold text-gold">
                  {money(total, currency)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Manje"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="num size-9 rounded-full border border-line text-cream"
                >
                  −
                </button>
                <span className="num w-8 text-center text-[15px] font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Više"
                  onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                  className="num size-9 rounded-full border border-line text-cream"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <p className="num mb-2 text-[10px] tracking-wider text-muted">TRAJANJE REZERVACIJE</p>
              <div className="grid grid-cols-4 gap-2">
                {options.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={cn(
                      "num rounded-xl border py-2 text-[12px] font-medium transition-colors",
                      minutes === m
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line text-muted hover:text-cream",
                    )}
                  >
                    {minuteLabel(m)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <input
                aria-label="Ime i prezime"
                className="field w-full"
                placeholder="Ime i prezime"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                aria-label="Telefon"
                className="field w-full"
                placeholder="Telefon (npr. 060 123 4567)"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                aria-label="Email (opciono)"
                className="field w-full"
                placeholder="Email (opciono)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                aria-label="Napomena (opciono)"
                className="field w-full"
                placeholder="Napomena (opciono)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {create.isError && (
              <p className="rounded-xl border border-danger/40 px-3 py-2 text-[12px] text-danger">
                {create.error?.message || "Zahtev nije prošao. Pozovite nas telefonom."}
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-muted">
              Zaključavanjem cene rezervišete iznos na izabrano vreme. Rezervacija nije obavezujuća
              kupovina; potvrđuje se u poslovnici ili uplatom u roku.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-line py-3 text-[13px] text-muted hover:text-cream"
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="num flex-1 rounded-full bg-gold py-3 text-[13px] font-semibold text-ink disabled:opacity-40"
              >
                {create.isPending ? "ČUVAM…" : "ZAKLJUČAJ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
