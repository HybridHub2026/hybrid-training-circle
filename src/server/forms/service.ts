import { z } from "zod";
import { consentText, makeEmail, type RecipientKind, type Submission } from "./emails";

interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface FormsDatabase {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
}
export interface FormsEnvironment {
  FORMS_DB?: FormsDatabase;
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  FORMS_ADMIN_EMAIL?: string;
  FORMS_TURNSTILE_SITE_KEY?: string;
  FORMS_TURNSTILE_SECRET?: string;
}

const schema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["launch", "contact"]),
  idioma: z.enum(["pt", "es", "en"]),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  nome: z.string().trim().max(100).default(""),
  assunto: z.string().trim().max(160).default(""),
  mensagem: z.string().trim().max(2000).default(""),
  consent: z.literal(true),
  token: z.string().min(1).max(4096),
  _gotcha: z.string().max(100).default(""),
}).refine(value => value.kind !== "contact" || (value.nome && value.assunto && value.mensagem));

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
export function formsConfigured(env: FormsEnvironment) {
  return Boolean(env.FORMS_DB && env.BREVO_API_KEY && env.BREVO_SENDER_EMAIL && env.FORMS_TURNSTILE_SITE_KEY && env.FORMS_TURNSTILE_SECRET);
}

export async function readLimitedJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty_body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) { await reader.cancel(); throw new Error("body_too_large"); }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(buffer)) as unknown;
}

async function digest(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function handleForms(request: Request, env: FormsEnvironment, waitUntil?: (promise: Promise<unknown>) => void): Promise<Response> {
  if (request.method === "GET") return json({ ready: formsConfigured(env), siteKey: env.FORMS_TURNSTILE_SITE_KEY ?? "" });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!formsConfigured(env)) return json({ error: "service_unavailable" }, 503);
  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set(["https://hybridhub.pt", "https://www.hybridhub.pt"]);
  if (["localhost", "127.0.0.1"].includes(requestUrl.hostname)) allowedOrigins.add(requestUrl.origin);
  if (!allowedOrigins.has(request.headers.get("origin") ?? "")) return json({ error: "invalid_origin" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalid_content_type" }, 415);
  let body: z.infer<typeof schema>;
  try {
    const result = schema.safeParse(await readLimitedJson(request));
    if (!result.success) return json({ error: "invalid_form" }, 400);
    body = result.data;
  } catch { return json({ error: "invalid_form" }, 400); }
  if (body._gotcha) return json({ accepted: true }, 202);
  const db = env.FORMS_DB!;
  const { token, _gotcha, ...content } = body;
  const requestHash = await digest(JSON.stringify(content));
  try {
    const existing = await db.prepare("SELECT request_hash FROM form_submissions WHERE id=?").bind(body.id).first<{ request_hash: string }>();
    if (existing) return existing.request_hash === requestHash ? json({ accepted: true }, 202) : json({ error: "request_conflict" }, 409);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.FORMS_TURNSTILE_SECRET!, response: token, idempotency_key: body.id }),
      signal: AbortSignal.timeout(10000),
    });
    if (!verification.ok) return json({ error: "verification_unavailable" }, 503);
    const proof = await verification.json() as { success?: boolean; hostname?: string; action?: string };
    if (!proof.success || !["hybridhub.pt", "www.hybridhub.pt", ...(["localhost", "127.0.0.1"].includes(requestUrl.hostname) ? [requestUrl.hostname] : [])].includes(proof.hostname ?? "") || proof.action !== "website-form") return json({ error: "verification_failed" }, 403);
    if (body.kind === "launch") {
      const signedUp = await db.prepare("SELECT id FROM form_submissions WHERE kind='launch' AND email=?").bind(body.email).first();
      if (signedUp) return json({ accepted: true }, 202);
    }
    const now = Date.now();
    const submission: Submission = { id: body.id, kind: body.kind, language: body.idioma, email: body.email, name: body.nome, subject: body.assunto, message: body.mensagem, consent_text: consentText(body.kind, body.idioma), request_hash: requestHash, created_at: now };
    await db.batch([
      db.prepare("INSERT INTO form_submissions(id,kind,language,email,name,subject,message,consent_text,request_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING").bind(...Object.values(submission)),
      ...(["user", "admin"] as const).map(recipient => db.prepare("INSERT INTO form_mail_outbox(id,submission_id,recipient) SELECT ?,id,? FROM form_submissions WHERE id=? ON CONFLICT DO NOTHING").bind(`${body.id}:${recipient}`, recipient, body.id)),
    ]);
    // Acknowledgement means durably saved, even if the email provider is temporarily unavailable.
    const stored = await db.prepare("SELECT id FROM form_submissions WHERE id=? OR (kind='launch' AND email=?)").bind(body.id, body.email).first();
    if (!stored) throw new Error("save_failed");
    const delivery = deliverPendingMail(env, 2).catch(() => { console.error("Forms mail delivery pending; scheduled retry will follow."); });
    if (waitUntil) waitUntil(delivery); else await delivery;
    return json({ accepted: true }, 202);
  } catch {
    console.error("Website form could not be processed.");
    return json({ error: "service_unavailable" }, 503);
  }
}

interface MailJob { id: string; submission_id: string; recipient: RecipientKind; attempts: number; first_attempt_at: number | null; last_error: string | null }

export async function deliverPendingMail(env: FormsEnvironment, limit = 10) {
  if (!formsConfigured(env)) return;
  const db = env.FORMS_DB!;
  for (let index = 0; index < limit; index++) {
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    const candidate = await db.prepare("SELECT id FROM form_mail_outbox WHERE (state='pending' AND next_attempt_at<=?) OR (state='sending' AND lease_until<=?) ORDER BY CASE recipient WHEN 'user' THEN 0 ELSE 1 END,id LIMIT 1").bind(now, now).first<{ id: string }>();
    if (!candidate) break;
    // Reserve quota atomically; retries count conservatively towards the same daily allowance.
    await db.prepare("INSERT INTO form_mail_budget(day,used) VALUES(?,0) ON CONFLICT DO NOTHING").bind(day).run();
    const budget = await db.prepare("UPDATE form_mail_budget SET used=used+1 WHERE day=? AND used<300 RETURNING used").bind(day).first();
    if (!budget) break;
    const job = await db.prepare("UPDATE form_mail_outbox SET state='sending',lease_until=?,attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?) WHERE id=? AND ((state='pending' AND next_attempt_at<=?) OR (state='sending' AND lease_until<=?)) RETURNING id,submission_id,recipient,attempts,first_attempt_at,last_error").bind(now + 90000, now, candidate.id, now, now).first<MailJob>();
    if (!job) continue;
    // Never retry an ambiguous transport failure after Brevo's idempotency window.
    if (job.attempts > 8 || (job.last_error === "uncertain" && now - (job.first_attempt_at ?? now) >= 14 * 60000)) {
      await db.prepare("UPDATE form_mail_outbox SET state='review',lease_until=0 WHERE id=?").bind(job.id).run();
      continue;
    }
    const submission = await db.prepare("SELECT * FROM form_submissions WHERE id=?").bind(job.submission_id).first<Submission>();
    if (!submission) continue;
    let failure = "uncertain";
    let review = false;
    let delay = Math.min(60000 * 2 ** (job.attempts - 1), 3600000);
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "api-key": env.BREVO_API_KEY! },
        body: JSON.stringify({ ...makeEmail(submission, job.recipient, env.BREVO_SENDER_EMAIL!, env.FORMS_ADMIN_EMAIL ?? "hybridhubadmin@gmail.com"), headers: { IdempotencyKey: job.id } }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json().catch(() => ({})) as { messageId?: string; code?: string; message?: string };
      if (response.ok && result.messageId) {
        await db.prepare("UPDATE form_mail_outbox SET state='sent',message_id=?,lease_until=0,last_error=NULL WHERE id=?").bind(result.messageId, job.id).run();
        continue;
      }
      // Brevo returns duplicate_parameter when a previously accepted idempotent request is repeated.
      if (response.status === 400 && result.code === "duplicate_parameter" && /idempotenc/i.test(result.message ?? "")) {
        await db.prepare("UPDATE form_mail_outbox SET state='sent',lease_until=0,last_error=NULL WHERE id=?").bind(job.id).run();
        continue;
      }
      failure = `provider_${response.status}`;
      review = response.status >= 400 && response.status < 500 && ![402, 429].includes(response.status) && result.code !== "not_enough_credits";
      if (response.status === 402 || result.code === "not_enough_credits") delay = 24 * 3600000;
    } catch { /* Keep ambiguous failures within the provider's idempotency window. */ }
    await db.prepare("UPDATE form_mail_outbox SET state=?,last_error=?,next_attempt_at=?,lease_until=0 WHERE id=?").bind(review ? "review" : "pending", failure, now + delay, job.id).run();
  }
  await db.prepare("DELETE FROM form_mail_budget WHERE day<?").bind(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).run();
}
