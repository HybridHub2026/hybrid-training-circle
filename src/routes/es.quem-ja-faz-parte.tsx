import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute, MembersPage } from "./quem-ja-faz-parte";
import { spanishHead } from "@/i18n/head";
export const Route = createFileRoute("/es/quem-ja-faz-parte")({
  head: () =>
    spanishHead(
      PortugueseRoute.options.head!({} as never) as Parameters<typeof spanishHead>[0],
      "/quem-ja-faz-parte",
    ),
  component: MembersPage,
});
