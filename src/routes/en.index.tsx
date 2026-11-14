import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./index";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
