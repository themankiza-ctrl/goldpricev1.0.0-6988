import { Link } from "wouter";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { useLockConfig } from "../queries/locks";
import { useSeo } from "../lib/seo";

const ADDRESS = "Bulevar Mihajla Pupina 10D/55, Yu Biznis centar, Novi Beograd 11077";
const MAPS = "https://www.google.com/maps/search/?api=1&query=Bulevar+Mihajla+Pupina+10D+Novi+Beograd";

export default function Kontakt() {
  const cfg = useLockConfig();
  const phone = cfg.data?.phone ?? "+381621047693";
  const email = cfg.data?.email ?? "office@prodajazlata.com";
  const phonePretty = "+381 62 104 76 93";

  useSeo(
    "Kontakt i lokacija — Golden Feather, Novi Beograd",
    "Golden Feather DOO — kupovina i otkup investicionog zlata. Bulevar Mihajla Pupina 10D, Novi Beograd. Pozovite radi zakazivanja termina.",
  );

  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-8">
      <p className="num text-[11px] tracking-wider text-muted">KONTAKT</p>
      <h1 className="display mt-2 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-cream">
        Pozovite pre dolaska
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Radimo po zakazanom terminu, da bismo robu i cenu pripremili pre nego što stignete. Jedan
        poziv je dovoljan.
      </p>

      <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="panel rise rounded-[22px] p-7">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              <Phone className="size-4" />
            </span>
            <div>
              <p className="num text-[11px] tracking-wider text-muted">TELEFON</p>
              <a
                href={`tel:${phone}`}
                className="num display mt-1 block text-[24px] font-bold text-cream hover:text-gold"
              >
                {phonePretty}
              </a>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Pozovite radi zakazivanja termina, provere raspoloživosti gramaže ili dogovora o
                otkupu.
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-4 border-t border-line pt-7">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              <Mail className="size-4" />
            </span>
            <div>
              <p className="num text-[11px] tracking-wider text-muted">E-MAIL</p>
              <a
                href={`mailto:${email}`}
                className="num mt-1 block text-[16px] font-medium text-cream hover:text-gold"
              >
                {email}
              </a>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Za ponude, upite o većim količinama i pravnu dokumentaciju.
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-4 border-t border-line pt-7">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="num text-[11px] tracking-wider text-muted">ADRESA</p>
              <p className="mt-1 text-[16px] leading-relaxed font-medium text-cream">{ADDRESS}</p>
              <a
                href={MAPS}
                target="_blank"
                rel="noreferrer"
                className="num mt-3 inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline"
              >
                Otvori na mapi <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rise rounded-[22px] bg-gold p-7 text-ink" style={{ animationDelay: "80ms" }}>
            <p className="num text-[11px] tracking-wider text-ink/60">NAJBRŽI PUT</p>
            <p className="display mt-2 text-[26px] leading-tight font-extrabold">
              Zaključajte cenu pre dolaska
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              Fiksirajte cenu na 30 minuta do 12 sati, ostavite ime i telefon i preuzmite robu po toj
              ceni. Bez uplate unapred.
            </p>
            <Link
              to="/zakljucaj"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Kako radi zaključavanje <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="panel rise rounded-[22px] p-7" style={{ animationDelay: "140ms" }}>
            <p className="num text-[11px] tracking-wider text-muted">PODACI O FIRMI</p>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-muted">Naziv</dt>
                <dd className="text-right font-medium text-cream">GOLDEN FEATHER DOO BEOGRAD</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-muted">PIB</dt>
                <dd className="num text-right font-medium text-cream">114834594</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-muted">Matični broj</dt>
                <dd className="num text-right font-medium text-cream">22077341</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Sedište</dt>
                <dd className="text-right font-medium text-cream">
                  Bežanijskih ilegalaca 7, Beograd
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-muted">
        Cene na sajtu su informativne i menjaju se sa berzanskim kursom. Za investiciono zlato se PDV
        ne obračunava; srebro sadrži 20% PDV.
      </p>
    </main>
  );
}
