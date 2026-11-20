// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { handleAdmin } from "@/server/forms/admin";
import { handleProfileImages } from "@/server/profiles/images";
import { listPublicProfiles } from "@/server/profiles/service";
import { emptyProfile, type ProfileData } from "@/lib/profile-data";
import type { FormsDatabase, FormsEnvironment } from "@/server/forms/service";

let db: DatabaseSync, env: FormsEnvironment;
let mail: ReturnType<typeof vi.fn<(url: string, init: RequestInit) => Promise<Response>>>;
function adapter(): FormsDatabase {
  function statement(sql: string, values: unknown[] = []) {
    const args = () =>
      values.map((value) =>
        value instanceof ArrayBuffer ? new Uint8Array(value) : value,
      ) as never[];
    return {
      bind: (...values: unknown[]) => statement(sql, values),
      first: async <T>() => (db.prepare(sql).get(...args()) ?? null) as T | null,
      all: async <T>() => ({ results: db.prepare(sql).all(...args()) as T[] }),
      run: async () => db.prepare(sql).run(...args()),
    };
  }
  return {
    prepare: statement,
    batch: async (statements) => {
      db.exec("BEGIN");
      try {
        for (const item of statements) await item.run();
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
const post = (body: unknown, cookie = "", origin = "https://hybridhub.pt") =>
  handleAdmin(
    new Request("https://hybridhub.pt/api/admin", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    }),
    env,
  );
const list = (cookie = "") =>
  handleAdmin(
    new Request("https://hybridhub.pt/api/admin?action=profiles", { headers: { Cookie: cookie } }),
    env,
  );
async function login() {
  const { challenge } = await (await post({ action: "request", token: "proof" })).json();
  const code = JSON.parse(String(mail.mock.calls.at(-1)![1].body)).textContent.match(/\d{8}/)[0];
  const response = await post({ action: "verify", challenge, code });
  return response.headers.get("Set-Cookie")!.split(";")[0]!;
}
const complete = (): ProfileData => ({
  ...emptyProfile(),
  name: "Coach de teste",
  city: "Maia",
  country: { pt: "Portugal", es: "Portugal", en: "Portugal" },
  description: {
    pt: "Treino individual.",
    es: "Entrenamiento individual.",
    en: "One-to-one coaching.",
  },
  sports: { pt: ["Corrida"], es: ["Running"], en: ["Running"] },
});
async function save(cookie: string, data = complete(), id = crypto.randomUUID(), revision = 0) {
  const response = await post({ action: "profile-save", id, revision, data }, cookie);
  expect(response.status).toBe(200);
  return (await response.json()).profile;
}
async function action(cookie: string, profile: { id: string; revision: number }, action: string) {
  const response = await post(
    { action, id: profile.id, revision: profile.revision, permission: true },
    cookie,
  );
  expect(response.status).toBe(200);
  return (await response.json()).profile;
}
beforeEach(() => {
  db = new DatabaseSync(":memory:");
  db.exec(readFileSync("migrations/0001_website_forms.sql", "utf8"));
  db.exec(readFileSync("migrations/0002_subscribers_admin.sql", "utf8"));
  env = {
    FORMS_DB: adapter(),
    BREVO_API_KEY: "test-key",
    BREVO_SENDER_EMAIL: "avisos@hybridhub.pt",
    FORMS_TURNSTILE_SITE_KEY: "public",
    FORMS_TURNSTILE_SECRET: "secret",
  };
  mail = vi.fn(async (_url: string, _init: RequestInit) =>
    Response.json({ messageId: "test" }, { status: 201 }),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init: RequestInit) =>
      url.includes("siteverify")
        ? Promise.resolve(
            Response.json({ success: true, hostname: "hybridhub.pt", action: "website-form" }),
          )
        : mail(url, init),
    ),
  );
});
afterEach(() => {
  db.close();
  vi.unstubAllGlobals();
});

it("protects list and mutations with the owner session and origin checks", async () => {
  expect((await list()).status).toBe(401);
  expect(
    (await post({ action: "profile-save", id: crypto.randomUUID(), revision: 0, data: complete() }))
      .status,
  ).toBe(401);
  const cookie = await login();
  expect(
    (
      await post(
        { action: "profile-save", id: crypto.randomUUID(), revision: 0, data: complete() },
        cookie,
        "https://attacker.example",
      )
    ).status,
  ).toBe(403);
  const crossSite = new Request("https://hybridhub.pt/api/admin?action=profiles", {
    headers: { Cookie: cookie, "Sec-Fetch-Site": "cross-site" },
  });
  expect((await handleAdmin(crossSite, env)).status).toBe(403);
});
it("initializes the additive schema and keeps saved drafts off the public feed", async () => {
  expect(await listPublicProfiles(env.FORMS_DB!)).toEqual([]);
  const cookie = await login();
  const profile = await save(cookie);
  const response = await list(cookie);
  expect(response.headers.get("Cache-Control")).toContain("no-store");
  expect((await response.json()).profiles[0].id).toBe(profile.id);
  expect(await listPublicProfiles(env.FORMS_DB!)).toEqual([]);
  expect(db.prepare("SELECT COUNT(*) AS total FROM form_submissions").get()?.["total"]).toBe(0);
});
it("requires explicit permission and complete text in all three languages before publishing", async () => {
  const cookie = await login();
  const data = complete();
  data.description.en = "";
  const profile = await save(cookie, data);
  expect(
    (
      await post(
        { action: "profile-publish", id: profile.id, revision: profile.revision, permission: true },
        cookie,
      )
    ).status,
  ).toBe(400);
  const ready = await save(cookie, complete(), profile.id, profile.revision);
  expect(
    (
      await post(
        { action: "profile-publish", id: ready.id, revision: ready.revision, permission: false },
        cookie,
      )
    ).status,
  ).toBe(400);
  expect(await listPublicProfiles(env.FORMS_DB!)).toEqual([]);
  await action(cookie, ready, "profile-publish");
  expect(
    db.prepare("SELECT permission_confirmed_at FROM member_profiles WHERE id=?").get(profile.id)?.[
      "permission_confirmed_at"
    ],
  ).toBeGreaterThan(0);
});
it("keeps the published snapshot stable during edits and rejects stale revisions", async () => {
  const cookie = await login();
  let profile = await save(cookie);
  profile = await action(cookie, profile, "profile-publish");
  const originalRevision = profile.revision;
  profile = await save(
    cookie,
    { ...complete(), name: "Nome revisto" },
    profile.id,
    profile.revision,
  );
  expect((await listPublicProfiles(env.FORMS_DB!))[0]?.name).toBe("Coach de teste");
  expect(
    (
      await post(
        { action: "profile-save", id: profile.id, revision: originalRevision, data: complete() },
        cookie,
      )
    ).status,
  ).toBe(409);
  profile = await action(cookie, profile, "profile-publish");
  const published = (await listPublicProfiles(env.FORMS_DB!))[0]!;
  expect(published.name).toBe("Nome revisto");
  expect(published).not.toHaveProperty("revision");
  expect(published).not.toHaveProperty("publishedData");
  expect(published.description.en).toBe("One-to-one coaching.");
  await action(cookie, profile, "profile-unpublish");
  expect(await listPublicProfiles(env.FORMS_DB!)).toEqual([]);
});
it("archives reversibly and restores only as a private draft", async () => {
  const cookie = await login();
  let profile = await save(cookie, { ...complete(), kind: "community" });
  profile = await action(cookie, profile, "profile-publish");
  profile = await action(cookie, profile, "profile-archive");
  expect(profile.archivedAt).toBeGreaterThan(0);
  expect(await listPublicProfiles(env.FORMS_DB!)).toEqual([]);
  expect(
    (
      await post(
        { action: "profile-publish", id: profile.id, revision: profile.revision, permission: true },
        cookie,
      )
    ).status,
  ).toBe(400);
  profile = await action(cookie, profile, "profile-restore");
  expect(profile.archivedAt).toBeNull();
  expect(profile.publishedData).toBeNull();
  expect(profile.data.kind).toBe("community");
});
it.each([
  "javascript:alert(1)",
  "data:text/html,bad",
  "http://example.com",
  "https://user:pass@example.com",
])("rejects unsafe links: %s", async (website) => {
  const cookie = await login();
  expect(
    (
      await post(
        {
          action: "profile-save",
          id: crypto.randomUUID(),
          revision: 0,
          data: { ...complete(), website },
        },
        cookie,
      )
    ).status,
  ).toBe(400);
});
it("rejects private extra fields and unknown photo references", async () => {
  const cookie = await login();
  expect(
    (
      await post(
        {
          action: "profile-save",
          id: crypto.randomUUID(),
          revision: 0,
          data: { ...complete(), email: "private@example.com" },
        },
        cookie,
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await post(
        {
          action: "profile-save",
          id: crypto.randomUUID(),
          revision: 0,
          data: { ...complete(), imageId: crypto.randomUUID() },
        },
        cookie,
      )
    ).status,
  ).toBe(400);
});
const imagePost = (bytes: Uint8Array, type: string, cookie = "") =>
  handleProfileImages(
    new Request("https://hybridhub.pt/api/profile-images", {
      method: "POST",
      headers: { Origin: "https://hybridhub.pt", "Content-Type": type, Cookie: cookie },
      body: new Uint8Array(bytes).buffer,
    }),
    env,
  );
const imageGet = (id: string, cookie = "", preview = false) =>
  handleProfileImages(
    new Request(`https://hybridhub.pt/api/profile-images?id=${id}${preview ? "&preview=1" : ""}`, {
      headers: { Cookie: cookie },
    }),
    env,
  );
it("validates image uploads and exposes a photograph only while its profile is published", async () => {
  const png = Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ioAAAAASUVORK5CYII=",
      "base64",
    ),
  );
  expect((await imagePost(png, "image/png")).status).toBe(401);
  const cookie = await login();
  expect((await imagePost(png, "image/svg+xml", cookie)).status).toBe(415);
  expect((await imagePost(new Uint8Array([1, 2, 3]), "image/png", cookie)).status).toBe(400);
  expect((await imagePost(new Uint8Array(800001), "image/png", cookie)).status).toBe(413);
  const response = await imagePost(png, "image/png", cookie);
  expect(response.status).toBe(201);
  const { id } = await response.json();
  expect((await imageGet(id)).status).toBe(404);
  expect((await imageGet(id, "", true)).status).toBe(401);
  expect((await imageGet(id, cookie, true)).status).toBe(200);
  let profile = await save(cookie, {
    ...complete(),
    imageId: id,
    imageAlt: { pt: "Foto", es: "Foto", en: "Photo" },
  });
  expect((await imageGet(id)).status).toBe(404);
  profile = await action(cookie, profile, "profile-publish");
  const visible = await imageGet(id);
  expect(visible.status).toBe(200);
  expect(visible.headers.get("Content-Type")).toBe("image/png");
  expect(visible.headers.get("Cache-Control")).toContain("no-store");
  expect(new Uint8Array(await visible.arrayBuffer())).toEqual(png);
  await action(cookie, profile, "profile-unpublish");
  expect((await imageGet(id)).status).toBe(404);
});
