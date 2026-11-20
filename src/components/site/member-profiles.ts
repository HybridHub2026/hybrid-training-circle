import type { Language } from "@/i18n/language";

export type MemberProfile = {
  id: string;
  kind: "coach" | "community";
  name: string;
  city: string;
  country: Record<Language, string>;
  description: Record<Language, string>;
  sports: Record<Language, string[]>;
  image?: { src: string; alt: Record<Language, string> };
  instagram?: `https://${string}`;
  website?: `https://${string}`;
};
