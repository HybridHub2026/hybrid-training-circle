import { Dumbbell, Users, MapPin } from "lucide-react";
import { translateText, useLanguage } from "@/i18n";
import type { Language } from "@/i18n/language";
import type { MemberProfile } from "./member-profiles";

export function ProfileCard({
  profile,
  languageOverride,
}: {
  profile: MemberProfile;
  languageOverride?: Language;
}) {
  const currentLanguage = useLanguage();
  const language = languageOverride ?? currentLanguage;
  const Icon = profile.kind === "coach" ? Dumbbell : Users;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card">
      {profile.image ? (
        <img
          src={profile.image.src}
          alt={profile.image.alt[language]}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted">
          <Icon className="h-14 w-14 text-primary" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="break-words text-2xl">{profile.name}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          {profile.city}, {profile.country[language]}
        </p>
        <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">
          {profile.description[language]}
        </p>
        <ul
          className="mt-5 flex flex-wrap gap-2"
          aria-label={language === "es" ? "Deportes" : language === "en" ? "Sports" : "Modalidades"}
        >
          {profile.sports[language].map((sport) => (
            <li
              key={sport}
              className="rounded-sm border border-primary/30 px-3 py-1 text-xs text-primary"
            >
              {sport}
            </li>
          ))}
        </ul>
        {(profile.instagram || profile.website) && (
          <div className="mt-6 flex flex-wrap gap-5 border-t border-border pt-4 text-sm">
            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-primary underline underline-offset-4"
              >
                Instagram<span className="sr-only"> — {profile.name}</span>
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-primary underline underline-offset-4"
              >
                {translateText("Visitar site", language)}
                <span className="sr-only"> — {profile.name}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
