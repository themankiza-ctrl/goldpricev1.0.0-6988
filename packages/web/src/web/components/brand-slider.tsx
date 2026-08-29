import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

type Slide = {
  brand: string;
  logo: string;
  image: string;
  country: string;
  headline: string;
  text: string;
};

const SLIDES: Slide[] = [
  {
    brand: "Argor-Heraeus",
    logo: "/images/brands/argor-heraeus.png",
    image: "/images/products/argor-kinebar.jpg",
    country: "Švajcarska · Mendrisio",
    headline: "Kinebar® zaštita od falsifikata",
    text: "Švajcarska rafinerija sa LBMA Good Delivery statusom. Kinebar hologram je najjača zaštita na tržištu malih poluga — original se prepoznaje na prvi pogled.",
  },
  {
    brand: "Valcambi Suisse",
    logo: "/images/brands/valcambi.png",
    image: "/images/products/valcambi-livena-poluga.jpg",
    country: "Švajcarska · Balerna",
    headline: "Zavarena kartica sa sertifikatom",
    text: "Jedan od najvećih svetskih rafinera plemenitih metala. Pločice u originalnoj zavarenoj kartici sa serijskim brojem — najlikvidniji format za manje ulaganje.",
  },
  {
    brand: "Heraeus",
    logo: "/images/brands/heraeus.png",
    image: "/images/products/heraeus-poluga.jpg",
    country: "Nemačka · Hanau",
    headline: "Nemačka preciznost od 1851.",
    text: "Heraeus poluge finoće 999,9 priznate su na svakom berzanskom tržištu. Standard za ulaganja od jedne unce i više.",
  },
  {
    brand: "Münze Österreich",
    logo: "/images/brands/munze-osterreich.png",
    image: "/images/products/wp-zlato.jpg",
    country: "Austrija · Beč",
    headline: "Wiener Philharmoniker i dukati",
    text: "Austrijska državna kovnica. Filharmoničar je najprodavanija zlatna kovanica u Evropi, a dukati Franc Jozef klasika svake srpske porodične ušteđevine.",
  },
];

const INTERVAL = 5000;

export default function BrandSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const active = SLIDES[index];

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="num text-[11px] tracking-wider text-muted">PROIZVOĐAČI</p>
          <h2 className="display mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-bold">
            Samo priznate kovnice
          </h2>
        </div>
        <div className="num flex items-center gap-2 text-[11px] text-muted">
          {SLIDES.map((s, i) => (
            <button
              key={s.brand}
              type="button"
              aria-label={s.brand}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-gold" : "w-3 bg-line hover:bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      <div
        className="panel mt-6 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid items-stretch md:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden bg-white md:aspect-auto md:min-h-[340px]">
            {SLIDES.map((s, i) => (
              <img
                key={s.image}
                src={s.image}
                alt={s.brand}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 size-full object-contain p-8 transition-opacity duration-700",
                  i === index ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>

          <div className="flex flex-col justify-center gap-4 p-8">
            <div className="flex w-fit items-center rounded-lg bg-white px-3 py-2 ring-1 ring-black/5">
              <img
                src={active.logo}
                alt={active.brand}
                className="h-5 w-auto max-w-[150px] object-contain"
              />
            </div>
            <div>
              <p className="num text-[10px] tracking-wider text-muted">
                {active.country.toUpperCase()}
              </p>
              <h3 className="display mt-2 text-[22px] leading-tight font-bold text-cream">
                {active.headline}
              </h3>
            </div>
            <p className="max-w-prose text-[13px] leading-relaxed text-muted">{active.text}</p>
            <a
              href="#cenovnik"
              className="num mt-1 w-fit rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              CENE {active.brand.toUpperCase()}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
