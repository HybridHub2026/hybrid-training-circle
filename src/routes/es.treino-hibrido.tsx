import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./treino-hibrido";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/treino-hibrido")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/treino-hibrido"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
