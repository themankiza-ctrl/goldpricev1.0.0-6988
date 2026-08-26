import { cn } from "../lib/utils";
import { timeAgo } from "../lib/format";

type Props = { status?: string; ageSeconds?: number; className?: string };

const MAP: Record<string, { label: string; dot: string; text: string; border: string }> = {
  LIVE: { label: "LIVE", dot: "bg-gold", text: "text-gold", border: "border-gold/30" },
  STALE: { label: "STALE", dot: "bg-warn", text: "text-warn", border: "border-warn/40" },
  DOWN: { label: "FEED DOWN", dot: "bg-danger", text: "text-danger", border: "border-danger/50" },
};

export function StatusPill({ status = "DOWN", ageSeconds, className }: Props) {
  const s = MAP[status] ?? MAP.DOWN!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-panel2/80 px-3 py-1.5",
        s.border,
        className,
      )}
      title={
        status === "DOWN"
          ? "Nijedan izvor nije dostupan — cene su zamrznute"
          : status === "STALE"
            ? "Podaci su stariji od dozvoljenog — koristi se rezervni izvor"
            : "Svi izvori aktivni"
      }
    >
      <span
        className={cn("size-2 rounded-full", s.dot, status === "LIVE" && "live-dot")}
        aria-hidden
      />
      <span className={cn("num text-[11px] font-medium tracking-wider", s.text)}>{s.label}</span>
      {ageSeconds !== undefined && status !== "DOWN" && (
        <span className="num text-[11px] text-muted">{timeAgo(ageSeconds)}</span>
      )}
    </span>
  );
}
