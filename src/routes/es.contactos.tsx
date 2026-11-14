import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute } from "./contactos";
import { spanishHead } from "@/i18n/head";

export const Route = createFileRoute("/es/contactos")({
  head: () => spanishHead(PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0], "/contactos"),
  component: () => { const Page = PortugueseRoute.options.component; return Page ? <Page /> : null; },
});
