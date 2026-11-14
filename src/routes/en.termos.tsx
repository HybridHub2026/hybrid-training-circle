import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./termos";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/termos")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/termos"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
