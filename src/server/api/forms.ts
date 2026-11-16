import { defineHandler } from "nitro";
import { handleForms, type FormsEnvironment } from "../forms/service";

export default defineHandler(event => {
  const request = event.req as Request & { runtime?: { cloudflare?: { env?: FormsEnvironment } }; waitUntil?: (promise: Promise<unknown>) => void };
  return handleForms(request, request.runtime?.cloudflare?.env ?? {}, request.waitUntil);
});
