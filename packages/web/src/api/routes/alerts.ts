import { z } from "zod";
import { desc, eq, or } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { alertLog, alertSubscribers } from "../database/schema";
import { getPricingContext, getSettings } from "../lib/market";
import {
  describeSubscription,
  makeToken,
  resetReferences,
  runAlerts,
  sendConfirmation,
  unsubscribeUrl,
} from "../lib/alerts";
import {
  customerAlertEmail,
  fmtEur,
  internalAlertEmail,
  type PriceContextNumbers,
} from "../lib/alert-emails";
import { sendEmail, smtpConfigured, smtpSender, verifySmtp } from "../services/email";

const guarded = base.use(async ({ context, next }) => {
  const key = context.headers.get("x-admin-key");
  const cfg = await getSettings();
  if (!key || key !== cfg.adminPassword) {
    throw new ORPCError("UNAUTHORIZED", { message: "Pogrešna lozinka" });
  }
  return next({ context: { cfg } });
});

const subscribeInput = z
  .object({
    email: z.string().trim().toLowerCase().email("Unesite ispravnu email adresu"),
    kind: z.enum(["procenat", "cilj"]).default("procenat"),
    /** Dozvoljeni pragovi su namerno fiksni: 1, 2 ili 5 odsto. */
    thresholdPct: z.union([z.literal(1), z.literal(2), z.literal(5)]).default(1),
    targetEurPerGram: z.number().positive().max(100_000).nullable().default(null),
    direction: z.enum(["dole", "gore", "oba"]).default("oba"),
  })
  .refine((v) => v.kind !== "cilj" || v.targetEurPerGram !== null, {
    message: "Za ciljnu cenu unesite vrednost u EUR po gramu",
    path: ["targetEurPerGram"],
  });

export const alerts = {
  /** Javna konfiguracija koju forma traži pre nego što korisnik bilo šta unese. */
  config: base.handler(async () => {
    const cfg = await getSettings();
    const ctx = await getPricingContext();
    return {
      enabled: cfg.alertsEnabled && cfg.alertPublicEnabled,
      thresholdOptions: [1, 2, 5],
      cooldownMinutes: cfg.alertCooldownMinutes,
      maxPerDay: cfg.alertMaxPerDay,
      /** Trenutni spot — forma ga koristi kao predlog ciljne cene. */
      spotEurPerGram: ctx?.spread.baseEurPerGramXau ?? null,
      contactEmail: cfg.contactEmail,
    };
  }),

  /**
   * Prijava sa dvostrukom potvrdom: red se upisuje kao "pending" i mejl sa
   * alarmom nikada ne ide dok korisnik ne klikne link iz potvrdnog mejla.
   * Tako niko ne može da prijavi tuđu adresu.
   */
  subscribe: base.input(subscribeInput).handler(async ({ input }) => {
    const cfg = await getSettings();
    if (!cfg.alertsEnabled || !cfg.alertPublicEnabled) {
      throw new ORPCError("FORBIDDEN", { message: "Prijava na alarm je trenutno zatvorena" });
    }

    const [existing] = await db
      .select()
      .from(alertSubscribers)
      .where(eq(alertSubscribers.email, input.email))
      .limit(1);

    const token = makeToken();
    const values = {
      email: input.email,
      kind: input.kind,
      thresholdPct: input.thresholdPct,
      targetEurPerGram: input.kind === "cilj" ? input.targetEurPerGram : null,
      direction: input.kind === "cilj" ? "dole" : input.direction,
      status: "pending" as const,
      token,
      // Referenca se postavlja na cenu u trenutku potvrde, ne prijave.
      refEurPerGram: null,
      lastSentAt: null,
      sentToday: 0,
      sentDay: "",
    };

    const [row] = existing
      ? await db
          .update(alertSubscribers)
          .set(values)
          .where(eq(alertSubscribers.id, existing.id))
          .returning()
      : await db.insert(alertSubscribers).values(values).returning();

    if (!row) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Upis nije uspeo" });

    const res = await sendConfirmation(row, cfg);
    return {
      ok: true,
      emailSent: res.ok,
      /** Kada SMTP nije podešen, operater i dalje vidi prijavu u panelu. */
      warning: res.ok ? null : "Potvrdni mejl nije mogao da bude poslat — kontaktiraćemo vas.",
      description: describeSubscription(row),
    };
  }),

  /** Klik iz potvrdnog mejla — od tog momenta alarm je živ. */
  confirm: base
    .input(z.object({ token: z.string().min(8) }))
    .handler(async ({ input }) => {
      const [sub] = await db
        .select()
        .from(alertSubscribers)
        .where(eq(alertSubscribers.token, input.token))
        .limit(1);
      if (!sub) throw new ORPCError("NOT_FOUND", { message: "Link nije važeći ili je istekao" });

      if (sub.status === "aktivan") {
        return { ok: true, already: true, description: describeSubscription(sub) };
      }

      const ctx = await getPricingContext();
      await db
        .update(alertSubscribers)
        .set({
          status: "aktivan",
          confirmedAt: new Date(),
          unsubscribedAt: null,
          refEurPerGram: ctx?.spread.baseEurPerGramXau ?? null,
        })
        .where(eq(alertSubscribers.id, sub.id));

      return { ok: true, already: false, description: describeSubscription(sub) };
    }),

  unsubscribe: base
    .input(z.object({ token: z.string().min(8) }))
    .handler(async ({ input }) => {
      const [sub] = await db
        .select()
        .from(alertSubscribers)
        .where(eq(alertSubscribers.token, input.token))
        .limit(1);
      if (!sub) throw new ORPCError("NOT_FOUND", { message: "Link nije važeći" });

      await db
        .update(alertSubscribers)
        .set({ status: "odjavljen", unsubscribedAt: new Date() })
        .where(eq(alertSubscribers.id, sub.id));

      return { ok: true, email: sub.email };
    }),

  /* ------------------------------------------------------------ admin deo */

  list: guarded
    .input(
      z
        .object({
          status: z.enum(["all", "pending", "aktivan", "ispunjen", "odjavljen"]).default("all"),
          limit: z.number().int().min(1).max(500).default(200),
        })
        .default({ status: "all", limit: 200 }),
    )
    .handler(async ({ input, context }) => {
      const rows = await db
        .select()
        .from(alertSubscribers)
        .where(input.status === "all" ? undefined : eq(alertSubscribers.status, input.status))
        .orderBy(desc(alertSubscribers.createdAt))
        .limit(input.limit);

      return {
        rows: rows.map((r) => ({
          ...r,
          description: describeSubscription(r),
          unsubscribeUrl: unsubscribeUrl(context.cfg, r.token),
        })),
        counts: {
          total: rows.length,
          aktivan: rows.filter((r) => r.status === "aktivan").length,
          pending: rows.filter((r) => r.status === "pending").length,
          odjavljen: rows.filter((r) => r.status === "odjavljen").length,
          ispunjen: rows.filter((r) => r.status === "ispunjen").length,
        },
      };
    }),

  log: guarded
    .input(z.object({ limit: z.number().int().min(1).max(500).default(100) }).default({ limit: 100 }))
    .handler(async ({ input }) => {
      return db.select().from(alertLog).orderBy(desc(alertLog.id)).limit(input.limit);
    }),

  /** Stanje SMTP-a — panel odmah pokaže da li slanje uopšte može da radi. */
  status: guarded.handler(async ({ context }) => {
    const ctx = await getPricingContext();
    const [lastOk] = await db
      .select()
      .from(alertLog)
      .where(eq(alertLog.ok, true))
      .orderBy(desc(alertLog.id))
      .limit(1);
    const [lastErr] = await db
      .select()
      .from(alertLog)
      .where(eq(alertLog.ok, false))
      .orderBy(desc(alertLog.id))
      .limit(1);

    return {
      smtpConfigured: smtpConfigured(),
      sender: smtpSender(),
      spotEurPerGram: ctx?.spread.baseEurPerGramXau ?? null,
      internalRef: context.cfg.alertInternalRef,
      internalLastAt: context.cfg.alertInternalLastAt,
      internalSentToday: context.cfg.alertInternalSentDay
        ? context.cfg.alertInternalSentToday
        : 0,
      lastOkAt: lastOk?.createdAt ?? null,
      lastError: lastErr && (!lastOk || lastErr.id > lastOk.id) ? lastErr.error : null,
    };
  }),

  verifySmtp: guarded.handler(() => verifySmtp()),

  /** Probni mejl na jednu adresu, sa realnim brojevima ali bez pomeranja referenci. */
  testSend: guarded
    .input(z.object({ to: z.string().trim().email(), variant: z.enum(["interni", "kupac"]).default("interni") }))
    .handler(async ({ input, context }) => {
      const ctx = await getPricingContext();
      if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Tržišni podaci nisu dostupni" });

      const price = ctx.spread.baseEurPerGramXau;
      const ref = price / 1.01;
      const n: PriceContextNumbers = {
        eurPerGram: price,
        refEurPerGram: ref,
        movePct: 1,
        eurRsd: ctx.market.eurRsdMiddle,
        low7: null,
        high7: null,
        low30: null,
        high30: null,
      };

      const mail =
        input.variant === "interni"
          ? internalAlertEmail({
              n,
              status: ctx.status,
              modifiers: ctx.spread.modifiers.filter((m) => m.active).map((m) => m.label),
              thresholdPct: context.cfg.alertInternalPct,
              siteUrl: context.cfg.alertSiteUrl,
            })
          : customerAlertEmail({
              n,
              kind: "procenat",
              thresholdPct: 1,
              targetEurPerGram: null,
              siteUrl: context.cfg.alertSiteUrl,
              unsubscribeUrl: `${context.cfg.alertSiteUrl}/alarm?odjava=test`,
            });

      const res = await sendEmail({
        to: input.to,
        subject: `[TEST] ${mail.subject}`,
        html: mail.html,
        text: mail.text,
        fromName: context.cfg.alertFromName,
        replyTo: context.cfg.contactEmail,
      });

      await db.insert(alertLog).values({
        channel: "test",
        toEmail: input.to,
        subject: `[TEST] ${mail.subject}`,
        eurPerGram: price,
        refEurPerGram: ref,
        movePct: 1,
        ok: res.ok,
        error: res.error ?? null,
      });

      return res;
    }),

  /** Ručno pokretanje provere — ne čeka minutni ciklus. */
  runNow: guarded.handler(async () => {
    const ctx = await getPricingContext(true);
    if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Tržišni podaci nisu dostupni" });
    return runAlerts(ctx);
  }),

  /** Poravna sve reference na trenutnu cenu — posle promene pragova. */
  resetRefs: guarded.handler(async ({ context }) => {
    const ctx = await getPricingContext();
    if (!ctx) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Tržišni podaci nisu dostupni" });
    await resetReferences(ctx.spread.baseEurPerGramXau, context.cfg.id);
    return { ok: true, refEurPerGram: ctx.spread.baseEurPerGramXau, pretty: `${fmtEur(ctx.spread.baseEurPerGramXau)} €/g` };
  }),

  /** Operater može da ugasi pojedinačnog pretplatnika (žalba, greška u adresi). */
  setStatus: guarded
    .input(z.object({ id: z.number().int(), status: z.enum(["aktivan", "odjavljen"]) }))
    .handler(async ({ input }) => {
      const ctx = await getPricingContext();
      await db
        .update(alertSubscribers)
        .set({
          status: input.status,
          unsubscribedAt: input.status === "odjavljen" ? new Date() : null,
          confirmedAt: input.status === "aktivan" ? new Date() : undefined,
          refEurPerGram:
            input.status === "aktivan" ? (ctx?.spread.baseEurPerGramXau ?? null) : undefined,
        })
        .where(eq(alertSubscribers.id, input.id));
      return { ok: true };
    }),

  /** Čišćenje: briše odjavljene i ispunjene redove. */
  purge: guarded.handler(async () => {
    const res = await db
      .delete(alertSubscribers)
      .where(or(eq(alertSubscribers.status, "odjavljen"), eq(alertSubscribers.status, "ispunjen")))
      .returning({ id: alertSubscribers.id });
    return { removed: res.length };
  }),

  /** Ponovno slanje potvrdnog mejla za red koji visi u "pending". */
  resendConfirm: guarded
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input, context }) => {
      const [sub] = await db
        .select()
        .from(alertSubscribers)
        .where(eq(alertSubscribers.id, input.id))
        .limit(1);
      if (!sub) throw new ORPCError("NOT_FOUND", { message: "Pretplatnik ne postoji" });
      if (sub.status !== "pending") {
        throw new ORPCError("BAD_REQUEST", { message: "Pretplata nije u statusu pending" });
      }
      return sendConfirmation(sub, context.cfg);
    }),
};
