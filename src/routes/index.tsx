import { createFileRoute } from "@tanstack/react-router";
import { Hero, About, Features, HowItWorks, Community, AppShowcase, Shop, FinalCta } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hybrid Hub | Corrida, HYROX e treino híbrido em Portugal" },
      { name: "description", content: "Encontra pessoas para correr, fazer treino híbrido e preparar provas como HYROX. Descobre parceiros, treinos e comunidades desportivas em Portugal." },
      { property: "og:title", content: "Hybrid Hub | Corrida, HYROX e treino híbrido em Portugal" },
      { property: "og:description", content: "O desporto aproxima pessoas. A Hybrid Hub ajuda-as a encontrar-se." },
    ],
    links: [{ rel: "canonical", href: "https://hybridhub.pt/" }],
  }),
  component: () => (
    <>
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Community />
      <AppShowcase />
      <Shop />
      <FinalCta />
    </>
  ),
});
