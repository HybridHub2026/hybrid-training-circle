import { defineHandler } from "nitro";
import { listPublicProfiles } from "../profiles/service";
import type { FormsEnvironment } from "../forms/service";
export default defineHandler(async (event) => {
  const request = event.req as Request & { runtime?: { cloudflare?: { env?: FormsEnvironment } } };
  const db = request.runtime?.cloudflare?.env?.FORMS_DB;
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (!db) return Response.json({ error: "unavailable" }, { status: 503, headers });
  try {
    return Response.json({ profiles: await listPublicProfiles(db) }, { headers });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
});
