import fs from "node:fs";

const paths = JSON.parse(fs.readFileSync(new URL("../src/i18n/pages.json", import.meta.url), "utf8"));
const origin = "https://hybridhub.pt";
const languages = ["pt-PT", "es", "en"];
const urlFor = (path, language) => origin + (language === "pt-PT" ? path : `/${language}${path === "/" ? "" : path}`);
const urls = [];
for (const language of languages) {
  for (const path of paths) {
    const alternatives = [...languages, "x-default"].map(alternative =>
      `    <xhtml:link rel="alternate" hreflang="${alternative}" href="${urlFor(path, alternative === "x-default" ? "pt-PT" : alternative)}" />`,
    ).join("\n");
    urls.push(`  <url>\n    <loc>${urlFor(path, language)}</loc>\n${alternatives}\n  </url>`);
  }
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
fs.writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Generated ${urls.length} URLs with reciprocal language alternatives.`);
