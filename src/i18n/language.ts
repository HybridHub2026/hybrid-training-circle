export type Language = "pt" | "es" | "en";

export function languageFromPath(pathname: string): Language {
  return /^\/es(?:\/|$)/.test(pathname) ? "es" : /^\/en(?:\/|$)/.test(pathname) ? "en" : "pt";
}

export function localizedPath(path: string, language: Language): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const base = path.replace(/^\/(?:es|en)(?=\/|$)/, "") || "/";
  return language === "pt" ? base : (base === "/" ? `/${language}` : `/${language}${base}`);
}

export function languageAlternates(path: string) {
  return [
    { rel: "alternate", hrefLang: "pt-PT", href: `https://hybridhub.pt${localizedPath(path, "pt")}` },
    { rel: "alternate", hrefLang: "es", href: `https://hybridhub.pt${localizedPath(path, "es")}` },
    { rel: "alternate", hrefLang: "en", href: `https://hybridhub.pt${localizedPath(path, "en")}` },
    { rel: "alternate", hrefLang: "x-default", href: `https://hybridhub.pt${localizedPath(path, "pt")}` },
  ];
}
