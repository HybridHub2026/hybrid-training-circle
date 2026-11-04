import { createFileRoute } from "@tanstack/react-router";
import { PageTop } from "@/components/site/Sections";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies — Hybrid Hub" },
      { name: "description", content: "Informação sobre cookies da Hybrid Hub." },
      { property: "og:title", content: "Cookies — Hybrid Hub" },
      { property: "og:description", content: "Informação sobre cookies da Hybrid Hub." },
    ],
  }),
  component: () => (
    <section className="pb-24">
      <PageTop eyebrow="Legal" title="COOKIES" />
      <p className="mx-auto mt-8 max-w-7xl px-5 text-muted-foreground md:px-10">A informação sobre cookies será publicada em breve.</p>
    </section>
  ),
});
