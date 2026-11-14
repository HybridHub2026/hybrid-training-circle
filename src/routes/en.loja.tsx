import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./loja";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/loja")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/loja"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
