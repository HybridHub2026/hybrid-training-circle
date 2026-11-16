import { definePlugin } from "nitro";
import { useNitroHooks } from "nitro/app";
import { deliverPendingMail, type FormsEnvironment } from "../forms/service";

export default definePlugin(() => {
  useNitroHooks().hook("cloudflare:scheduled", async ({ env }) => {
    await deliverPendingMail(env as FormsEnvironment);
  });
});
