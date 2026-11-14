import { createFileRoute } from "@tanstack/react-router";
import { englishHead } from "@/i18n/head";
import { Route as PortugueseRoute } from "./sobre";

export const Route = createFileRoute("/en/sobre")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/sobre"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
