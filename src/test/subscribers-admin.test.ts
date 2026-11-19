// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleAdmin } from "@/server/forms/admin";
import type { FormsDatabase, FormsEnvironment } from "@/server/forms/service";

let sqlite: DatabaseSync;
let env: FormsEnvironment;
let mail: ReturnType<typeof vi.fn<(url: string, init: RequestInit) => Promise<Response>>>;
function adapter(db: DatabaseSync): FormsDatabase {
  function statement(sql: string, values: unknown[] = []) {
    return {
      bind: (...args: unknown[]) => statement(sql, args),
      first: async <T>() => (db.prepare(sql).get(...values as never[]) ?? null) as T | null,
      all: async <T>() => ({ results: db.prepare(sql).all(...values as never[]) as T[] }),
      run: async () => db.prepare(sql).run(...values as never[]),
    };
  }
  return { prepare: statement, batch: async statements => { db.exec("BEGIN"); try { for (const item of statements) await item.run(); db.exec("COMMIT"); } catch (error) { db.exec("ROLLBACK"); throw error; } } };
}
const request = (body: unknown, cookie = "", origin = "https://hybridhub.pt") => new Request("https://hybridhub.pt/api/admin", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(body) });
const get = (action: string, cookie = "") => handleAdmin(new Request(`https://hybridhub.pt/api/admin?action=${action}`, { headers: { Cookie: cookie } }), env);
async function login() {
  const started = await handleAdmin(request({ action: "request", token: "proof", email: "attacker@example.com" }), env);
  const { challenge } = await started.json();
  const code = JSON.parse(String(mail.mock.calls.at(-1)![1].body)).textContent.match(/\d{8}/)[0];
  const response = await handleAdmin(request({ action: "verify", challenge, code }), env);
  return { challenge, code, response, cookie: response.headers.get("Set-Cookie")!.split(";")[0]! };
}
function signUp(email: string, kind = "launch", language = "pt", created = Date.now()) {
  sqlite.prepare("INSERT INTO form_submissions(id,kind,language,email,consent_text,request_hash,created_at) VALUES(?,?,?,?,?,?,?)").run(crypto.randomUUID(), kind, language, email, "consent", "hash", created);
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
  sqlite = new DatabaseSync(":memory:"); sqlite.exec(readFileSync("migrations/0001_website_forms.sql", "utf8")); sqlite.exec(readFileSync("migrations/0002_subscribers_admin.sql", "utf8"));
  env = { FORMS_DB: adapter(sqlite), BREVO_API_KEY: "private-test-key", BREVO_SENDER_EMAIL: "avisos@hybridhub.pt", FORMS_TURNSTILE_SITE_KEY: "public", FORMS_TURNSTILE_SECRET: "secret" };
  mail = vi.fn(async (_url: string, _init: RequestInit) => Response.json({ messageId: "sent" }, { status: 201 }));
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit) => url.includes("siteverify") ? Promise.resolve(Response.json({ success: true, hostname: "hybridhub.pt", action: "website-form" })) : mail(url, init)));
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("private subscribers", () => {
  it("keeps coach/community applications private, separate from launch and exportable with answers", async () => {
    signUp("launch@example.com"); signUp("general@example.com", "contact");
    signUp("coach@example.com", "contact");
    sqlite.prepare("UPDATE form_submissions SET name=?,subject=?,message=? WHERE email=?").run("=Coach", "[Participação] PT / coach", "Cidade: Maia\n\nModalidades: Corrida", "coach@example.com");
    expect((await get("list&group=partners")).status).toBe(401);
    const auth = await login();
    const launch = await (await get("list", auth.cookie)).json();
    expect(launch.subscribers.map((row: { email: string }) => row.email)).toEqual(["launch@example.com"]);
    const partners = await (await get("list&group=partners", auth.cookie)).json();
    expect(partners.total).toBe(1);
    expect(partners.subscribers[0]).toMatchObject({ name: "=Coach", email: "coach@example.com", message: "Cidade: Maia\n\nModalidades: Corrida" });
    const csv = await (await get("export&group=partners", auth.cookie)).text();
    expect(csv).toContain("'=Coach");
    expect(csv).toContain("Modalidades: Corrida");
    expect(csv).not.toContain("launch@example.com");
    expect((await get("list&group=other", auth.cookie)).status).toBe(400);
  });
  it("never returns subscribers or CSV without an authenticated session", async () => {
    signUp("private@example.com");
    expect(await (await get("session")).json()).toEqual({ authenticated: false, expiresAt: null });
    for (const action of ["list", "export"]) { const response = await get(action); expect(response.status).toBe(401); expect(await response.text()).not.toContain("private@example.com"); expect(response.headers.get("Cache-Control")).toContain("no-store"); }
    expect((await get("list", "__Host-hh_admin=forged")).status).toBe(401);
  });
  it("rejects cross-origin changes and invalid anti-spam proofs", async () => {
    expect((await handleAdmin(request({ action: "request", token: "proof" }, "", "https://attacker.example"), env)).status).toBe(403);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ success: true, hostname: "attacker.example", action: "website-form" })));
    expect((await handleAdmin(request({ action: "request", token: "proof" }), env)).status).toBe(403);
    expect(mail).not.toHaveBeenCalled();
  });
  it("sends only to the fixed owner, stores only a code hash and sets a secure expiring cookie", async () => {
    const auth = await login();
    expect(JSON.parse(String(mail.mock.calls[0]![1].body)).to).toEqual([{ email: "hybridhubadmin@gmail.com" }]);
    const stored = sqlite.prepare("SELECT * FROM admin_login_challenges").get(); expect(stored?.['code_hash']).not.toContain(auth.code); expect(stored?.['used_at']).toBe(Date.now());
    const header = auth.response.headers.get("Set-Cookie"); for (const value of ["HttpOnly", "Secure", "SameSite=Strict", "Path=/", "Max-Age=3600"]) expect(header).toContain(value);
    expect(await (await get("session", auth.cookie)).json()).toEqual({ authenticated: true, expiresAt: Date.now() + 3600000 });
    expect(sqlite.prepare("SELECT token_hash FROM admin_sessions").get()?.['token_hash']).not.toBe(auth.cookie.split("=")[1]);
  });
  it("limits login emails to one per minute and 20 per UTC day", async () => {
    await login(); expect((await handleAdmin(request({ action: "request", token: "proof" }), env)).status).toBe(429);
    sqlite.prepare("UPDATE admin_login_rate SET count=20,last_sent=0").run(); expect((await handleAdmin(request({ action: "request", token: "proof" }), env)).status).toBe(429);
    vi.setSystemTime(new Date("2026-11-17T12:00:00Z")); expect((await handleAdmin(request({ action: "request", token: "proof" }), env)).status).toBe(200);
  });
  it("consumes a code once, rejects expired codes, and locks after five wrong attempts", async () => {
    const auth = await login(); expect((await handleAdmin(request({ action: "verify", challenge: auth.challenge, code: auth.code }), env)).status).toBe(401);
    vi.setSystemTime(Date.now() + 61000); const start = await (await handleAdmin(request({ action: "request", token: "proof" }), env)).json();
    const correct = JSON.parse(String(mail.mock.calls.at(-1)![1].body)).textContent.match(/\d{8}/)[0]; const wrong = correct === "00000000" ? "11111111" : "00000000";
    for (let i = 0; i < 5; i++) expect((await handleAdmin(request({ action: "verify", challenge: start.challenge, code: wrong }), env)).status).toBe(401);
    expect((await handleAdmin(request({ action: "verify", challenge: start.challenge, code: correct }), env)).status).toBe(401);
    vi.setSystemTime(Date.now() + 61000); const next = await (await handleAdmin(request({ action: "request", token: "proof" }), env)).json();
    const expiredCode = JSON.parse(String(mail.mock.calls.at(-1)![1].body)).textContent.match(/\d{8}/)[0]; vi.setSystemTime(Date.now() + 600001);
    expect((await handleAdmin(request({ action: "verify", challenge: next.challenge, code: expiredCode }), env)).status).toBe(401);
  });
  it("expires sessions and revokes them immediately on logout", async () => {
    const first = await login(); vi.setSystemTime(Date.now() + 3600001); expect((await get("list", first.cookie)).status).toBe(401);
    const second = await login(); const logout = await handleAdmin(request({ action: "logout" }, second.cookie), env); expect(logout.headers.get("Set-Cookie")).toContain("Max-Age=0"); expect((await get("list", second.cookie)).status).toBe(401);
  });
  it("lists only launch requests, hides known tests and filters exact literal search safely", async () => {
    const auth = await login(); signUp("athlete@example.com"); signUp("hola@example.es", "launch", "es"); signUp("hybridhubadmin+launch-pt@gmail.com"); signUp("contact@example.com", "contact"); signUp("a_b@example.com");
    const list = await (await get("list", auth.cookie)).json(); expect(list.total).toBe(3); expect(list.subscribers.every((row: Record<string, unknown>) => Object.keys(row).sort().join() === "created_at,email,language")).toBe(true);
    expect((await (await get("list&tests=1", auth.cookie)).json()).total).toBe(4);
    expect((await (await get("list&language=es", auth.cookie)).json()).subscribers[0].email).toBe("hola@example.es");
    expect((await (await get("list&q=_", auth.cookie)).json()).subscribers.map((row: Subscriber) => row.email)).toEqual(["a_b@example.com"]);
    expect((await (await get("list&q=%27%20OR%201%3D1%20--", auth.cookie)).json()).total).toBe(0);
  });
  it("paginates and exports only the selected list with Excel formula protection", async () => {
    const auth = await login(); for (let i = 0; i < 51; i++) signUp(`athlete${i}@example.com`, "launch", "en", Date.now() + i);
    expect((await (await get("list&page=2", auth.cookie)).json()).subscribers).toHaveLength(1);
    signUp("=formula@example.com", "launch", "es"); const csv = await get("export&language=es", auth.cookie); const text = await csv.text(); expect(csv.headers.get("Content-Disposition")).toContain("attachment"); expect(text).toContain("\"'=formula@example.com\""); expect(text).not.toContain("athlete0@example.com");
  });
  it("fails closed on missing configuration and provider failure", async () => {
    expect((await handleAdmin(request({ action: "request", token: "proof" }), {})).status).toBe(503);
    mail.mockResolvedValue(Response.json({ error: "unavailable" }, { status: 503 })); expect((await handleAdmin(request({ action: "request", token: "proof" }), env)).status).toBe(503);
    expect(sqlite.prepare("SELECT expires_at FROM admin_login_challenges").get()?.['expires_at']).toBe(0);
  });
});
type Subscriber = { email: string };
