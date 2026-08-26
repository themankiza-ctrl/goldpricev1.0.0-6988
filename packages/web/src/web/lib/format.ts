const eurFmt = new Intl.NumberFormat("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rsdFmt = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });

export function eur(value: number) {
  return `${eurFmt.format(value)} €`;
}

export function rsd(value: number) {
  return `${rsdFmt.format(value)} RSD`;
}

export function money(value: number, currency: "EUR" | "RSD") {
  return currency === "EUR" ? eur(value) : rsd(value);
}

export function pct(value: number, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function num(value: number, digits = 2) {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function timeAgo(seconds: number) {
  if (seconds < 60) return `pre ${Math.max(0, Math.round(seconds))}s`;
  if (seconds < 3600) return `pre ${Math.round(seconds / 60)} min`;
  return `pre ${Math.round(seconds / 3600)} h`;
}

export function clock(date: Date | string) {
  return new Date(date).toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Belgrade",
  });
}
