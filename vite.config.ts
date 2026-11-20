// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    ssr: { external: ["cloudflare:workers"] },
    build: { rolldownOptions: { external: ["cloudflare:workers"] } },
  },
  nitro: {
    serverDir: "./src/server",
    cloudflare: {
      wrangler: {
        previews: {},
        triggers: { crons: ["*/5 * * * *"] },
        d1_databases: [{
          binding: "FORMS_DB",
          database_name: "hybridhub-website-forms",
          database_id: "57c2d7c4-d961-4954-bf37-081065591e84",
        }],
        vars: {
          BREVO_SENDER_EMAIL: "avisos@hybridhub.pt",
          FORMS_ADMIN_EMAIL: "hybridhubadmin@gmail.com",
          FORMS_TURNSTILE_SITE_KEY: "0x4AAAAAAGDTnY0RiSZLHaad",
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
