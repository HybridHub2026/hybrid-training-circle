import { z } from "zod";
import type { FormsDatabase } from "./service";
import type { FormLanguage } from "./emails";
import { launchOfferCopy } from "../../i18n/launch-offer";

export const OFFER_DAYS = 60;
const DURATION = OFFER_DAYS * 86400000;
const ready = new WeakMap<FormsDatabase, Promise<unknown>>();
export async function ensureCampaign(db: FormsDatabase) {
  let pending = ready.get(db);
  if (!pending) {
    pending = db.batch([
      db.prepare(
        "CREATE TABLE IF NOT EXISTS launch_hat_settings (id INTEGER PRIMARY KEY CHECK(id=1),launched_at INTEGER,created_at INTEGER NOT NULL)",
      ),
      db.prepare(
        "CREATE TABLE IF NOT EXISTS launch_hat_slots (slot INTEGER PRIMARY KEY CHECK(slot BETWEEN 1 AND 100),submission_id TEXT UNIQUE REFERENCES form_submissions(id) ON DELETE SET NULL,email_key TEXT UNIQUE,code TEXT UNIQUE,claim_id TEXT UNIQUE,language TEXT,consent_text TEXT,claimed_at INTEGER,redeemed_at INTEGER,order_reference TEXT UNIQUE,person_confirmed_at INTEGER)",
      ),
      db
        .prepare(
          "INSERT INTO launch_hat_settings(id,created_at) VALUES(1,?) ON CONFLICT DO NOTHING",
        )
        .bind(Date.now()),
      db.prepare(
        "WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<100) INSERT OR IGNORE INTO launch_hat_slots(slot) SELECT n FROM numbers",
      ),
    ]);
    ready.set(db, pending);
  }
  try {
    await pending;
  } catch (error) {
    ready.delete(db);
    throw error;
  }
}
export async function campaignAvailability(db: FormsDatabase) {
  await ensureCampaign(db);
  const row = await db
    .prepare(
      "SELECT (SELECT COUNT(*) FROM launch_hat_slots WHERE claimed_at IS NOT NULL) AS reserved,launched_at FROM launch_hat_settings WHERE id=1",
    )
    .first<{ reserved: number; launched_at: number | null }>();
  return {
    available:
      !!row &&
      row.reserved < 100 &&
      (row.launched_at === null || Date.now() < row.launched_at + DURATION),
    reserved: row?.reserved ?? 0,
    launchedAt: row?.launched_at ?? null,
  };
}
export async function campaignEmailKey(email: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase())),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export function campaignCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "HH-" + Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) => alphabet[n % 32]).join("")
  );
}
export function campaignStatements(
  db: FormsDatabase,
  input: {
    id: string;
    email: string;
    emailKey: string;
    claimId: string;
    code: string;
    language: FormLanguage;
    now: number;
  },
) {
  return [
    db
      .prepare(
        "UPDATE launch_hat_slots SET submission_id=(SELECT id FROM form_submissions WHERE kind='launch' AND email=?),email_key=?,claim_id=?,code=?,language=?,consent_text=?,claimed_at=? WHERE slot=(SELECT MIN(slot) FROM launch_hat_slots WHERE claimed_at IS NULL) AND NOT EXISTS(SELECT 1 FROM launch_hat_slots WHERE email_key=?) AND EXISTS(SELECT 1 FROM launch_hat_settings WHERE id=1 AND (launched_at IS NULL OR launched_at+?>?))",
      )
      .bind(
        input.email,
        input.emailKey,
        input.claimId,
        input.code,
        input.language,
        launchOfferCopy[input.language].consent,
        input.now,
        input.emailKey,
        DURATION,
        input.now,
      ),
    ...(["user", "admin"] as const).map((recipient) =>
      db
        .prepare(
          "INSERT INTO form_mail_outbox(id,submission_id,recipient) SELECT ?,submission_id,? FROM launch_hat_slots WHERE claim_id=? ON CONFLICT DO NOTHING",
        )
        .bind(`${input.claimId}:campaign:${recipient}`, recipient, input.claimId),
    ),
  ];
}
export type CampaignMail = {
  code: string | null;
  language: FormLanguage;
  launchedAt: number | null;
  opening: boolean;
};
export async function campaignMail(
  db: FormsDatabase,
  submissionId: string,
  opening = false,
): Promise<CampaignMail> {
  await ensureCampaign(db);
  const row = await db
    .prepare("SELECT code,language FROM launch_hat_slots WHERE submission_id=?")
    .bind(submissionId)
    .first<{ code: string; language: FormLanguage }>();
  const settings = await db
    .prepare("SELECT launched_at FROM launch_hat_settings WHERE id=1")
    .first<{ launched_at: number | null }>();
  return {
    code: row?.code ?? null,
    language: row?.language ?? "pt",
    launchedAt: settings?.launched_at ?? null,
    opening,
  };
}
export const campaignActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("campaign-start"),
    launchedAt: z.string().datetime(),
    confirmed: z.literal(true),
  }),
  z.object({
    action: z.literal("campaign-redeem"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^HH-[A-Z2-9]{12}$/),
    orderReference: z.string().trim().min(1).max(100),
    personConfirmed: z.literal(true),
  }),
]);
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};
const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
export async function campaignAdmin(db: FormsDatabase) {
  const state = await campaignAvailability(db);
  const rows = await db
    .prepare(
      "SELECT s.slot,s.code,f.email,s.claimed_at,s.redeemed_at,s.order_reference FROM launch_hat_slots s LEFT JOIN form_submissions f ON f.id=s.submission_id WHERE s.claimed_at IS NOT NULL ORDER BY s.slot",
    )
    .all();
  return json({
    ...state,
    expiresAt: state.launchedAt === null ? null : state.launchedAt + DURATION,
    reservations: rows.results,
  });
}
export async function mutateCampaign(
  db: FormsDatabase,
  body: z.infer<typeof campaignActionSchema>,
) {
  await ensureCampaign(db);
  const now = Date.now();
  if (body.action === "campaign-start") {
    const launchedAt = Date.parse(body.launchedAt);
    const row = await db
      .prepare(
        "UPDATE launch_hat_settings SET launched_at=? WHERE id=1 AND launched_at IS NULL RETURNING id",
      )
      .bind(launchedAt)
      .first();
    if (!row)
      return json(
        {
          message: "A data de lançamento já foi definida. O prazo de utilização não foi alterado.",
        },
        409,
      );
    await queueOpeningMail(db, launchedAt);
    return json({ saved: true });
  }
  const settings = await db
    .prepare("SELECT launched_at FROM launch_hat_settings WHERE id=1")
    .first<{ launched_at: number | null }>();
  if (!settings || settings.launched_at === null || now < settings.launched_at)
    return json(
      {
        message:
          "O prazo ainda não começou. Define a data apenas quando o merchandising estiver pronto para venda.",
      },
      409,
    );
  if (now >= settings.launched_at + DURATION)
    return json({ message: "O prazo de 60 dias desta oferta terminou." }, 409);
  try {
    const row = await db
      .prepare(
        "UPDATE launch_hat_slots SET redeemed_at=?,order_reference=?,person_confirmed_at=? WHERE code=? AND claimed_at IS NOT NULL AND redeemed_at IS NULL RETURNING slot",
      )
      .bind(now, body.orderReference, now, body.code)
      .first();
    return row
      ? json({ redeemed: true })
      : json(
          { message: "Código inexistente ou já utilizado. A oferta não foi registada novamente." },
          409,
        );
  } catch {
    return json(
      {
        message:
          "Esta encomenda já está associada a uma oferta ou não foi possível registar a utilização.",
      },
      409,
    );
  }
}
export async function queueOpeningMail(db: FormsDatabase, launchedAt?: number) {
  await ensureCampaign(db);
  const state =
    launchedAt ??
    (
      await db
        .prepare("SELECT launched_at FROM launch_hat_settings WHERE id=1")
        .first<{ launched_at: number | null }>()
    )?.launched_at;
  if (state === undefined || state === null || Date.now() >= state + DURATION) return;
  await db
    .prepare(
      "INSERT INTO form_mail_outbox(id,submission_id,recipient,next_attempt_at) SELECT 'campaign-open:'||claim_id||':user',submission_id,'user',? FROM launch_hat_slots WHERE claimed_at IS NOT NULL AND submission_id IS NOT NULL ON CONFLICT DO NOTHING",
    )
    .bind(state)
    .run();
}
