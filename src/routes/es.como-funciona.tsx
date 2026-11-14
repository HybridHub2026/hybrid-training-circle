import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./como-funciona";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/como-funciona")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/como-funciona"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
