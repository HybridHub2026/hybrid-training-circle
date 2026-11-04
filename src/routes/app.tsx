import { createFileRoute } from "@tanstack/react-router";
import { AppShowcase, Features } from "@/components/site/Sections";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A app — Hybrid Hub" },
      { name: "description", content: "Encontra oportunidades, descobre pessoas e mantém-te ligado ao desporto com a app Hybrid Hub." },
      { property: "og:title", content: "A app Hybrid Hub" },
      { property: "og:description", content: "Tudo começa com uma ligação." },
    ],
  }),
  component: () => (
    <div className="pt-16">
      <AppShowcase />
      <Features />
    </div>
  ),
});
