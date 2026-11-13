import { createFileRoute } from "@tanstack/react-router";
import { About, Community } from "@/components/site/Sections";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade de corrida e treino | Hybrid Hub" },
      {
        name: "description",
        content:
          "Encontra pessoas para correr, treinar e participar em provas. Na comunidade Hybrid Hub há espaço para quem está a começar, treina regularmente ou compete.",
      },
      { property: "og:title", content: "Comunidade de corrida e treino | Hybrid Hub" },
      {
        property: "og:description",
        content:
          "Encontra pessoas para correr, treinar e participar em provas na comunidade Hybrid Hub.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hybridhub.pt/comunidade" }],
  }),
  component: () => (
    <div className="pt-8">
      <Community />
      <About compact />
    </div>
  ),
});
