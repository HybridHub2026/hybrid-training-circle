import { languageAlternates } from "@/i18n/language";
import { T, Localized } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import bucketHat from "@/assets/merch/bucket-hat-reversivel.jpg";
import hoodie from "@/assets/merch/hoodie-hybrid-hub.jpg";
import croppedShirt from "@/assets/merch/t-shirt-cropped.jpg";
import sportsShirt from "@/assets/merch/t-shirt-desportiva.jpg";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Hybrid Hub (Em breve)" },
      { name: "description", content: "Descobre os bucket hats, hoodies e t-shirts Hybrid Hub. Pré-visualização da coleção: os produtos ainda não estão à venda." },
      { property: "og:title", content: "Loja Hybrid Hub — Em breve" },
      { property: "og:description", content: "Bucket hats, hoodies e t-shirts Hybrid Hub. A coleção está a caminho e ainda não está à venda." },
    ],
    links: [...languageAlternates("/loja"), { rel: "canonical", href: "https://hybridhub.pt/loja" }],
  }),
  component: Loja,
});

const products = [
  { name: "Bucket hat reversível Hybrid Hub", image: bucketHat, width: 1122, height: 1402, description: "Preto de um lado, amarelo do outro. A identidade Hybrid Hub em duas versões." },
  { name: "Hoodie Hybrid Hub", image: hoodie, width: 1448, height: 1086, description: "Hoodie preto com a marca Hybrid Hub e o slogan Train • Connect • Compete." },
  { name: "T-shirt cropped Hybrid Hub", image: croppedShirt, width: 1448, height: 1086, description: "Corte curto com a identidade Hybrid Hub na frente, nas costas e na manga." },
  { name: "T-shirt desportiva Hybrid Hub", image: sportsShirt, width: 1536, height: 1024, description: "T-shirt preta com os detalhes Hybrid Hub na frente, nas costas e na manga." },
];

function Loja() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28">
      <p className="eyebrow"><T>{"Loja · Em breve"}</T></p>
      <h1 className="mt-6 text-5xl md:text-8xl"><T>{"VESTE A COMUNIDADE."}</T></h1>
      <p className="mt-6 max-w-xl text-muted-foreground md:text-lg"><T>{"A Hybrid Hub também se vive fora dos treinos. A primeira coleção está a caminho."}</T></p>
      <p className="mt-5 max-w-2xl border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground"><T>{"Pré-visualização da coleção. Estes produtos ainda não estão à venda."}</T></p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 md:mt-12">
        <T>{products.map((p) => (
          <article key={p.name}>
            <div className="relative overflow-hidden rounded-sm bg-card">
              <Localized as="img" src={p.image} alt={p.name} loading="lazy" decoding="async" width={p.width} height={p.height} className="aspect-[4/3] w-full bg-black object-contain" />
              <span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground"><T>{"Em breve"}</T></span>
            </div>
            <h2 className="mt-5 text-lg"><T>{p.name}</T></h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><T>{p.description}</T></p>
            <p className="mt-3 text-sm text-primary"><T>{"Disponível em breve"}</T></p>
          </article>
        ))}</T>
      </div>
    </section>
  );
}
