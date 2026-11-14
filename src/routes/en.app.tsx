import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./app";
import { englishHead } from "@/i18n/head";

export const Route = createFileRoute("/en/app")({
  head: () => englishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0], "/app"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
