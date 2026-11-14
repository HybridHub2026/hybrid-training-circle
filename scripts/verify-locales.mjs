import { JSDOM } from "jsdom";
import fs from "node:fs";
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://127.0.0.1:8081";
const paths = JSON.parse(fs.readFileSync("src/i18n/pages.json", "utf8"));
const site = "https://hybridhub.pt";
const urlFor = (path, language) => site + (language === "pt-PT" || language === "x-default" ? path : `/${language}${path === "/" ? "" : path}`);
const alternativesFor = path => Object.fromEntries(["pt-PT", "es", "en", "x-default"].map(language => [language, urlFor(path, language)]));
const headers = { "User-Agent": "Googlebot", "Accept-Language": "en-US,en;q=0.9" };
const fetchPublic = async path => {
  const response = await fetch(origin + path, { headers });
  assert.equal(response.status, 200, path);
  assert.equal(response.redirected, false, `${path}: canonical URL redirects`);
  assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /\b(noindex|none)\b/i, `${path}: indexing blocked by response header`);
  return response;
};
const catalogues = Object.fromEntries(["es", "en"].map(language => [language, JSON.parse(fs.readFileSync(`src/i18n/${language}.json`, "utf8"))]));
const untranslated = new Set();
const originalMetadata = new Map();
for (const path of paths) {
  for (const language of ["pt", "es", "en"]) {
    const catalogue = catalogues[language];
    const localPath = language === "pt" ? path : `/${language}` + (path === "/" ? "" : path);
    const response = await fetchPublic(localPath);
    const { document } = new JSDOM(await response.text()).window;
    assert.equal(document.documentElement.lang, language === "pt" ? "pt-PT" : language, localPath);
    assert.ok(document.querySelector("main h1"), `${localPath}: missing page content`);
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, "https://hybridhub.pt" + localPath);
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 4);
    const alternatives = Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(link => [link.getAttribute("hreflang"), link.href]));
    assert.deepEqual(alternatives, alternativesFor(path), `${localPath}: incorrect language relationships`);
    assert.equal(document.querySelectorAll('meta[name="description"]').length, 1);
    const description = document.querySelector('meta[name="description"]').content;
    assert.ok(document.title && description, `${localPath}: missing search metadata`);
    for (const meta of document.querySelectorAll('meta[name="robots"], meta[name="googlebot"]')) {
      assert.doesNotMatch(meta.content, /\b(noindex|none)\b/i, `${localPath}: indexing blocked by metadata`);
    }
    if (language === "pt") {
      originalMetadata.set(path, { title: document.title, description });
    } else {
      const original = originalMetadata.get(path);
      assert.equal(document.title, catalogue[original.title], `${localPath}: untranslated title`);
      assert.equal(description, catalogue[original.description], `${localPath}: untranslated description`);
      assert.equal(document.querySelector('meta[property="og:url"]')?.content, site + localPath);
    }
    if (path === "/") {
      const graph = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(script => {
        const data = JSON.parse(script.textContent);
        return data["@graph"] ?? [data];
      });
      const website = graph.find(node => node["@type"] === "WebSite");
      assert.ok(website, `${localPath}: missing website structured data`);
      assert.equal(website.url, site + localPath);
      assert.equal(website["@id"], site + localPath + "#website");
      assert.equal(website.inLanguage, language === "pt" ? "pt-PT" : language);
    }
    for (const link of document.querySelectorAll("a[href^='/']")) {
      const href = link.getAttribute("href");
      if (link.closest('[aria-label="Idioma"], [aria-label="Language"]')) continue;
      if (language !== "pt") assert.match(href, new RegExp(`^/${language}(?:/|$|#)`), `${localPath}: ${href}`);
      else assert.doesNotMatch(href, /^\/(?:es|en)(?:\/|$)/, `${localPath}: ${href}`);
    }
    if (language !== "pt") {
      const walker = document.createTreeWalker(document.body, 4);
      while(walker.nextNode()) {
        if (walker.currentNode.parentElement?.closest("script,style")) continue;
        const text = walker.currentNode.textContent.replace(/\s+/g," ").trim();
        if(catalogue[text] && catalogue[text] !== text) untranslated.add(`${localPath}: ${text}`);
      }
    }
    console.log(`${language.toUpperCase()} ${localPath}: OK`);
  }
}
assert.equal(untranslated.size, 0, [...untranslated].join("\n"));
const robots = await (await fetchPublic("/robots.txt")).text();
assert.match(robots, /Sitemap: https:\/\/hybridhub.pt\/sitemap.xml/);
assert.match(robots, /User-agent: \*\s+Allow: \//);
const sitemapText = await (await fetchPublic("/sitemap.xml")).text();
const sitemap = new JSDOM(sitemapText, { contentType: "application/xml" }).window.document;
const entries = [...sitemap.getElementsByTagName("url")];
assert.equal(entries.length, paths.length * 3);
assert.equal(new Set(entries.map(entry => entry.getElementsByTagName("loc")[0].textContent)).size, entries.length);
for (const path of paths) {
  for (const language of ["pt-PT", "es", "en"]) {
    const entry = entries.find(entry => entry.getElementsByTagName("loc")[0].textContent === urlFor(path, language));
    assert.ok(entry, `Missing sitemap URL: ${urlFor(path, language)}`);
    const links = [...entry.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link")];
    assert.equal(links.length, 4);
    assert.deepEqual(Object.fromEntries(links.map(link => [link.getAttribute("hreflang"), link.getAttribute("href")])), alternativesFor(path));
  }
}
console.log(`Verified ${paths.length * 3} indexable pages: translated HTML/metadata, reciprocal hreflang, self-canonicals, JSON-LD, robots and multilingual sitemap.`);
