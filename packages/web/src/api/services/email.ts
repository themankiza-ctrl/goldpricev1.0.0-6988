import nodemailer, { type Transporter } from "nodemailer";

/**
 * Slanje mejla preko običnog SMTP-a.
 *
 * Namerno SMTP, a ne Resend/Postmark: za prodajazlata.com nemamo pristup DNS-u,
 * pa ne možemo da verifikujemo domen. SMTP radi sa bilo kojim nalogom koji već
 * postoji — Gmail App Password, Brevo, Zoho, cPanel mail — bez ijednog DNS zapisa.
 *
 * Potrebne promenljive okruženja (.env):
 *   SMTP_HOST   npr. smtp.gmail.com
 *   SMTP_PORT   587 (STARTTLS) ili 465 (SSL)
 *   SMTP_USER   pun email nalog sa kog se šalje
 *   SMTP_PASS   App Password / SMTP ključ (nikako obična lozinka naloga)
 *   SMTP_FROM   opciono, "Golden Feather <alarm@...>"; podrazumevano SMTP_USER
 *
 * Bez podešenog SMTP-a aplikacija ne pada: mejl se ispiše u konzolu i upiše u
 * alert_log sa greškom, tako da se ceo tok može testirati i pre kredencijala.
 */

export type SendResult = { ok: boolean; error?: string };

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number.parseInt(process.env.SMTP_PORT?.trim() || "587", 10);
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    pass,
    from: process.env.SMTP_FROM?.trim() || user,
  };
}

let cached: { key: string; transporter: Transporter } | null = null;

function getTransporter(cfg: SmtpConfig): Transporter {
  const key = `${cfg.host}:${cfg.port}:${cfg.user}`;
  if (cached && cached.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    // 465 je implicitni TLS, 587 kreće čist pa podiže STARTTLS.
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  cached = { key, transporter };
  return transporter;
}

export function smtpConfigured(): boolean {
  return readConfig() !== null;
}

/** Koji nalog šalje — prikazuje se u admin panelu. */
export function smtpSender(): string | null {
  return readConfig()?.from ?? null;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  replyTo?: string;
  /** Jedan klik na "Unsubscribe" u Gmail-u/Apple Mail-u. */
  unsubscribeUrl?: string;
}): Promise<SendResult> {
  const cfg = readConfig();
  if (!cfg) {
    console.warn(
      `[email] SMTP nije konfigurisan — mejl NIJE poslat.\n  to: ${opts.to}\n  subject: ${opts.subject}`,
    );
    return { ok: false, error: "SMTP nije konfigurisan (SMTP_HOST/SMTP_USER/SMTP_PASS)" };
  }

  const from = opts.fromName ? `${opts.fromName} <${addressOf(cfg.from)}>` : cfg.from;

  try {
    await getTransporter(cfg).sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
      headers: opts.unsubscribeUrl
        ? {
            "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] slanje palo za ${opts.to}: ${message}`);
    return { ok: false, error: message };
  }
}

/** Izvuče čistu adresu iz "Ime <adresa>" zapisa. */
function addressOf(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] ?? raw).trim();
}

/** Provera kredencijala bez slanja — koristi admin panel. */
export async function verifySmtp(): Promise<SendResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, error: "SMTP nije konfigurisan" };
  try {
    await getTransporter(cfg).verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
