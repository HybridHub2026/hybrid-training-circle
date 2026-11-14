import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutomaticLanguage } from "@/i18n/AutomaticLanguage";
import { LanguageSelector } from "@/i18n";
import { browserLanguage, LANGUAGE_PREFERENCE_KEY } from "@/i18n/preference";

const navigation = vi.hoisted(() => ({
  navigate: vi.fn().mockResolvedValue(undefined),
  state: { location: { pathname: "/", search: { utm_source: "instagram" }, hash: "aviso-lancamento" } },
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => navigation,
  useRouterState: ({ select }: { select: (state: typeof navigation.state) => unknown }) => select(navigation.state),
  Link: ({ to, children, search, hash, hrefLang, onClick, ...props }: { to: string; children: React.ReactNode; search?: unknown; hash?: unknown; hrefLang?: string; onClick?: () => void }) => <a href={to} hrefLang={hrefLang} {...props} onClick={event => { event.preventDefault(); onClick?.(); }}>{children}</a>,
}));

const savedPreferences = new Map<string, string>();
const storage = {
  getItem: (key: string) => savedPreferences.get(key) ?? null,
  setItem: (key: string, value: string) => { savedPreferences.set(key, value); },
  get length() { return savedPreferences.size; },
};

beforeEach(() => {
  savedPreferences.clear();
  vi.stubGlobal("localStorage", storage);
  navigation.navigate.mockClear();
  navigation.state.location.pathname = "/";
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["es-MX", "en-US"]);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); savedPreferences.clear(); });

describe("automatic entry language", () => {
  it.each([
    [["pt-BR", "en-US"], "pt"],
    [["es-ES", "pt-PT"], "es"],
    [["en-GB"], "en"],
    [["fr-FR", "es-MX", "en-US"], "es"],
    [["ES_ar"], "es"],
    [["de-DE"], "en"],
    [[], "en"],
  ])("matches browser language preferences %j", (languages, expected) => {
    expect(browserLanguage(languages as string[])).toBe(expected);
  });

  it("detects Spanish on entry, preserves campaign and anchor, and replaces history", () => {
    render(<AutomaticLanguage />);
    expect(navigation.navigate).toHaveBeenCalledWith({ to: "/es", search: { utm_source: "instagram" }, hash: "aviso-lancamento", replace: true });
    expect(window.localStorage.length).toBe(0);
  });

  it.each(["pt", "es", "en"])("respects a saved manual %s preference", language => {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    render(<AutomaticLanguage />);
    if (language === "pt") expect(navigation.navigate).not.toHaveBeenCalled();
    else expect(navigation.navigate).toHaveBeenCalledWith(expect.objectContaining({ to: `/${language}` }));
  });

  it.each(["/es", "/en", "/es/contactos", "/contactos", "/missing"])("does not redirect direct links: %s", path => {
    navigation.state.location.pathname = path;
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, "en");
    render(<AutomaticLanguage />);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("does not redirect again after manual switching or internal navigation", () => {
    const view = render(<AutomaticLanguage />);
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, "pt");
    view.rerender(<AutomaticLanguage />);
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  it("ignores invalid saved values and works when storage is blocked", () => {
    vi.spyOn(storage, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    render(<AutomaticLanguage />);
    expect(navigation.navigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/es" }));
  });

  it("ignores an unsupported saved value", () => {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, "fr");
    render(<AutomaticLanguage />);
    expect(navigation.navigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/es" }));
  });

  it("uses navigator.language if the preference list is empty", () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue([]);
    vi.spyOn(navigator, "language", "get").mockReturnValue("pt-PT");
    render(<AutomaticLanguage />);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("saves only a manual selection and keeps the selector available", () => {
    const onChange = vi.fn();
    render(<LanguageSelector onChange={onChange} />);
    expect(window.localStorage.length).toBe(0);
    for (const [label, language] of [["English", "en"], ["Português", "pt"], ["Español", "es"]] as const) {
      fireEvent.click(screen.getByRole("link", { name: label }), { ctrlKey: true });
      expect(window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe(language);
    }
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("does not block a manual selection if storage cannot be written", () => {
    vi.spyOn(storage, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    const onChange = vi.fn();
    render(<LanguageSelector onChange={onChange} />);
    fireEvent.click(screen.getByRole("link", { name: "English" }), { ctrlKey: true });
    expect(onChange).toHaveBeenCalledOnce();
  });
});
