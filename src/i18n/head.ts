import spanish from "./es.json";
import english from "./en.json";
import { languageAlternates, localizedPath } from "./language";

type PageHead = {
  meta?: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
  scripts?: Array<{ type: string; children: string }>;
};

function localizedStructuredData(children: string, url: string, language: "es" | "en") {
  const data = JSON.parse(children);
  const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
  for (const node of nodes) {
    if (node["@type"] === "WebSite") {
      node["@id"] = `${url}#website`;
      node.url = url;
      node.inLanguage = language;
    }
  }
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function translatedHead(head: PageHead, path: string, language: "es" | "en") {
  const catalogue = language === "en" ? english : spanish;
  const translate = (value: string) => (catalogue as Record<string,string>)[value] ?? value;
  const url = `https://hybridhub.pt${localizedPath(path, language)}`;
  return {
    ...head,
    meta: [
      ...(head.meta ?? []).map(meta => Object.fromEntries(Object.entries(meta).map(([key,value]) => [key, key === "title" || key === "content" ? translate(value) : value]))),
      { property: "og:locale", content: language === "en" ? "en_GB" : "es_ES" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }, ...languageAlternates(path)],
    ...(head.scripts ? { scripts: head.scripts.map(script => ({ ...script, children: script.type === "application/ld+json" ? localizedStructuredData(script.children, url, language) : script.children })) } : {}),
  };
}

export function spanishHead(head: PageHead, path: string) {
  return translatedHead(head, path, "es");
}

export function englishHead(head: PageHead, path: string) {
  return translatedHead(head, path, "en");
}
