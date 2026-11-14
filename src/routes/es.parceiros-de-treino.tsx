import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./parceiros-de-treino";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/parceiros-de-treino")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/parceiros-de-treino"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
