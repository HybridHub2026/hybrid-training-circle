import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./comunidade";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/comunidade")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/comunidade"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
