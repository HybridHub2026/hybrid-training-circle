import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./cookies";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/cookies")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/cookies"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
