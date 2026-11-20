import { createFileRoute } from "@tanstack/react-router";
import { Route as PortugueseRoute, MembersPage } from "./quem-ja-faz-parte";
import { englishHead } from "@/i18n/head";
export const Route = createFileRoute("/en/quem-ja-faz-parte")({
  head: () =>
    englishHead(
      PortugueseRoute.options.head!({} as never) as Parameters<typeof englishHead>[0],
      "/quem-ja-faz-parte",
    ),
  component: MembersPage,
});
