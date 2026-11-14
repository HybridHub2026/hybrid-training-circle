import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./index";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
