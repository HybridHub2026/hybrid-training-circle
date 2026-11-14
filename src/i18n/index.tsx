import { createElement, type ComponentPropsWithoutRef, type JSX, type ReactNode } from "react";
import { Link as RouterLink, useRouterState, type ParsedLocation } from "@tanstack/react-router";
import spanish from "./es.json";
import { languageFromPath, localizedPath, type Language } from "./language";

export function useLanguage(): Language {
  return useRouterState({ select: (state: { location: ParsedLocation }) => languageFromPath(state.location.pathname) });
}

export function translateText(text: string, language: Language): string {
  if (language === "pt") return text;
  const key = text.replace(/\s+/g, " ").trim();
  const translation = (spanish as Record<string, string>)[key];
  if (translation === undefined) return text;
  return `${text.match(/^\s*/)?.[0] ?? ""}${translation}${text.match(/\s*$/)?.[0] ?? ""}`;
}

// Text and data arrays use the same catalogue, without adding elements to the layout.
export function T({ children }: { children: ReactNode }) {
  const language = useLanguage();
  function translate(node: ReactNode): ReactNode {
    if (typeof node === "string") return translateText(node, language);
    if (Array.isArray(node)) return node.map(translate);
    return node;
  }
  return translate(children);
}

export function Localized<Tag extends keyof JSX.IntrinsicElements>({ as, ...props }: { as: Tag } & ComponentPropsWithoutRef<Tag>) {
  const language = useLanguage();
  const translated: Record<string, unknown> = { ...props };
  for (const key of ["alt", "placeholder", "title", "aria-label"]) {
    if (typeof translated[key] === "string") translated[key] = translateText(translated[key], language);
  }
  if (as === "a" && typeof translated["href"] === "string") {
    translated["href"] = localizedPath(translated["href"], language);
  }
  return createElement(as, translated);
}

// Keep the router's typed public Link API; only the destination is localized.
export const Link = ((props: Parameters<typeof RouterLink>[0]) => {
  const language = useLanguage();
  const to = typeof props.to === "string" ? localizedPath(props.to, language) : props.to;
  return <RouterLink {...props} to={to as typeof props.to} />;
}) as typeof RouterLink;

export function LanguageSelector({ onChange }: { onChange?: () => void }) {
  const location = useRouterState({ select: (state: { location: ParsedLocation }) => state.location });
  const language = languageFromPath(location.pathname);
  return (
    <nav aria-label="Idioma" className="flex shrink-0 items-center gap-1 text-[11px] font-semibold tracking-wider">
      {(["pt", "es"] as const).map((option) => (
        <RouterLink
          key={option}
          to={localizedPath(location.pathname, option) as "/"}
          hash={location.hash}
          search={location.search}
          lang={option === "pt" ? "pt-PT" : "es"}
          hrefLang={option === "pt" ? "pt-PT" : "es"}
          aria-label={option === "pt" ? "Português" : "Español"}
          aria-current={option === language ? "true" : undefined}
          onClick={onChange}
          className={`flex min-h-10 min-w-9 items-center justify-center rounded-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${option === language ? "border-primary/60 text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          {option.toUpperCase()}
        </RouterLink>
      ))}
    </nav>
  );
}
