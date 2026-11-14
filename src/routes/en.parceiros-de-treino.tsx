import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./parceiros-de-treino";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/parceiros-de-treino")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/parceiros-de-treino"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
