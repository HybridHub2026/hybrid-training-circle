import { createFileRoute } from "@tanstack/react-router";
import { AppShowcase, Features } from "@/components/site/Sections";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "App Hybrid Hub | Parceiros de treino e provas" },
      { name: "description", content: "Conhece a app Hybrid Hub: encontra parceiros de treino, descobre provas, explora comunidades e liga-te a pessoas através do desporto." },
      { property: "og:title", content: "App Hybrid Hub | Parceiros de treino e provas" },
      { property: "og:description", content: "Conhece a app Hybrid Hub e descobre pessoas, treinos, provas e comunidades." },
    ],
    links: [{ rel: "canonical", href: "https://hybridhub.pt/app" }],
  }),
  component: () => (
    <div className="pt-8">
      <AppShowcase headingLevel={1} />
      <Features />
    </div>
  ),
});
