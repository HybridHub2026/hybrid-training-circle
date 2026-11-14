import spanish from "./es.json";
import { languageAlternates, localizedPath } from "./language";

type PageHead = {
  meta?: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
  scripts?: Array<{ type: string; children: string }>;
};

export function spanishHead(head: PageHead, path: string) {
  const translate = (value: string) => (spanish as Record<string,string>)[value] ?? value;
  const url = `https://hybridhub.pt${localizedPath(path, "es")}`;
  return {
    ...head,
    meta: [
      ...(head.meta ?? []).map(meta => Object.fromEntries(Object.entries(meta).map(([key,value]) => [key, key === "title" || key === "content" ? translate(value) : value]))),
      { property: "og:locale", content: "es_ES" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }, ...languageAlternates(path)],
    ...(head.scripts ? { scripts: head.scripts.map(script => ({ ...script, children: script.children.replace('"url":"https://hybridhub.pt/"', '"url":"https://hybridhub.pt/es/","inLanguage":"es"') })) } : {}),
  };
}
