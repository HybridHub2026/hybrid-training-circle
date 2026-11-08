import { createFileRoute } from "@tanstack/react-router";
import { About, Community } from "@/components/site/Sections";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Hybrid Hub" },
      { name: "description", content: "Do primeiro quilómetro à próxima prova, há espaço para ti na comunidade Hybrid Hub." },
      { property: "og:title", content: "Comunidade — Hybrid Hub" },
      { property: "og:description", content: "Há espaço para ti." },
    ],
  }),
  component: () => (
    <div className="pt-8">
      <Community />
      <About compact />
    </div>
  ),
});
