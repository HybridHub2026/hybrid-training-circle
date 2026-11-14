export type Language = "pt" | "es";

export function languageFromPath(pathname: string): Language {
  return /^\/es(?:\/|$)/.test(pathname) ? "es" : "pt";
}

export function localizedPath(path: string, language: Language): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const base = path.replace(/^\/es(?=\/|$)/, "") || "/";
  return language === "es" ? (base === "/" ? "/es" : `/es${base}`) : base;
}

export function languageAlternates(path: string) {
  return [
    { rel: "alternate", hrefLang: "pt-PT", href: `https://hybridhub.pt${localizedPath(path, "pt")}` },
    { rel: "alternate", hrefLang: "es", href: `https://hybridhub.pt${localizedPath(path, "es")}` },
    { rel: "alternate", hrefLang: "x-default", href: `https://hybridhub.pt${localizedPath(path, "pt")}` },
  ];
}
