import { z } from "zod";

// Stored as classified contacts so the existing durable inbox and delivery queue apply.
export const partnerSubjects = {
  coach: "[Participação] PT / coach",
  community: "[Participação] Comunidade",
} as const;
export const partnerSchema = z.object({
  type: z.enum(["coach", "community"]),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  sports: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(800),
  activities: z.string().trim().min(1).max(300),
  website: z.string().trim().max(200).default(""),
});
export function isPartner(subject: string) {
  return Object.values(partnerSubjects).some((value) => value === subject);
}
export function partnerMessage(value: z.infer<typeof partnerSchema>) {
  return [
    `Tipo: ${value.type === "coach" ? "PT / coach" : "Comunidade"}`,
    `Cidade: ${value.city}`,
    `País: ${value.country}`,
    `Modalidades: ${value.sports}`,
    `Apresentação: ${value.description}`,
    `${value.type === "coach" ? "Acompanhamento" : "Atividades e frequência"}: ${value.activities}`,
    ...(value.website ? [`Instagram / site: ${value.website}`] : []),
  ].join("\n\n");
}
export const partnerConsent = {
  pt: "Li a Política de Privacidade e aceito ser contactado sobre a minha participação na Hybrid Hub. Os meus dados não serão publicados na app sem confirmação prévia.",
  es: "He leído la Política de Privacidad y acepto que me contactéis sobre mi participación en Hybrid Hub. Mis datos no se publicarán en la app sin confirmación previa.",
  en: "I have read the Privacy Policy and agree to be contacted about taking part in Hybrid Hub. My details will not be published in the app without prior confirmation.",
} as const;
