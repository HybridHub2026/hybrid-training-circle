import { z } from "zod";
import { partnerSubjects } from "./partners";
import { formsConfigured, readLimitedJson, type FormsEnvironment } from "./service";

const OWNER = "hybridhubadmin@gmail.com";
const COOKIE = "__Host-hh_admin";
const HOUR = 3600000;
const TEST_EMAILS = ["launch-pt", "launch-es", "launch-en", "contact-pt", "contact-es", "contact-en"].map(tag => `hybridhubadmin+${tag}@gmail.com`);
const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", Vary: "Cookie" };
const json = (body: unknown, status = 200, extra = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), n => n.toString(16).padStart(2, "0")).join("");
function equal(a: string, b: string) { let difference = a.length ^ b.length; for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0); return difference === 0; }
const cookie = (token: string, seconds = 3600) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`;
async function session(request: Request, env: FormsEnvironment) {
  const token = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = await hash(token);
  const row = await env.FORMS_DB!.prepare("SELECT expires_at FROM admin_sessions WHERE token_hash=? AND expires_at>?").bind(tokenHash, Date.now()).first<{ expires_at: number }>();
  return row ? { tokenHash, expiresAt: row.expires_at } : null;
}
function validOrigin(request: Request) {
  const url = new URL(request.url);
  return ["https://hybridhub.pt", "https://www.hybridhub.pt"].includes(request.headers.get("origin") ?? "") && url.protocol === "https:";
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request"), token: z.string().min(1).max(4096) }),
  z.object({ action: z.literal("verify"), challenge: z.string().uuid(), code: z.string().regex(/^\d{8}$/) }),
  z.object({ action: z.literal("logout") }),
]);

/** Only the fixed owner mailbox can receive a login code. No list data is public. */
export async function handleAdmin(request: Request, env: FormsEnvironment): Promise<Response> {
  if (!formsConfigured(env)) return json({ error: "unavailable" }, 503);
  try {
    const db = env.FORMS_DB!;
    const now = Date.now();
    if (request.method === "GET") {
      // Reject cross-site authenticated fetches, including direct navigation to a CSV.
      if (request.headers.get("sec-fetch-site") === "cross-site") return json({ error: "forbidden" }, 403);
      const auth = await session(request, env);
      const url = new URL(request.url);
      const action = url.searchParams.get("action") ?? "session";
      if (action === "session") return json({ authenticated: Boolean(auth), expiresAt: auth?.expiresAt ?? null });
      if (!auth) return json({ error: "unauthorized" }, 401);
      if (!["list", "export"].includes(action)) return json({ error: "invalid_action" }, 400);
      const q = (url.searchParams.get("q") ?? "").trim().slice(0, 254);
      const language = url.searchParams.get("language") ?? "";
      if (language && !["pt", "es", "en"].includes(language)) return json({ error: "invalid_filter" }, 400);
      const showTests = url.searchParams.get("tests") === "1";
      const group = url.searchParams.get("group") ?? "launch";
      if (!["launch", "partners"].includes(group)) return json({ error: "invalid_filter" }, 400);
      const partners = group === "partners";
      const conditions = [partners ? "(kind='contact' AND subject IN (?,?))" : "kind='launch'"];
      const values: unknown[] = partners ? Object.values(partnerSubjects) : [];
      if (!showTests) { conditions.push(`email NOT IN (${TEST_EMAILS.map(() => "?").join(",")})`); values.push(...TEST_EMAILS); }
      if (q) { conditions.push("email LIKE ? ESCAPE '\\'"); values.push(`%${q.replace(/[\\%_]/g, value => `\\${value}`)}%`); }
      if (language) { conditions.push("language=?"); values.push(language); }
      const where = conditions.join(" AND ");
      const count = await db.prepare(`SELECT COUNT(*) AS total FROM form_submissions WHERE ${where}`).bind(...values).first<{ total: number }>();
      const total = count?.total ?? 0;
      const page = Math.max(1, Math.min(100000, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1));
      const limit = action === "export" ? 10000 : 50;
      if (action === "export" && total > limit) return json({ error: "export_too_large" }, 422);
      const rows = await db.prepare(`SELECT ${partners ? "id,name,subject,message," : ""}email,language,created_at FROM form_submissions WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`).bind(...values, limit, action === "export" ? 0 : (page - 1) * limit).all<{ id?: string; name?: string; subject?: string; message?: string; email: string; language: string; created_at: number }>();
      if (action === "export") {
        const cell = (text: string) => `"${(/^[=+@\-\t\r\n]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
        const csv = "\uFEFF" + [partners ? ["Nome", "Tipo", "Respostas", "Email", "Idioma", "Data de inscrição (UTC)"] : ["Email", "Idioma", "Data de inscrição (UTC)"], ...rows.results.map(row => [...(partners ? [row.name ?? "", row.subject ?? "", row.message ?? ""] : []), row.email, row.language.toUpperCase(), new Date(row.created_at).toISOString()])].map(row => row.map(cell).join(";")).join("\r\n");
        return new Response(csv, { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hybrid-hub-inscritos-${new Date(now).toISOString().slice(0, 10)}.csv"` } });
      }
      return json({ total, page, pageSize: limit, subscribers: rows.results, expiresAt: auth.expiresAt });
    }
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    if (!validOrigin(request)) return json({ error: "forbidden" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalid_request" }, 415);
    let body: z.infer<typeof bodySchema>;
    try { body = bodySchema.parse(await readLimitedJson(request)); } catch { return json({ error: "invalid_request" }, 400); }
    if (body.action === "logout") {
      const auth = await session(request, env);
      if (auth) await db.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(auth.tokenHash).run();
      return json({ authenticated: false }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (body.action === "verify") {
      const challenge = await db.prepare("UPDATE admin_login_challenges SET attempts=attempts+1 WHERE id=? AND expires_at>? AND used_at IS NULL AND attempts<5 RETURNING code_hash").bind(body.challenge, now).first<{ code_hash: string }>();
      if (!challenge || !equal(challenge.code_hash, await hash(`${body.challenge}:${body.code}`))) return json({ error: "invalid_code" }, 401);
      const consumed = await db.prepare("UPDATE admin_login_challenges SET used_at=? WHERE id=? AND used_at IS NULL RETURNING id").bind(now, body.challenge).first();
      if (!consumed) return json({ error: "invalid_code" }, 401);
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
      await db.prepare("INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)").bind(await hash(token), now + HOUR).run();
      return json({ authenticated: true, expiresAt: now + HOUR }, 200, { "Set-Cookie": cookie(token) });
    }
    const proofResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret: env.FORMS_TURNSTILE_SECRET!, response: body.token }), signal: AbortSignal.timeout(10000) });
    const proof = await proofResponse.json() as { success?: boolean; hostname?: string; action?: string };
    if (!proofResponse.ok || !proof.success || !["hybridhub.pt", "www.hybridhub.pt"].includes(proof.hostname ?? "") || proof.action !== "website-form") return json({ error: "verification_failed" }, 403);
    const day = new Date(now).toISOString().slice(0, 10);
    await db.prepare("INSERT INTO admin_login_rate(id,day,count,last_sent) VALUES('owner',?,0,0) ON CONFLICT DO NOTHING").bind(day).run();
    const allowed = await db.prepare("UPDATE admin_login_rate SET day=?,count=CASE WHEN day=? THEN count+1 ELSE 1 END,last_sent=? WHERE id='owner' AND last_sent<=? AND (day<>? OR count<20) RETURNING count").bind(day, day, now, now - 60000, day).first();
    if (!allowed) return json({ error: "rate_limited" }, 429);
    await db.prepare("INSERT INTO form_mail_budget(day,used) VALUES(?,0) ON CONFLICT DO NOTHING").bind(day).run();
    if (!await db.prepare("UPDATE form_mail_budget SET used=used+1 WHERE day=? AND used<300 RETURNING used").bind(day).first()) return json({ error: "unavailable" }, 503);
    await db.batch([
      db.prepare("DELETE FROM admin_login_challenges WHERE expires_at<=?").bind(now),
      db.prepare("DELETE FROM admin_sessions WHERE expires_at<=?").bind(now),
    ]);
    const challenge = crypto.randomUUID();
    // Rejection sampling avoids modulo bias in the eight-digit code.
    let random: number;
    do { random = crypto.getRandomValues(new Uint32Array(1))[0]!; } while (random >= 4200000000);
    const code = String(random % 100000000).padStart(8, "0");
    await db.prepare("INSERT INTO admin_login_challenges(id,code_hash,expires_at) VALUES(?,?,?)").bind(challenge, await hash(`${challenge}:${code}`), now + 10 * 60000).run();
    const delivery = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "Content-Type": "application/json", "api-key": env.BREVO_API_KEY! }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ sender: { email: env.BREVO_SENDER_EMAIL, name: "Hybrid Hub" }, to: [{ email: OWNER }], subject: "Hybrid Hub — código de acesso aos inscritos", textContent: `O teu código de acesso à lista de inscritos é: ${code}\n\nÉ válido durante 10 minutos e só pode ser utilizado uma vez. Introduz-o em https://hybridhub.pt/inscritos.\n\nSe não pediste este código, ignora este email. Não partilhes o código com ninguém.`, tags: ["hybridhub", "admin-login"], headers: { IdempotencyKey: challenge } }),
    });
    if (!delivery.ok) { await db.prepare("UPDATE admin_login_challenges SET expires_at=0 WHERE id=?").bind(challenge).run(); return json({ error: "unavailable" }, 503); }
    return json({ challenge, expiresAt: now + 10 * 60000 });
  } catch { return json({ error: "unavailable" }, 503); }
}
