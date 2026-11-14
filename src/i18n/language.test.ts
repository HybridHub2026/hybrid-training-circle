import { describe, expect, it } from "vitest";
import { languageFromPath, localizedPath, languageAlternates } from "./language";
import { translateText } from "./index";
import { spanishHead } from "./head";

describe("Portuguese and Spanish navigation", () => {
  it("switches to the equivalent page without duplicating the locale prefix", () => {
    for (const path of ["/", "/app", "/como-funciona", "/comunidade", "/loja", "/faq", "/contactos", "/privacidade", "/termos", "/cookies", "/parceiros-de-treino"]) {
      const es = localizedPath(path, "es");
      expect(languageFromPath(es)).toBe("es");
      expect(localizedPath(es, "es")).toBe(es);
      expect(localizedPath(es, "pt")).toBe(path);
    }
    expect(languageFromPath("/escola")).toBe("pt");
  });
  it("leaves external destinations and same-page anchors intact", () => {
    for (const path of ["https://instagram.com/hybridhub.app", "mailto:hybridhubadmin@gmail.com", "tel:+351933002870", "#aviso-lancamento", "//example.com"]) {
      expect(localizedPath(path, "es")).toBe(path);
    }
  });
  it("translates text and validation feedback while keeping inline spaces and the slogan", () => {
    expect(translateText(" MAIS DO QUE ", "es")).toBe(" MÁS QUE ");
    expect(translateText("Indica o teu nome.", "es")).toBe("Introduce tu nombre.");
    expect(translateText("TRAIN • CONNECT • COMPETE", "es")).toBe("TRAIN • CONNECT • COMPETE");
    expect(translateText("Como funciona", "pt")).toBe("Como funciona");
  });
  it("publishes Spanish metadata and reciprocal language alternatives", () => {
    const head = spanishHead({ meta: [{ title: "Política de Privacidade — Hybrid Hub" }] }, "/privacidade");
    expect(head.meta[0]).toEqual({ title: "Política de Privacidad — Hybrid Hub" });
    expect(head.links[0]).toEqual({ rel: "canonical", href: "https://hybridhub.pt/es/privacidade" });
    expect(head.links.slice(1)).toEqual(languageAlternates("/privacidade"));
  });
});
