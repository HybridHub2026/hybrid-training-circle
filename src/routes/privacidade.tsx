import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Hybrid Hub" },
      { name: "description", content: "Política de Privacidade da Hybrid Hub." },
      { property: "og:title", content: "Política de Privacidade — Hybrid Hub" },
      { property: "og:description", content: "Política de Privacidade da Hybrid Hub." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-6 text-5xl md:text-7xl">POLÍTICA DE PRIVACIDADE</h1>
      <p className="mt-8 text-muted-foreground">O texto da Política de Privacidade será publicado em breve.</p>
    </section>
  ),
});
