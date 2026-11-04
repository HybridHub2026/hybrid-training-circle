import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e Condições — Hybrid Hub" },
      { name: "description", content: "Termos e Condições da Hybrid Hub." },
      { property: "og:title", content: "Termos e Condições — Hybrid Hub" },
      { property: "og:description", content: "Termos e Condições da Hybrid Hub." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-6 text-5xl md:text-7xl">TERMOS E CONDIÇÕES</h1>
      <p className="mt-8 text-muted-foreground">O texto dos Termos e Condições será publicado em breve.</p>
    </section>
  ),
});
