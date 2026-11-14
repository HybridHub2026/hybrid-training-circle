import { createFileRoute } from "@tanstack/react-router";
import { spanishHead } from "@/i18n/head";
import { Route as PortugueseRoute } from "./sobre";

export const Route = createFileRoute("/es/sobre")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/sobre"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
