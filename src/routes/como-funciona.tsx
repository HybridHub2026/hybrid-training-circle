import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks, FinalCta } from "@/components/site/Sections";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — Hybrid Hub" },
      { name: "description", content: "Explora, liga-te e treina: três passos para encontrar pessoas com quem praticar desporto." },
      { property: "og:title", content: "Como funciona — Hybrid Hub" },
      { property: "og:description", content: "Explora. Liga-te. Treina." },
    ],
  }),
  component: () => (
    <div className="pt-8">
      <HowItWorks />
      <FinalCta />
    </div>
  ),
});
