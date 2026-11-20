import { defineHandler } from "nitro";
import { handleProfileImages } from "../profiles/images";
import type { FormsEnvironment } from "../forms/service";
export default defineHandler((event) => {
  const request = event.req as Request & { runtime?: { cloudflare?: { env?: FormsEnvironment } } };
  return handleProfileImages(request, request.runtime?.cloudflare?.env ?? {});
});
