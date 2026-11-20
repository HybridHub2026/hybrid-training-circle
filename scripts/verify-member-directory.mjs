import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const origin = process.argv[2] || "https://hybridhub.pt";
const response = await fetch(origin + "/api/member-profiles");
assert.equal(response.status, 200, "Public directory feed unavailable");
assert.match(response.headers.get("cache-control") || "", /no-store/);
const { profiles } = await response.json();
assert.ok(Array.isArray(profiles));
const publicFields = new Set(["id", "kind", "name", "city", "country", "description", "sports", "image", "instagram", "website"]);
for (const profile of profiles) for (const key of Object.keys(profile)) assert.ok(publicFields.has(key), "Unexpected private field in public directory");
for (const language of ["pt", "es", "en"]) {
  const path = (language === "pt" ? "" : `/${language}`) + "/quem-ja-faz-parte";
  const response = await fetch(origin + path, { headers: { "User-Agent": "Googlebot" } });
  assert.equal(response.status, 200, `${path}: server rendering failed`);
  const document = new JSDOM(await response.text()).window.document;
  assert.equal(document.documentElement.lang, language === "pt" ? "pt-PT" : language);
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(document.querySelector('link[rel="canonical"]').href, "https://hybridhub.pt" + path);
  assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 4);
  assert.ok(document.querySelector("main h1"));
  const robots = document.querySelector('meta[name="robots"]')?.content || "";
  if (profiles.length === 0) assert.match(robots, /noindex/); else assert.doesNotMatch(robots, /noindex/);
  for (const profile of profiles) {
    assert.ok(document.querySelector("main").textContent.includes(profile.name), `${path}: profile missing from server HTML`);
    assert.ok(document.querySelector("main").textContent.includes(profile.description[language]), `${path}: translated description missing`);
  }
  console.log(`${language.toUpperCase()}: directory SSR, canonical, language and publication state OK`);
}
const privateResponse = await fetch(origin + "/api/admin?action=profiles");
assert.equal(privateResponse.status, 401, "Private drafts must require an owner session");
console.log(`Public profiles: ${profiles.length}. Private management rejects anonymous access.`);
