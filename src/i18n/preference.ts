import type { Language } from "./language";

export const LANGUAGE_PREFERENCE_KEY = "hybridhub-language";

function isLanguage(value: unknown): value is Language {
  return value === "pt" || value === "es" || value === "en";
}

export function browserLanguage(languages: readonly string[]): Language {
  for (const language of languages) {
    const base = language.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(base)) return base;
  }
  return "en";
}

export function readLanguagePreference(): Language | null {
  try {
    const value = window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

// Save only an explicit selection; detection does not write to browser storage.
export function rememberLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
  } catch {
    // Choosing a language still works when storage is unavailable.
  }
}
