// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  handleForms,
  deliverPendingMail,
  type FormsDatabase,
  type FormsEnvironment,
} from "@/server/forms/service";
import { campaignAvailability, mutateCampaign } from "@/server/forms/campaign";
import { handleAdmin } from "@/server/forms/admin";
import { launchOfferCopy } from "@/i18n/launch-offer";
let sql: DatabaseSync, env: FormsEnvironment, db: FormsDatabase;
let emails: { to: { email: string }[]; textContent: string }[];
function adapter(sql: DatabaseSync): FormsDatabase {
  function statement(query: string, values: unknown[] = []): ReturnType<FormsDatabase["prepare"]> {
    return {
      bind: (...args) => statement(query, args),
      first: async <T>() => (sql.prepare(query).get(...(values as never[])) ?? null) as T | null,
      all: async <T>() => ({ results: sql.prepare(query).all(...(values as never[])) as T[] }),
      run: async () => sql.prepare(query).run(...(values as never[])),
    };
  }
  return {
    prepare: statement,
    batch: async (statements) => {
      sql.exec("BEGIN");
      try {
        for (const s of statements) await s.run();
        sql.exec("COMMIT");
      } catch (error) {
        sql.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
const request = (body: unknown) =>
  new Request("https://hybridhub.pt/api/forms", {
    method: "POST",
    headers: { Origin: "https://hybridhub.pt", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const payload = (extra: Record<string, unknown> = {}) => ({
  id: crypto.randomUUID(),
  kind: "launch",
  idioma: "pt",
  email: "person@example.com",
  consent: true,
  campaign: true,
  token: "valid",
  ...extra,
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-21T12:00:00Z"));
  sql = new DatabaseSync(":memory:");
  sql.exec(readFileSync("migrations/0001_website_forms.sql", "utf8"));
  sql.exec(readFileSync("migrations/0002_subscribers_admin.sql", "utf8"));
  db = adapter(sql);
  env = {
    FORMS_DB: db,
    BREVO_API_KEY: "test",
    BREVO_SENDER_EMAIL: "avisos@hybridhub.pt",
    FORMS_TURNSTILE_SITE_KEY: "public",
    FORMS_TURNSTILE_SECRET: "test",
  };
  emails = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      if (url.includes("siteverify"))
        return Response.json({ success: true, hostname: "hybridhub.pt", action: "website-form" });
      emails.push(JSON.parse(String(init.body)));
      return Response.json({ messageId: crypto.randomUUID() });
    }),
  );
});
afterEach(() => {
  sql.close();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it.each(["pt", "es", "en"] as const)(
  "reserves once, keeps proof of consent and sends a private localized code in %s",
  async (idioma) => {
    const body = payload({ idioma });
    const response = await handleForms(request(body), env);
    expect(response.status).toBe(202);
    expect(await response.text()).not.toContain("HH-");
    const row = sql.prepare("SELECT * FROM launch_hat_slots WHERE claimed_at IS NOT NULL").get()!;
    expect(row["code"]).toMatch(/^HH-[A-Z2-9]{12}$/);
    expect(row["consent_text"]).toBe(launchOfferCopy[idioma].consent);
    const user = emails.find((mail) => mail.to[0]!.email === body.email)!;
    expect(user.textContent).toContain(row["code"]);
    expect(user.textContent).toContain(launchOfferCopy[idioma].waiting);
    expect((await handleForms(request(body), env)).status).toBe(202);
    expect(
      (await handleForms(request(payload({ email: " PERSON@EXAMPLE.COM ", idioma })), env)).status,
    ).toBe(202);
    expect((await campaignAvailability(db)).reserved).toBe(1);
    expect(emails.length).toBe(2);
    const config = await (
      await handleForms(new Request("https://hybridhub.pt/api/forms"), env)
    ).text();
    expect(config).not.toContain(row["code"]);
    expect(config).not.toContain(body.email);
  },
);
it("caps reservations at 100 while keeping the 101st app signup", async () => {
  for (let i = 0; i < 101; i++)
    expect(
      (await handleForms(request(payload({ email: `person${i}@example.com` })), env)).status,
    ).toBe(202);
  expect(await campaignAvailability(db)).toMatchObject({
    available: false,
    reserved: 100,
    launchedAt: null,
  });
  expect(sql.prepare("SELECT COUNT(*) AS n FROM form_submissions").get()!["n"]).toBe(101);
  expect(
    sql
      .prepare(
        "SELECT COUNT(DISTINCT code) AS n FROM launch_hat_slots WHERE claimed_at IS NOT NULL",
      )
      .get()!["n"],
  ).toBe(100);
  await deliverPendingMail(env, 300);
  expect(
    emails.find((mail) => mail.to[0]!.email === "person100@example.com")!.textContent,
  ).toContain(launchOfferCopy.pt.noOffer);
}, 20000);
it("does not enroll old app-only subscriptions until they explicitly opt in", async () => {
  await handleForms(request(payload({ campaign: undefined })), env);
  expect((await campaignAvailability(db)).reserved).toBe(0);
  await handleForms(request(payload({ idioma: "en" })), env);
  expect((await campaignAvailability(db)).reserved).toBe(1);
  expect(sql.prepare("SELECT COUNT(*) AS n FROM form_submissions").get()!["n"]).toBe(1);
  expect(
    sql.prepare("SELECT consent_text FROM launch_hat_slots WHERE claimed_at IS NOT NULL").get()![
      "consent_text"
    ],
  ).toBe(launchOfferCopy.en.consent);
  expect(emails.filter((mail) => mail.to[0]!.email === "person@example.com")).toHaveLength(2);
});
it("starts the window explicitly, queues one opening email, prevents reuse and closes after 60 days", async () => {
  await handleForms(request(payload()), env);
  const code = String(sql.prepare("SELECT code FROM launch_hat_slots WHERE slot=1").get()!["code"]);
  const redeem = {
    action: "campaign-redeem" as const,
    code,
    orderReference: "ORDER-1",
    personConfirmed: true as const,
  };
  expect((await mutateCampaign(db, redeem)).status).toBe(409);
  const launchedAt = new Date(Date.now() + 86400000).toISOString();
  expect(
    (await mutateCampaign(db, { action: "campaign-start", launchedAt, confirmed: true })).status,
  ).toBe(200);
  expect(
    (await mutateCampaign(db, { action: "campaign-start", launchedAt, confirmed: true })).status,
  ).toBe(409);
  await deliverPendingMail(env);
  expect(emails.length).toBe(2);
  vi.setSystemTime(new Date(launchedAt));
  await deliverPendingMail(env);
  await deliverPendingMail(env);
  expect(emails.length).toBe(3);
  expect(emails[2]!.textContent).toContain(launchOfferCopy.pt.opened);
  expect(emails[2]!.textContent).toContain(code);
  expect((await mutateCampaign(db, redeem)).status).toBe(200);
  expect((await mutateCampaign(db, redeem)).status).toBe(409);
  await handleForms(request(payload({ email: "second@example.com" })), env);
  const second = String(
    sql.prepare("SELECT code FROM launch_hat_slots WHERE slot=2").get()!["code"],
  );
  expect((await mutateCampaign(db, { ...redeem, code: second })).status).toBe(409);
  vi.setSystemTime(new Date(Date.parse(launchedAt) + 60 * 86400000));
  expect(
    (await mutateCampaign(db, { ...redeem, code: second, orderReference: "ORDER-2" })).status,
  ).toBe(409);
  expect((await campaignAvailability(db)).available).toBe(false);
  await handleForms(request(payload({ email: "late@example.com" })), env);
  expect((await campaignAvailability(db)).reserved).toBe(2);
});
it("protects campaign codes and mutations behind owner authentication and origin checks", async () => {
  expect(
    (await handleAdmin(new Request("https://hybridhub.pt/api/admin?action=campaign"), env)).status,
  ).toBe(401);
  const body = { action: "campaign-start", launchedAt: new Date().toISOString(), confirmed: true };
  const post = (origin: string) =>
    handleAdmin(
      new Request("https://hybridhub.pt/api/admin", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      env,
    );
  expect((await post("https://hybridhub.pt")).status).toBe(401);
  expect((await post("https://other.example")).status).toBe(403);
});
