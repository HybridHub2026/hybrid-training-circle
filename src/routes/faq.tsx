import { createFileRoute } from "@tanstack/react-router";
import { PageTop } from "@/components/site/Sections";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — Hybrid Hub" },
      { name: "description", content: "Perguntas frequentes sobre a Hybrid Hub." },
      { property: "og:title", content: "FAQ — Hybrid Hub" },
      { property: "og:description", content: "Perguntas frequentes sobre a Hybrid Hub." },
    ],
  }),
  component: () => (
    <section className="pb-24">
      <PageTop eyebrow="FAQ" title="PERGUNTAS FREQUENTES" />
      <p className="mx-auto mt-8 max-w-7xl px-5 text-muted-foreground md:px-10">As perguntas frequentes serão publicadas em breve.</p>
    </section>
  ),
});
