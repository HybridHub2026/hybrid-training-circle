import { z } from "zod";
import type { Language } from "@/i18n/language";

const text = (limit: number) => z.string().trim().max(limit);
const languages = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ pt: schema, es: schema, en: schema });
const safeLink = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .url()
    .max(500)
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    }),
]);
export const profileSchema = z
  .object({
    kind: z.enum(["coach", "community"]),
    name: text(100),
    city: text(100),
    country: languages(text(100)),
    description: languages(text(900)),
    sports: languages(
      z
        .array(z.string().trim().max(60))
        .max(10)
        .transform((items) => items.filter(Boolean)),
    ),
    imageId: z.string().uuid().nullable(),
    imageAlt: languages(text(160)),
    instagram: safeLink,
    website: safeLink,
  })
  .strict();
export type ProfileData = z.infer<typeof profileSchema>;
export type ManagedProfile = {
  id: string;
  data: ProfileData;
  publishedData: ProfileData | null;
  revision: number;
  updatedAt: number;
  publishedAt: number | null;
  archivedAt: number | null;
};
export const profileLanguages: Language[] = ["pt", "es", "en"];
export function publicationErrors(profile: ProfileData) {
  const errors: string[] = [];
  if (!profile.name) errors.push("Indica o nome do perfil.");
  if (!profile.city) errors.push("Indica a cidade.");
  for (const language of profileLanguages) {
    if (
      !profile.country[language] ||
      !profile.description[language] ||
      !profile.sports[language].length
    )
      errors.push(`Preenche país, apresentação e modalidades em ${language.toUpperCase()}.`);
    if (profile.imageId && !profile.imageAlt[language])
      errors.push(`Descreve a fotografia em ${language.toUpperCase()}.`);
  }
  return errors;
}
export function emptyProfile(): ProfileData {
  return {
    kind: "coach",
    name: "",
    city: "",
    country: { pt: "", es: "", en: "" },
    description: { pt: "", es: "", en: "" },
    sports: { pt: [], es: [], en: [] },
    imageId: null,
    imageAlt: { pt: "", es: "", en: "" },
    instagram: "",
    website: "",
  };
}
