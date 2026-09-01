import { Link, useLocation } from "wouter";
import { Feather } from "lucide-react";
import { cn } from "../lib/utils";
import { StatusPill } from "./status-pill";
import { useSpot } from "../queries/market";

const NAV = [
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/admin", label: "Admin" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const spot = useSpot();

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-gold">
              <Feather className="size-4 text-ink" strokeWidth={2.5} />
            </span>
            <span className="display hidden text-[15px] font-bold text-cream min-[420px]:inline">
              GOLDEN FEATHER
            </span>
          </Link>

          {/* Always visible — also on phones and inside narrow embeds. */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors sm:px-3.5 sm:text-[13px]",
                  location === item.href
                    ? "bg-panel2 text-cream"
                    : "text-muted hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <StatusPill status={spot.data?.status} ageSeconds={spot.data?.data?.ageSeconds} />
        </div>
      </header>

      {children}

      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-10 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Golden Feather DOO Beograd · Bulevar Mihajla Pupina 10D/55, Novi Beograd
          </p>
          <p className="num">
            Cene su informativne i menjaju se sa berzanskim kursom. Otkup uvek po baznom spotu.
          </p>
        </div>
      </footer>
    </div>
  );
}
