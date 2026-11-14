import { JSDOM } from "jsdom";
import fs from "node:fs";
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://127.0.0.1:8081";
const paths = ["/", "/app", "/como-funciona", "/comunidade", "/loja", "/faq", "/contactos", "/privacidade", "/termos", "/cookies", "/parceiros-de-treino"];
const catalogue = JSON.parse(fs.readFileSync("src/i18n/es.json", "utf8"));
const untranslated = new Set();
for (const path of paths) {
  for (const language of ["pt", "es"]) {
    const localPath = language === "es" ? "/es" + (path === "/" ? "" : path) : path;
    const response = await fetch(origin + localPath);
    assert.equal(response.status, 200, localPath);
    const { document } = new JSDOM(await response.text()).window;
    assert.equal(document.documentElement.lang, language === "es" ? "es" : "pt-PT", localPath);
    assert.ok(document.querySelector("main h1"), `${localPath}: missing page content`);
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, "https://hybridhub.pt" + localPath);
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 3);
    for (const link of document.querySelectorAll("a[href^='/']")) {
      const href = link.getAttribute("href");
      if (link.closest('[aria-label="Idioma"]')) continue;
      if (language === "es") assert.match(href, /^\/es(?:\/|$|#)/, `${localPath}: ${href}`);
      else assert.doesNotMatch(href, /^\/es(?:\/|$)/, `${localPath}: ${href}`);
    }
    if (language === "es") {
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
console.log("Verified 22 pages: server-rendered content, language, canonicals and navigation.");
