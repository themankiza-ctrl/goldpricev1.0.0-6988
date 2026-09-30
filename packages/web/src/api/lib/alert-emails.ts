/**
 * HTML + tekst šabloni za cenovne alarme.
 *
 * Mejl klijenti (posebno Gmail i Outlook) izbacuju <style> blokove i moderan
 * CSS, pa je sve na tabelama i inline stilovima. Boje su iz brend sistema:
 * zlatna #F5C518 na crnoj #0A0A0A.
 */

const GOLD = "#F5C518";
const INK = "#0A0A0A";
const PANEL = "#141414";
const LINE = "#262626";
const CREAM = "#F5F1E8";
const MUTED = "#9A958B";
const UP = "#4ADE80";
const DOWN = "#F87171";

export function fmtEur(value: number, digits = 2): string {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function fmtRsd(value: number): string {
  return new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function fmtPct(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${fmtEur(Math.abs(value), 2)}%`;
}

export function belgradeTime(date = new Date()): string {
  return new Intl.DateTimeFormat("sr-RS", {
    timeZone: "Europe/Belgrade",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type PriceContextNumbers = {
  /** Spot cena zlata u EUR po gramu, sada. */
  eurPerGram: number;
  /** Referentna cena od koje se meri pomeraj. */
  refEurPerGram: number;
  movePct: number;
  eurRsd: number;
  /** min/max spot u EUR/g za poslednjih 7 i 30 dana. */
  low7: number | null;
  high7: number | null;
  low30: number | null;
  high30: number | null;
};

function shell(inner: string, footer: string): string {
  return `<!doctype html>
<html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Golden Feather</title></head>
<body style="margin:0;padding:0;background:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border:1px solid ${LINE};border-radius:20px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td style="padding:22px 26px 0 26px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:10px;">
      <div style="width:30px;height:30px;border-radius:999px;background:${GOLD};text-align:center;line-height:30px;font-size:16px;color:${INK};font-weight:700;">&#10022;</div>
    </td>
    <td style="font-size:14px;font-weight:700;letter-spacing:0.08em;color:${CREAM};">GOLDEN FEATHER</td>
  </tr></table>
</td></tr>
${inner}
<tr><td style="padding:18px 26px 24px 26px;border-top:1px solid ${LINE};color:${MUTED};font-size:11px;line-height:1.6;">
  ${footer}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function statRow(label: string, value: string, accent = CREAM): string {
  return `<tr>
    <td style="padding:7px 0;color:${MUTED};font-size:12px;">${label}</td>
    <td align="right" style="padding:7px 0;color:${accent};font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;">${value}</td>
  </tr>`;
}

function contextLines(n: PriceContextNumbers): string {
  const parts: string[] = [];
  if (n.low7 !== null && n.high7 !== null) {
    parts.push(statRow("7 dana (min – max)", `${fmtEur(n.low7)} – ${fmtEur(n.high7)} €/g`));
  }
  if (n.low30 !== null && n.high30 !== null) {
    parts.push(statRow("30 dana (min – max)", `${fmtEur(n.low30)} – ${fmtEur(n.high30)} €/g`));
  }
  return parts.join("");
}

/** Kratak opis gde se trenutna cena nalazi u odnosu na poslednjih 30 dana. */
export function positionNote(n: PriceContextNumbers): string | null {
  if (n.low30 === null || n.high30 === null || n.high30 <= n.low30) return null;
  const pos = (n.eurPerGram - n.low30) / (n.high30 - n.low30);
  if (pos <= 0.08) return "Ovo je najniža cena u poslednjih 30 dana.";
  if (pos <= 0.25) return "Cena je u donjoj četvrtini opsega za poslednjih 30 dana.";
  if (pos >= 0.92) return "Ovo je najviša cena u poslednjih 30 dana.";
  if (pos >= 0.75) return "Cena je u gornjoj četvrtini opsega za poslednjih 30 dana.";
  return null;
}

/* ------------------------------------------------------------------ interni */

export function internalAlertEmail(args: {
  n: PriceContextNumbers;
  status: string;
  modifiers: string[];
  thresholdPct: number;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const { n } = args;
  const dir = n.movePct >= 0 ? "porastao" : "pao";
  const accent = n.movePct >= 0 ? UP : DOWN;
  const subject = `Spot ${fmtPct(n.movePct)} — zlato ${fmtEur(n.eurPerGram)} €/g`;

  const inner = `
<tr><td style="padding:18px 26px 0 26px;">
  <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,197,24,0.12);color:${GOLD};font-size:11px;font-weight:700;letter-spacing:0.06em;">INTERNI ALARM</div>
  <h1 style="margin:14px 0 6px 0;font-size:24px;line-height:1.25;color:${CREAM};font-weight:800;">
    Spot je ${dir} <span style="color:${accent};">${fmtPct(n.movePct)}</span>
  </h1>
  <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
    Prag od ${fmtEur(args.thresholdPct, 1)}% je prešen. Referenca je pomerena na novu cenu,
    sledeći alarm se meri od nje.
  </p>
</td></tr>
<tr><td style="padding:18px 26px 0 26px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border:1px solid ${LINE};border-radius:14px;padding:6px 16px;">
    ${statRow("Spot sada", `${fmtEur(n.eurPerGram)} €/g`, GOLD)}
    ${statRow("Referenca", `${fmtEur(n.refEurPerGram)} €/g`)}
    ${statRow("Promena", `${fmtPct(n.movePct)} (${fmtEur(n.eurPerGram - n.refEurPerGram)} €/g)`, accent)}
    ${statRow("Na 100 g", `${fmtRsd((n.eurPerGram - n.refEurPerGram) * 100 * n.eurRsd)} RSD`, accent)}
    ${statRow("EUR/RSD (NBS)", fmtEur(n.eurRsd, 4))}
    ${statRow("Status feeda", args.status, args.status === "LIVE" ? UP : DOWN)}
    ${statRow("Aktivni modifikatori", args.modifiers.length ? args.modifiers.join(", ") : "nema")}
    ${contextLines(n)}
  </table>
</td></tr>
<tr><td style="padding:18px 26px 22px 26px;">
  <a href="${args.siteUrl}/admin" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:999px;">Otvori admin panel</a>
</td></tr>`;

  const text = [
    `INTERNI ALARM — spot je ${dir} ${fmtPct(n.movePct)}`,
    ``,
    `Spot sada:      ${fmtEur(n.eurPerGram)} EUR/g`,
    `Referenca:      ${fmtEur(n.refEurPerGram)} EUR/g`,
    `Promena:        ${fmtPct(n.movePct)} (${fmtEur(n.eurPerGram - n.refEurPerGram)} EUR/g)`,
    `Na 100 g:       ${fmtRsd((n.eurPerGram - n.refEurPerGram) * 100 * n.eurRsd)} RSD`,
    `EUR/RSD (NBS):  ${fmtEur(n.eurRsd, 4)}`,
    `Status feeda:   ${args.status}`,
    `Modifikatori:   ${args.modifiers.length ? args.modifiers.join(", ") : "nema"}`,
    ``,
    `Admin: ${args.siteUrl}/admin`,
    `Vreme: ${belgradeTime()}`,
  ].join("\n");

  return {
    subject,
    html: shell(
      inner,
      `Automatski interni alarm sa ${args.siteUrl.replace(/^https?:\/\//, "")} · ${belgradeTime()}<br>
       Prag i primaoce menjaš u admin panelu, kartica „Alarmi".`,
    ),
    text,
  };
}

/* -------------------------------------------------------------------- kupac */

export function customerAlertEmail(args: {
  n: PriceContextNumbers;
  /** procenat | cilj */
  kind: string;
  thresholdPct: number;
  targetEurPerGram: number | null;
  siteUrl: string;
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const { n } = args;
  const down = n.movePct < 0;
  const accent = down ? DOWN : UP;

  const subject =
    args.kind === "cilj" && args.targetEurPerGram !== null
      ? `Zlato je ispod ${fmtEur(args.targetEurPerGram)} €/g — sada ${fmtEur(n.eurPerGram)} €/g`
      : `Zlato ${down ? "palo" : "poraslo"} ${fmtPct(n.movePct)} — sada ${fmtEur(n.eurPerGram)} €/g`;

  const headline =
    args.kind === "cilj" && args.targetEurPerGram !== null
      ? `Cena je spustila ispod vaše granice od ${fmtEur(args.targetEurPerGram)} €/g`
      : `Cena zlata je ${down ? "pala" : "porasla"} <span style="color:${accent};">${fmtPct(n.movePct)}</span>`;

  const lead =
    args.kind === "cilj"
      ? `Ovo je jednokratno obaveštenje — vaša granica je dostignuta, pa se alarm gasi. Novu granicu možete postaviti u svakom trenutku.`
      : `Prijavljeni ste na pomeraj od ${fmtEur(args.thresholdPct, 0)}%. Referenca je pomerena na novu cenu, tako da ne dobijate isti alarm dva puta.`;

  const note = positionNote(n);

  const inner = `
<tr><td style="padding:18px 26px 0 26px;">
  <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(245,197,24,0.12);color:${GOLD};font-size:11px;font-weight:700;letter-spacing:0.06em;">CENOVNI ALARM</div>
  <h1 style="margin:14px 0 8px 0;font-size:23px;line-height:1.3;color:${CREAM};font-weight:800;">${headline}</h1>
  <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.65;">${lead}</p>
</td></tr>
<tr><td style="padding:18px 26px 0 26px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border:1px solid ${LINE};border-radius:14px;padding:6px 16px;">
    ${statRow("Spot cena zlata", `${fmtEur(n.eurPerGram)} €/g`, GOLD)}
    ${statRow("U dinarima", `${fmtRsd(n.eurPerGram * n.eurRsd)} RSD/g`)}
    ${statRow("Promena od zadnjeg alarma", fmtPct(n.movePct), accent)}
    ${statRow("Razlika na 10 g", `${fmtRsd((n.eurPerGram - n.refEurPerGram) * 10 * n.eurRsd)} RSD`, accent)}
    ${statRow("Razlika na 100 g", `${fmtRsd((n.eurPerGram - n.refEurPerGram) * 100 * n.eurRsd)} RSD`, accent)}
    ${contextLines(n)}
  </table>
  ${
    note
      ? `<p style="margin:14px 0 0 0;padding:10px 14px;background:rgba(245,197,24,0.08);border-left:3px solid ${GOLD};color:${CREAM};font-size:12.5px;line-height:1.6;">${note}</p>`
      : ""
  }
</td></tr>
<tr><td style="padding:20px 26px 6px 26px;">
  <a href="${args.siteUrl}/zakljucaj" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:999px;">Zaključaj cenu</a>
  <a href="${args.siteUrl}/" style="display:inline-block;margin-left:8px;color:${CREAM};text-decoration:none;font-size:13px;font-weight:600;padding:13px 14px;">Vidi cenovnik</a>
</td></tr>
<tr><td style="padding:2px 26px 20px 26px;">
  <p style="margin:0;color:${MUTED};font-size:11.5px;line-height:1.6;">
    Spot je berzanska cena čistog zlata; naša prodajna cena poluge uključuje maržu rafinerije
    i našu maržu. Konačnu cenu vidite na sajtu u trenutku kupovine.
  </p>
</td></tr>`;

  const text = [
    subject,
    ``,
    lead.replace(/<[^>]+>/g, ""),
    ``,
    `Spot cena:        ${fmtEur(n.eurPerGram)} EUR/g (${fmtRsd(n.eurPerGram * n.eurRsd)} RSD/g)`,
    `Promena:          ${fmtPct(n.movePct)}`,
    `Razlika na 10 g:  ${fmtRsd((n.eurPerGram - n.refEurPerGram) * 10 * n.eurRsd)} RSD`,
    `Razlika na 100 g: ${fmtRsd((n.eurPerGram - n.refEurPerGram) * 100 * n.eurRsd)} RSD`,
    note ? `\n${note}` : ``,
    ``,
    `Zaključaj cenu: ${args.siteUrl}/zakljucaj`,
    `Cenovnik:       ${args.siteUrl}/`,
    ``,
    `Odjava: ${args.unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html: shell(
      inner,
      `Dobili ste ovaj mejl jer ste se prijavili na cenovni alarm na ${args.siteUrl.replace(/^https?:\/\//, "")}.<br>
       <a href="${args.unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Odjavi me sa alarma</a> · ${belgradeTime()}<br>
       Golden Feather DOO Beograd · Bulevar Mihajla Pupina 10D/55, Novi Beograd`,
    ),
    text,
  };
}

/* ------------------------------------------------------------------ potvrda */

export function confirmEmail(args: {
  confirmUrl: string;
  unsubscribeUrl: string;
  description: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const inner = `
<tr><td style="padding:18px 26px 0 26px;">
  <h1 style="margin:10px 0 8px 0;font-size:23px;line-height:1.3;color:${CREAM};font-weight:800;">Potvrdite prijavu na cenovni alarm</h1>
  <p style="margin:0 0 14px 0;color:${MUTED};font-size:13px;line-height:1.65;">
    Jedan klik i alarm je aktivan. Ako ovo niste vi, samo ignorišite mejl — bez potvrde
    vam nikada nećemo poslati alarm.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border:1px solid ${LINE};border-radius:14px;padding:6px 16px;">
    ${statRow("Prijavljujete se na", args.description, GOLD)}
  </table>
</td></tr>
<tr><td style="padding:20px 26px 24px 26px;">
  <a href="${args.confirmUrl}" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:999px;">Potvrdi alarm</a>
</td></tr>`;

  const text = [
    `Potvrdite prijavu na cenovni alarm`,
    ``,
    `Prijavljujete se na: ${args.description}`,
    ``,
    `Potvrdi: ${args.confirmUrl}`,
    ``,
    `Ako ovo niste vi, ignorišite mejl.`,
  ].join("\n");

  return {
    subject: "Potvrdite prijavu na cenovni alarm — Golden Feather",
    html: shell(
      inner,
      `Zahtev poslat sa ${args.siteUrl.replace(/^https?:\/\//, "")} · ${belgradeTime()}<br>
       <a href="${args.unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Ne želim ovaj alarm</a>`,
    ),
    text,
  };
}
