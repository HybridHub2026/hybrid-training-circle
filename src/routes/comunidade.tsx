import { createFileRoute } from "@tanstack/react-router";
import { About, Community } from "@/components/site/Sections";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [     
{ title: "Comunidades Desportivas e Treino | Hybrid Hub" },
{ name: "description", content: "Junta-te a comunidades de treino híbrido, HYROX, corrida e outras modalidades. Descobre atividades, conhece praticantes e treina em conjunto na Hybrid Hub." },
      { property: "og:title", content: "Comunidades Desportivas e Treino | Hybrid Hub" },
      { property: "og:description", content: "Junta-te a comunidades de treino híbrido, HYROX, corrida e outras modalidades. Descobre atividades, conhece praticantes e treina em conjunto na Hybrid Hub." },
    ],
  }),
  component: () => (
    <div className="pt-8">
      <Community />
      <About compact />
    </div>
  ),
});
