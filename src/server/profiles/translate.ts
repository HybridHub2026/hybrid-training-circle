import { z } from "zod";
import type { FormsEnvironment } from "../forms/service";

const sourceSchema = z
  .object({
    country: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(900),
    sports: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
    imageAlt: z.string().trim().max(160),
  })
  .strict();
const fieldsSchema = z
  .object({
    country: z.boolean(),
    description: z.boolean(),
    sports: z.boolean(),
    imageAlt: z.boolean(),
  })
  .strict();
export const translationActionSchema = z
  .object({
    action: z.literal("profile-translate"),
    source: sourceSchema,
    fields: z.object({ es: fieldsSchema, en: fieldsSchema }).strict(),
  })
  .strict();
export type ProfileTranslationRequest = z.infer<typeof translationActionSchema>;
export type ProfileTranslations = Record<"es" | "en", Partial<z.infer<typeof sourceSchema>>>;
const MODEL = "@cf/meta/m2m100-1.2b";
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt")
    .trim();
let countryCodes: Map<string, string> | undefined;
function countryName(text: string, language: "es" | "en") {
  if (!countryCodes) {
    countryCodes = new Map();
    const portuguese = new Intl.DisplayNames(["pt-PT"], { type: "region", fallback: "none" });
    for (let first = 65; first <= 90; first++)
      for (let second = 65; second <= 90; second++) {
        const code = String.fromCharCode(first, second),
          name = portuguese.of(code);
        if (name) {
          countryCodes.set(normalize(name), code);
          countryCodes.set(code.toLowerCase(), code);
        }
      }
    countryCodes.set("eua", "US");
    countryCodes.set("estados unidos da america", "US");
    countryCodes.set("republica checa", "CZ");
  }
  const code = countryCodes.get(normalize(text));
  return code ? new Intl.DisplayNames([language], { type: "region" }).of(code) : undefined;
}
const sportsTerms: Record<string, { es: string; en: string }> = {
  corrida: { es: "Running", en: "Running" },
  running: { es: "Running", en: "Running" },
  "treino hibrido": { es: "Entrenamiento híbrido", en: "Hybrid training" },
  "treino de forca": { es: "Entrenamiento de fuerza", en: "Strength training" },
  forca: { es: "Fuerza", en: "Strength" },
  musculacao: { es: "Entrenamiento de fuerza", en: "Strength training" },
  natacao: { es: "Natación", en: "Swimming" },
  ciclismo: { es: "Ciclismo", en: "Cycling" },
  trail: { es: "Trail running", en: "Trail running" },
  caminhada: { es: "Caminata", en: "Walking" },
  "treino funcional": { es: "Entrenamiento funcional", en: "Functional training" },
};
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  Vary: "Cookie",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
const hash = async (value: string) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");

export async function translateProfile(body: ProfileTranslationRequest, env: FormsEnvironment) {
  if (!env.PROFILE_TRANSLATOR || !env.FORMS_DB)
    return json(
      {
        error: "translation_unavailable",
        message:
          "A tradução automática está temporariamente indisponível. Os textos podem ser preenchidos manualmente.",
      },
      503,
    );
  const db = env.FORMS_DB;
  try {
    await db.batch([
      db.prepare(
        "CREATE TABLE IF NOT EXISTS profile_translation_budget (id TEXT PRIMARY KEY,day TEXT NOT NULL,used INTEGER NOT NULL,last_at INTEGER NOT NULL)",
      ),
      db.prepare(
        "CREATE TABLE IF NOT EXISTS profile_translation_cache (id TEXT PRIMARY KEY,translated_text TEXT NOT NULL,created_at INTEGER NOT NULL)",
      ),
    ]);
    const now = Date.now(),
      day = new Date(now).toISOString().slice(0, 10);
    await db
      .prepare(
        "INSERT INTO profile_translation_budget(id,day,used,last_at) VALUES('owner',?,0,0) ON CONFLICT DO NOTHING",
      )
      .bind(day)
      .run();
    const allowed = await db
      .prepare(
        "UPDATE profile_translation_budget SET day=?,used=CASE WHEN day=? THEN used+1 ELSE 1 END,last_at=? WHERE id='owner' AND last_at<=? AND (day<>? OR used<30) RETURNING used",
      )
      .bind(day, day, now, now - 3000, day)
      .first();
    if (!allowed)
      return json(
        {
          error: "translation_limit",
          message:
            "Aguarda alguns segundos antes de voltar a traduzir. Se atingiste o limite de 30 pedidos por dia, podes continuar a editar manualmente ou tentar amanhã.",
        },
        429,
      );
    await db
      .prepare("DELETE FROM profile_translation_cache WHERE created_at<?")
      .bind(now - 7 * 86400000)
      .run();
    const translations: ProfileTranslations = { es: {}, en: {} };
    const jobs: Array<() => Promise<void>> = [];
    const promises = new Map<string, Promise<string>>();
    async function translate(
      text: string,
      language: "es" | "en",
      maxLength: number,
      sport = false,
    ) {
      if (!text) return "";
      if (sport) {
        const term =
          sportsTerms[
            text
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLocaleLowerCase("pt")
              .trim()
          ];
        if (term && Object.hasOwn(term, language)) return term[language];
      }
      // Preserve names of sports/brands that don't change between these languages.
      if (/^(HYROX|Hybrid Hub|CrossFit|Pilates|Yoga)$/i.test(text)) return text;
      const id = await hash(`${MODEL}:v1:${language}:${text}`);
      if (!promises.has(id))
        promises.set(
          id,
          (async () => {
            const cached = await db
              .prepare("SELECT translated_text FROM profile_translation_cache WHERE id=?")
              .bind(id)
              .first<{ translated_text: string }>();
            if (cached) return cached.translated_text;
            let timer: ReturnType<typeof setTimeout>;
            const result = await Promise.race([
              env.PROFILE_TRANSLATOR!.run(MODEL, {
                text,
                source_lang: "pt",
                target_lang: language,
              }),
              new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error("translation_timeout")), 15000);
              }),
            ]).finally(() => clearTimeout(timer!));
            const output = result.translated_text?.trim();
            if (!output || output.length > maxLength) throw new Error("invalid_translation");
            await db
              .prepare(
                "INSERT INTO profile_translation_cache(id,translated_text,created_at) VALUES(?,?,?) ON CONFLICT DO NOTHING",
              )
              .bind(id, output, now)
              .run();
            return output;
          })(),
        );
      const output = await promises.get(id)!;
      if (output.length > maxLength) throw new Error("invalid_translation");
      return output;
    }
    for (const language of ["es", "en"] as const) {
      for (const [field, max] of [
        ["country", 100],
        ["description", 900],
        ["imageAlt", 160],
      ] as const)
        if (body.fields[language][field])
          jobs.push(async () => {
            const country =
              field === "country" ? countryName(body.source.country, language) : undefined;
            translations[language][field] =
              country ?? (await translate(body.source[field], language, max));
          });
      if (body.fields[language].sports) {
        const sports = Array<string>(body.source.sports.length);
        translations[language].sports = sports;
        body.source.sports.forEach((sport, index) =>
          jobs.push(async () => {
            sports[index] = await translate(sport, language, 60, true);
          }),
        );
      }
    }
    let index = 0,
      failed = false;
    await Promise.all(
      Array.from({ length: Math.min(4, jobs.length) }, async () => {
        while (!failed) {
          const job = jobs[index++];
          if (!job) return;
          try {
            await job();
          } catch (error) {
            failed = true;
            throw error;
          }
        }
      }),
    );
    return json({ translations });
  } catch {
    return json(
      {
        error: "translation_failed",
        message:
          "Não foi possível concluir a tradução automática. Os teus textos mantêm-se guardados no editor; podes tentar novamente ou preencher os outros idiomas manualmente.",
      },
      503,
    );
  }
}
