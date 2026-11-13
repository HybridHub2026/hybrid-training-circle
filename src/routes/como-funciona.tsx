import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks, FinalCta } from "@/components/site/Sections";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona a Hybrid Hub | Treinos e parceiros" },
      { name: "description", content: "Explora, liga-te e treina: três passos para encontrar pessoas com quem praticar desporto." },
      { property: "og:title", content: "Como funciona a Hybrid Hub | Treinos e parceiros" },
      { property: "og:description", content: "Explora oportunidades, liga-te a pessoas com interesses semelhantes e participa em treinos." },
    ],
    links: [{ rel: "canonical", href: "https://hybridhub.pt/como-funciona" }],
  }),
  component: () => (
    <div className="pt-8">
      <HowItWorks headingLevel={1} />
      <FinalCta />
    </div>
  ),
});
