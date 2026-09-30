import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "../database";
import { alertLog, alertSubscribers, settings as settingsTable } from "../database/schema";
import type { AlertSubscriber, Settings } from "../database/schema";
import { TROY_OUNCE_G } from "./pricing";
import { spotSnapshots } from "../database/schema";
import { sendEmail } from "../services/email";
import {
  confirmEmail,
  customerAlertEmail,
  fmtEur,
  internalAlertEmail,
  type PriceContextNumbers,
} from "./alert-emails";
import type { PricingContext } from "./market";

/** YYYY-MM-DD po beogradskom vremenu — dnevni limit mora da prati lokalni dan. */
export function belgradeDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function makeToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function confirmUrl(cfg: Settings, token: string): string {
  return `${cfg.alertSiteUrl.replace(/\/+$/, "")}/alarm?potvrda=${token}`;
}

export function unsubscribeUrl(cfg: Settings, token: string): string {
  return `${cfg.alertSiteUrl.replace(/\/+$/, "")}/alarm?odjava=${token}`;
}

/** Ljudski opis pretplate — ide u potvrdni mejl i u admin listu. */
export function describeSubscription(sub: {
  kind: string;
  thresholdPct: number;
  targetEurPerGram: number | null;
  direction: string;
}): string {
  if (sub.kind === "cilj" && sub.targetEurPerGram !== null) {
    return `obaveštenje kada spot cena zlata padne ispod ${fmtEur(sub.targetEurPerGram)} €/g`;
  }
  const dir =
    sub.direction === "dole"
      ? "pad"
      : sub.direction === "gore"
        ? "rast"
        : "promenu u bilo kom smeru";
  return `${dir} spot cene zlata od ${fmtEur(sub.thresholdPct, 0)}%`;
}

/* ------------------------------------------------------------- istorija cene */

/** Min/max spot cene u EUR/g za zadati broj dana, iz snimaka tržišta. */
async function lowHigh(days: number): Promise<{ low: number | null; high: number | null }> {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await db
    .select({ xauUsd: spotSnapshots.xauUsd, eurUsd: spotSnapshots.eurUsd })
    .from(spotSnapshots)
    .where(gte(spotSnapshots.createdAt, since))
    .orderBy(desc(spotSnapshots.createdAt))
    .limit(5000);

  const values = rows
    .map((r) => r.xauUsd / r.eurUsd / TROY_OUNCE_G)
    .filter((v) => Number.isFinite(v) && v > 0);
  if (!values.length) return { low: null, high: null };
  return { low: Math.min(...values), high: Math.max(...values) };
}

async function priceNumbers(ctx: PricingContext, refEurPerGram: number): Promise<PriceContextNumbers> {
  const eurPerGram = ctx.spread.baseEurPerGramXau;
  const [w, m] = await Promise.all([lowHigh(7), lowHigh(30)]);
  return {
    eurPerGram,
    refEurPerGram,
    movePct: refEurPerGram > 0 ? ((eurPerGram - refEurPerGram) / refEurPerGram) * 100 : 0,
    eurRsd: ctx.market.eurRsdMiddle,
    low7: w.low,
    high7: w.high,
    low30: m.low,
    high30: m.high,
  };
}

/* --------------------------------------------------------------------- log */

async function logSend(row: {
  channel: string;
  toEmail: string;
  subject: string;
  eurPerGram?: number | null;
  refEurPerGram?: number | null;
  movePct?: number | null;
  ok: boolean;
  error?: string;
}) {
  await db.insert(alertLog).values({
    channel: row.channel,
    toEmail: row.toEmail,
    subject: row.subject,
    eurPerGram: row.eurPerGram ?? null,
    refEurPerGram: row.refEurPerGram ?? null,
    movePct: row.movePct ?? null,
    ok: row.ok,
    error: row.error ?? null,
  });
}

/* ------------------------------------------------------------ potvrdni mejl */

export async function sendConfirmation(sub: AlertSubscriber, cfg: Settings) {
  const mail = confirmEmail({
    confirmUrl: confirmUrl(cfg, sub.token),
    unsubscribeUrl: unsubscribeUrl(cfg, sub.token),
    description: describeSubscription(sub),
    siteUrl: cfg.alertSiteUrl,
  });
  const res = await sendEmail({
    to: sub.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    fromName: cfg.alertFromName,
    replyTo: cfg.contactEmail,
    unsubscribeUrl: unsubscribeUrl(cfg, sub.token),
  });
  await logSend({
    channel: "potvrda",
    toEmail: sub.email,
    subject: mail.subject,
    ok: res.ok,
    error: res.error,
  });
  return res;
}

/* ------------------------------------------------------------- anti-spam */

type Quota = { lastSentAt: Date | null; sentToday: number; sentDay: string };

function quotaBlocked(q: Quota, cfg: Settings, today: string): boolean {
  if (q.sentDay === today && q.sentToday >= cfg.alertMaxPerDay) return true;
  if (q.lastSentAt) {
    const minutes = (Date.now() - q.lastSentAt.getTime()) / 60_000;
    if (minutes < cfg.alertCooldownMinutes) return true;
  }
  return false;
}

function nextCount(q: Quota, today: string): number {
  return q.sentDay === today ? q.sentToday + 1 : 1;
}

/* ------------------------------------------------------------ glavna logika */

export type AlertRunResult = {
  ran: boolean;
  reason?: string;
  eurPerGram?: number;
  internalSent: number;
  customersSent: number;
  skipped: number;
};

/**
 * Jedan prolaz kroz sve alarme.
 *
 * Mehanika je "ratchet": za svakog primaoca pamtimo referentnu cenu. Kada
 * trenutna cena odstupi od reference više od praga, šaljemo mejl i referencu
 * pomerimo na novu cenu. Tako trend od 5% daje pet alarma od 1%, a ne stotine
 * mejlova na svakom osvežavanju. Preko toga idu cooldown i dnevni limit.
 */
export async function runAlerts(
  ctx: PricingContext,
  opts: { force?: boolean } = {},
): Promise<AlertRunResult> {
  const cfg = ctx.settings;
  const out: AlertRunResult = { ran: true, internalSent: 0, customersSent: 0, skipped: 0 };

  if (!cfg.alertsEnabled && !opts.force) {
    return { ...out, ran: false, reason: "Alarmi su isključeni u podešavanjima" };
  }
  if (ctx.status === "DOWN") {
    return { ...out, ran: false, reason: "Feed je DOWN — ne šaljemo alarm na sumnjive podatke" };
  }

  const price = ctx.spread.baseEurPerGramXau;
  if (!Number.isFinite(price) || price <= 0) {
    return { ...out, ran: false, reason: "Nevažeća spot cena" };
  }

  out.eurPerGram = price;
  const today = belgradeDay();

  /* ---------------------------------------------------------- interni alarm */

  if (cfg.alertInternalEnabled) {
    const ref = cfg.alertInternalRef;
    if (ref === null || ref <= 0) {
      // Prvo pokretanje: samo postavimo referencu, bez mejla.
      await db
        .update(settingsTable)
        .set({ alertInternalRef: price, updatedAt: new Date() })
        .where(eq(settingsTable.id, cfg.id));
    } else {
      const movePct = ((price - ref) / ref) * 100;
      const quota: Quota = {
        lastSentAt: cfg.alertInternalLastAt,
        sentToday: cfg.alertInternalSentToday,
        sentDay: cfg.alertInternalSentDay,
      };

      if (Math.abs(movePct) >= cfg.alertInternalPct) {
        if (quotaBlocked(quota, cfg, today) && !opts.force) {
          out.skipped += 1;
        } else {
          const n = await priceNumbers(ctx, ref);
          const mail = internalAlertEmail({
            n,
            status: ctx.status,
            modifiers: ctx.spread.modifiers.filter((m) => m.active).map((m) => m.label),
            thresholdPct: cfg.alertInternalPct,
            siteUrl: cfg.alertSiteUrl,
          });

          const recipients = cfg.alertInternalTo
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

          for (const to of recipients) {
            const res = await sendEmail({
              to,
              subject: mail.subject,
              html: mail.html,
              text: mail.text,
              fromName: cfg.alertFromName,
              replyTo: cfg.contactEmail,
            });
            if (res.ok) out.internalSent += 1;
            await logSend({
              channel: "interni",
              toEmail: to,
              subject: mail.subject,
              eurPerGram: price,
              refEurPerGram: ref,
              movePct,
              ok: res.ok,
              error: res.error,
            });
          }

          await db
            .update(settingsTable)
            .set({
              alertInternalRef: price,
              alertInternalLastAt: new Date(),
              alertInternalSentToday: nextCount(quota, today),
              alertInternalSentDay: today,
              updatedAt: new Date(),
            })
            .where(eq(settingsTable.id, cfg.id));
        }
      }
    }
  }

  /* ----------------------------------------------------------- javni alarmi */

  if (cfg.alertPublicEnabled) {
    const subs = await db
      .select()
      .from(alertSubscribers)
      .where(eq(alertSubscribers.status, "aktivan"));

    for (const sub of subs) {
      const isTarget = sub.kind === "cilj" && sub.targetEurPerGram !== null;
      const ref = sub.refEurPerGram ?? price;

      if (!isTarget && sub.refEurPerGram === null) {
        await db
          .update(alertSubscribers)
          .set({ refEurPerGram: price })
          .where(eq(alertSubscribers.id, sub.id));
        continue;
      }

      const movePct = ref > 0 ? ((price - ref) / ref) * 100 : 0;

      const hit = isTarget
        ? price <= (sub.targetEurPerGram as number)
        : sub.direction === "dole"
          ? movePct <= -sub.thresholdPct
          : sub.direction === "gore"
            ? movePct >= sub.thresholdPct
            : Math.abs(movePct) >= sub.thresholdPct;

      if (!hit) continue;

      const quota: Quota = {
        lastSentAt: sub.lastSentAt,
        sentToday: sub.sentToday,
        sentDay: sub.sentDay,
      };
      if (quotaBlocked(quota, cfg, today) && !opts.force) {
        out.skipped += 1;
        continue;
      }

      const n = await priceNumbers(ctx, ref);
      const mail = customerAlertEmail({
        n,
        kind: sub.kind,
        thresholdPct: sub.thresholdPct,
        targetEurPerGram: sub.targetEurPerGram,
        siteUrl: cfg.alertSiteUrl,
        unsubscribeUrl: unsubscribeUrl(cfg, sub.token),
      });

      const res = await sendEmail({
        to: sub.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        fromName: cfg.alertFromName,
        replyTo: cfg.contactEmail,
        unsubscribeUrl: unsubscribeUrl(cfg, sub.token),
      });
      if (res.ok) out.customersSent += 1;

      await logSend({
        channel: "kupac",
        toEmail: sub.email,
        subject: mail.subject,
        eurPerGram: price,
        refEurPerGram: ref,
        movePct,
        ok: res.ok,
        error: res.error,
      });

      await db
        .update(alertSubscribers)
        .set({
          // Ciljni alarm je jednokratan: kada se ispuni, gasi se.
          status: isTarget ? "ispunjen" : sub.status,
          refEurPerGram: price,
          lastSentAt: new Date(),
          sentToday: nextCount(quota, today),
          sentDay: today,
        })
        .where(eq(alertSubscribers.id, sub.id));
    }
  }

  return out;
}

/* ------------------------------------------------------- oportunističko pokretanje */

const ticker = { lastRun: 0, busy: false };
/** Provera ide najviše jednom u minutu, bez obzira koliko zahteva dolazi. */
const MIN_INTERVAL_MS = 60_000;

/**
 * Zove se iz putanje za cenu, fire-and-forget. Bez zasebnog cron servisa:
 * dok sajt dobija saobraćaj (ili dok ga kuca uptime ping), alarmi se proveravaju.
 */
export function maybeRunAlerts(ctx: PricingContext): void {
  if (ticker.busy) return;
  if (Date.now() - ticker.lastRun < MIN_INTERVAL_MS) return;
  ticker.busy = true;
  ticker.lastRun = Date.now();

  void runAlerts(ctx)
    .then((res) => {
      if (res.internalSent || res.customersSent) {
        console.log(
          `[alerts] poslato: interni ${res.internalSent}, kupci ${res.customersSent}, preskočeno ${res.skipped}`,
        );
      }
    })
    .catch((err) => console.error("[alerts] provera pala:", err))
    .finally(() => {
      ticker.busy = false;
    });
}

/** Ručno resetovanje referenci — admin akcija posle promene pragova. */
export async function resetReferences(price: number, cfgId: number) {
  await db
    .update(settingsTable)
    .set({ alertInternalRef: price, updatedAt: new Date() })
    .where(eq(settingsTable.id, cfgId));
  await db
    .update(alertSubscribers)
    .set({ refEurPerGram: price })
    .where(and(eq(alertSubscribers.status, "aktivan"), inArray(alertSubscribers.kind, ["procenat"])));
}
