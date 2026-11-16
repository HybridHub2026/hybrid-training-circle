import { defineHandler } from "nitro";
import { handleAdmin } from "../forms/admin";
import type { FormsEnvironment } from "../forms/service";

export default defineHandler(event => {
  const request = event.req as Request & { runtime?: { cloudflare?: { env?: FormsEnvironment } } };
  return handleAdmin(request, request.runtime?.cloudflare?.env ?? {});
});
