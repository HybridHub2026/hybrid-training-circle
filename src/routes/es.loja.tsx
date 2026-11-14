import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./loja";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/loja")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/loja"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
