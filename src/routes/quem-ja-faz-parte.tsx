import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { loadPublicProfiles } from "@/lib/public-profiles";
import { MemberDirectory } from "@/components/site/MemberDirectory";
import { languageAlternates } from "@/i18n/language";
import { type MemberProfile } from "@/components/site/member-profiles";

export function memberPageHead(memberProfiles: MemberProfile[]) {
  return {
    meta: [
      { title: "Quem já faz parte | Coaches e comunidades Hybrid Hub" },
      {
        name: "description",
        content:
          "Conhece os coaches e comunidades que se preparam para integrar a Hybrid Hub. Os perfis são apresentados após confirmação de cada participante.",
      },
      { property: "og:title", content: "Quem já faz parte | Coaches e comunidades Hybrid Hub" },
      {
        property: "og:description",
        content: "Pessoas e projetos que aproximam a comunidade através do desporto.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hybridhub.pt/quem-ja-faz-parte" },
      ...(!memberProfiles.length ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [
      { rel: "canonical", href: "https://hybridhub.pt/quem-ja-faz-parte" },
      ...languageAlternates("/quem-ja-faz-parte"),
    ],
  };
}

export const Route = createFileRoute("/quem-ja-faz-parte")({
  loader: () => loadPublicProfiles(),
  staleTime: 0,
  head: ({
    loaderData,
  }: {
    loaderData?: import("@/components/site/member-profiles").MemberProfile[];
  }) => memberPageHead(loaderData ?? []),
  component: MembersPage,
});

export function MembersPage() {
  const memberProfiles = useLoaderData({ strict: false }) as MemberProfile[];
  return <MemberDirectory memberProfiles={memberProfiles} />;
}
