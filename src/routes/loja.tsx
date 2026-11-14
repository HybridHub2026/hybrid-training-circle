import { languageAlternates } from "@/i18n/language";
import { T, Localized } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import merch from "@/assets/merch.jpg";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Hybrid Hub (Em breve)" },
      { name: "description", content: "Bucket hats e t-shirts Hybrid Hub. A loja oficial de merchandising está a chegar." },
      { property: "og:title", content: "Loja Hybrid Hub — Em breve" },
      { property: "og:description", content: "Bucket hats e t-shirts Hybrid Hub. Em breve." },
    ],
    links: [...languageAlternates("/loja"), { rel: "canonical", href: "https://hybridhub.pt/loja" }],
  }),
  component: Loja,
});

// Estrutura preparada para receber produtos de uma futura loja online.
const products = [
  { name: "Bucket hat reversível Hybrid Hub" },
  { name: "T-shirt oficial Hybrid Hub" },
];

function Loja() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28">
      <p className="eyebrow"><T>{"Loja · Em breve"}</T></p>
      <h1 className="mt-6 text-5xl md:text-8xl"><T>{"VESTE A COMUNIDADE."}</T></h1>
      <p className="mt-6 max-w-xl text-muted-foreground md:text-lg"><T>{"A Hybrid Hub também se vive fora dos treinos. A primeira coleção está a caminho."}</T></p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 md:mt-12">
        <T>{products.map((p) => (
          <article key={p.name} className="group">
            <div className="relative overflow-hidden rounded-sm bg-card">
              <Localized as="img" src={merch} alt={p.name} loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground"><T>{"Em breve"}</T></span>
            </div>
            <h2 className="mt-5 text-lg"><T>{p.name}</T></h2>
            <p className="text-sm text-muted-foreground"><T>{"Disponível em breve"}</T></p>
          </article>
        ))}</T>
      </div>
    </section>
  );
}
