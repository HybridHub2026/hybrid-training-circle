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

// Public editorial list, separate from the private interest forms.
// Add a profile only after its details, photo and publication permission are confirmed.
// Never add email addresses, application responses or other private contact details here.
export const memberProfiles: MemberProfile[] = [];
