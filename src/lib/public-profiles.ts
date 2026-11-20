import { createServerFn } from "@tanstack/react-start";
export const loadPublicProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const { env } = await import("cloudflare:workers");
  const { listPublicProfiles } = await import("../server/profiles/service");
  if (!env.FORMS_DB) throw new Error("Profiles database unavailable");
  return listPublicProfiles(env.FORMS_DB);
});
