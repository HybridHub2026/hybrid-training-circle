import { createFileRoute } from "@tanstack/react-router";
import { Hero, About, Features, HowItWorks, Community, AppShowcase, Shop, FinalCta } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hybrid Hub | Parceiros de treino, provas e comunidades" },
      { name: "description", content: "O desporto aproxima pessoas. A Hybrid Hub ajuda-as a encontrar-se: parceiros, treinos, provas, comunidades e coaches." },
      { property: "og:title", content: "Hybrid Hub | Parceiros de treino, provas e comunidades" },
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
