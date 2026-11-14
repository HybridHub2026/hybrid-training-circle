import spanish from "./es.json";
import english from "./en.json";
import { languageAlternates, localizedPath } from "./language";

type PageHead = {
  meta?: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
  scripts?: Array<{ type: string; children: string }>;
};

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
    ...(head.scripts ? { scripts: head.scripts.map(script => ({ ...script, children: script.children.replace('"url":"https://hybridhub.pt/"', `"url":"${url}","inLanguage":"${language}"`) })) } : {}),
  };
}

export function spanishHead(head: PageHead, path: string) {
  return translatedHead(head, path, "es");
}

export function englishHead(head: PageHead, path: string) {
  return translatedHead(head, path, "en");
}
