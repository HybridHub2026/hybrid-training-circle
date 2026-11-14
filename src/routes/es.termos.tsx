import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./termos";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/termos")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/termos"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
