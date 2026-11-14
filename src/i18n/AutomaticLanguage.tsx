import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { localizedPath } from "./language";
import { browserLanguage, readLanguagePreference } from "./preference";

export function AutomaticLanguage() {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    const location = router.state.location;
    // Direct links retain their explicit language. Run only on initial entry,
    // so navigation back to Portuguese cannot trigger another redirect.
    if (location.pathname !== "/") return;
    const language = readLanguagePreference() ?? browserLanguage(
      navigator.languages?.length ? navigator.languages : [navigator.language],
    );
    if (language === "pt") return;
    void router.navigate({
      to: localizedPath("/", language) as "/en" | "/es",
      search: location.search,
      hash: location.hash,
      replace: true,
    }).catch(() => {
      // Keep the existing page usable if navigation cannot complete.
    });
  }, [router]);

  return null;
}
