import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./cookies";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/cookies")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/cookies"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
