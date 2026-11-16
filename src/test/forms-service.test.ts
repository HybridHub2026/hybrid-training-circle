// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleForms, deliverPendingMail, type FormsDatabase, type FormsEnvironment } from "@/server/forms/service";

let sqlite: DatabaseSync;
let env: FormsEnvironment;
let fetchMock: ReturnType<typeof vi.fn>;

function databaseAdapter(db: DatabaseSync): FormsDatabase {
  function statement(sql: string, values: unknown[] = []) {
    const execute = () => db.prepare(sql);
    return {
      bind: (...args: unknown[]) => statement(sql, args),
      first: async <T>() => (execute().get(...values as never[]) ?? null) as T | null,
      all: async <T>() => ({ results: execute().all(...values as never[]) as T[] }),
      run: async () => execute().run(...values as never[]),
    };
  }
  return {
    prepare: statement,
    batch: async statements => {
      db.exec("BEGIN");
      try { for (const item of statements) await item.run(); db.exec("COMMIT"); }
      catch (error) { db.exec("ROLLBACK"); throw error; }
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-16T10:00:00Z"));
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("migrations/0001_website_forms.sql", "utf8"));
  env = { FORMS_DB: databaseAdapter(sqlite), BREVO_API_KEY: "test-secret-never-in-client", BREVO_SENDER_EMAIL: "avisos@hybridhub.pt", FORMS_TURNSTILE_SITE_KEY: "public-test-key", FORMS_TURNSTILE_SECRET: "private-test-key" };
  fetchMock = vi.fn(async (url: string) => url.includes("siteverify") ? Response.json({ success: true, hostname: "hybridhub.pt", action: "website-form" }) : Response.json({ messageId: randomUUID() }, { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); vi.useRealTimers(); });

const payload = (extra: Record<string, unknown> = {}) => ({ id: randomUUID(), kind: "launch", idioma: "en", email: "athlete@example.com", consent: true, token: "valid-token", ...extra });
function request(body: unknown, origin = "https://hybridhub.pt") {
  return new Request("https://hybridhub.pt/api/forms", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
const mailCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes("api.brevo.com"));

describe("website forms", () => {
  it("only exposes public configuration and fails closed until setup is complete", async () => {
    const response = await handleForms(new Request("https://hybridhub.pt/api/forms"), env);
    expect(await response.json()).toEqual({ ready: true, siteKey: "public-test-key" });
    expect((await handleForms(request(payload()), {})).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [{ consent: false }, 400], [{ email: "invalid" }, 400], [{ idioma: "fr" }, 400], [{ kind: "contact" }, 400], [{ mensagem: "x".repeat(2001) }, 400],
  ])("rejects invalid form data without saving or sending", async (extra, status) => {
    expect((await handleForms(request(payload(extra)), env)).status).toBe(status);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_submissions").get()?.['total']).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects cross-site submissions and invalid challenge hostnames", async () => {
    expect((await handleForms(request(payload(), "https://elsewhere.example"), env)).status).toBe(403);
    fetchMock.mockResolvedValue(Response.json({ success: true, hostname: "elsewhere.example", action: "website-form" }));
    expect((await handleForms(request(payload()), env)).status).toBe(403);
    expect(mailCalls()).toHaveLength(0);
  });

  it.each(["pt", "es", "en"])("saves consent and sends the correct %s confirmation plus one admin notification", async idioma => {
    expect((await handleForms(request(payload({ idioma })), env)).status).toBe(202);
    const saved = sqlite.prepare("SELECT * FROM form_submissions").get();
    expect(saved?.['language']).toBe(idioma);
    expect(saved?.['consent_text']).toMatch(idioma === "pt" ? /^Quero receber/ : idioma === "es" ? /^Quiero recibir/ : /^I want to receive/);
    const calls = mailCalls();
    expect(calls).toHaveLength(2);
    const emails = calls.map(call => JSON.parse((call[1] as RequestInit).body as string));
    expect(emails.find(email => email.to[0].email === "athlete@example.com").subject).toMatch(idioma === "pt" ? /inscrição confirmada/ : idioma === "es" ? /inscripción confirmada/ : /launch list/);
    expect(emails.find(email => email.to[0].email === "hybridhubadmin@gmail.com").replyTo.email).toBe("athlete@example.com");
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_mail_outbox WHERE state='sent'").get()?.['total']).toBe(2);
  });

  it("retries the same saved request without duplicate emails and rejects changed content with a reused id", async () => {
    const body = payload();
    expect((await handleForms(request(body), env)).status).toBe(202);
    expect((await handleForms(request(body), env)).status).toBe(202);
    expect((await handleForms(request({ ...body, email: "someone-else@example.com" }), env)).status).toBe(409);
    expect(mailCalls()).toHaveLength(2);
  });

  it("deduplicates launch sign-ups by email, including case differences", async () => {
    await handleForms(request(payload()), env);
    await handleForms(request(payload({ email: "ATHLETE@example.com" })), env);
    expect(mailCalls()).toHaveLength(2);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_submissions").get()?.['total']).toBe(1);
  });

  it("stores a contact message and escapes user content in notification HTML", async () => {
    await handleForms(request(payload({ kind: "contact", nome: '<script>alert("name")</script>', assunto: "Pergunta", mensagem: "Mensagem <img src=x onerror=alert(1)>" })), env);
    const emails = mailCalls().map(call => JSON.parse((call[1] as RequestInit).body as string));
    const admin = emails.find(email => email.to[0].email === "hybridhubadmin@gmail.com");
    expect(admin.htmlContent).toContain("&lt;script&gt;");
    expect(admin.htmlContent).not.toContain("<script>");
    expect(admin.textContent).toContain("Mensagem <img src=x onerror=alert(1)>");
    expect(emails.find(email => email.to[0].email === "athlete@example.com").subject).toMatch(/received your message/);
  });

  it("keeps requests durably saved while the email provider is unavailable and retries later", async () => {
    const original = fetchMock.getMockImplementation()! as (url: string) => Promise<Response>;
    fetchMock.mockImplementation(async (url: string) => url.includes("siteverify") ? original(url) : Response.json({}, { status: 503 }));
    expect((await handleForms(request(payload()), env)).status).toBe(202);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_submissions").get()?.['total']).toBe(1);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_mail_outbox WHERE state='pending'").get()?.['total']).toBe(2);
    vi.setSystemTime(new Date("2026-11-16T10:02:00Z"));
    fetchMock.mockImplementation(original);
    await deliverPendingMail(env);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_mail_outbox WHERE state='sent'").get()?.['total']).toBe(2);
  });

  it("queues emails after the daily free allowance is reserved, then sends them the next day", async () => {
    sqlite.prepare("INSERT INTO form_mail_budget(day,used) VALUES('2026-11-16',300)").run();
    expect((await handleForms(request(payload()), env)).status).toBe(202);
    expect(mailCalls()).toHaveLength(0);
    vi.setSystemTime(new Date("2026-11-17T00:05:00Z"));
    await deliverPendingMail(env);
    expect(mailCalls()).toHaveLength(2);
  });

  it("retries only the failed notification after a user confirmation has succeeded", async () => {
    fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes("siteverify")) return Response.json({ success: true, hostname: "hybridhub.pt", action: "website-form" });
      const email = JSON.parse(options?.body as string);
      return email.to[0].email === "hybridhubadmin@gmail.com" ? Response.json({}, { status: 503 }) : Response.json({ messageId: "user-confirmation" }, { status: 201 });
    });
    await handleForms(request(payload()), env);
    expect(sqlite.prepare("SELECT state FROM form_mail_outbox WHERE recipient='user'").get()?.['state']).toBe("sent");
    vi.setSystemTime(new Date("2026-11-16T10:02:00Z"));
    fetchMock.mockResolvedValue(Response.json({ messageId: "admin-notification" }, { status: 201 }));
    await deliverPendingMail(env);
    const recipients = mailCalls().map(call => JSON.parse((call[1] as RequestInit).body as string).to[0].email);
    expect(recipients.filter(email => email === "athlete@example.com")).toHaveLength(1);
    expect(sqlite.prepare("SELECT COUNT(*) AS total FROM form_mail_outbox WHERE state='sent'").get()?.['total']).toBe(2);
  });

  it("does not acknowledge a submission if durable storage fails", async () => {
    const broken = { ...env, FORMS_DB: { ...env.FORMS_DB!, batch: async () => { throw new Error("storage_unavailable"); } } };
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await handleForms(request(payload()), broken)).status).toBe(503);
    expect(mailCalls()).toHaveLength(0);
    logger.mockRestore();
  });
});
