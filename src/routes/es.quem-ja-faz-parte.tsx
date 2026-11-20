import { createFileRoute } from "@tanstack/react-router";
import { memberPageHead, MembersPage } from "./quem-ja-faz-parte";
import { loadPublicProfiles } from "@/lib/public-profiles";
import { spanishHead } from "@/i18n/head";
export const Route = createFileRoute("/es/quem-ja-faz-parte")({
  loader: () => loadPublicProfiles(),
  staleTime: 0,
  head: ({
    loaderData,
  }: {
    loaderData?: import("@/components/site/member-profiles").MemberProfile[];
  }) => spanishHead(memberPageHead(loaderData ?? []), "/quem-ja-faz-parte"),
  component: MembersPage,
});
