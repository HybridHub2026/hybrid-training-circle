import { languageAlternates } from "@/i18n/language";
import { Link, T } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Hybrid Hub | Corrida e treino híbrido" },
      { name: "description", content: "Conhece a Hybrid Hub: um projeto para aproximar pessoas através da corrida, do treino híbrido e das provas. A app para iOS e Android está em preparação." },
      { property: "og:title", content: "Sobre a Hybrid Hub | Corrida e treino híbrido" },
      { property: "og:description", content: "O que é a Hybrid Hub, como funciona e em que fase está a app." },
    ],
    links: [...languageAlternates("/sobre"), { rel: "canonical", href: "https://hybridhub.pt/sobre" }],
  }),
  component: Sobre,
});

export function Sobre() {
  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <header className="max-w-3xl">
        <p className="eyebrow"><T>{"Sobre a Hybrid Hub"}</T></p>
        <h1 className="mt-5 text-4xl md:text-6xl"><T>{"O DESPORTO "}</T><span className="text-primary"><T>{"APROXIMA PESSOAS."}</T></span></h1>
        <p className="mt-6 text-muted-foreground md:text-lg"><T>{"A Hybrid Hub é um projeto para ligar pessoas através do desporto. Ajuda a descobrir parceiros de treino, oportunidades criadas pela comunidade, provas e profissionais de exercício físico."}</T></p>
      </header>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"QUEM CRIOU A HYBRID HUB"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"Tiago Passos é o fundador da Hybrid Hub. É personal trainer há mais de 15 anos e tem formação em treino funcional, treino híbrido e HYROX. Criou o projeto por acreditar que o desporto também serve para criar ligações, partilhar experiências e superar desafios."}</T></p>
        <blockquote className="mt-8 border-l-2 border-primary pl-5 text-xl font-semibold leading-relaxed md:text-2xl"><T>{"“Treinar é bom. Treinar com as pessoas certas é ainda melhor.”"}</T></blockquote>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"PARA QUEM É"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"A Hybrid Hub dirige-se a quem quer correr, combinar corrida e força no treino híbrido, preparar uma prova como HYROX ou simplesmente encontrar companhia para se manter ativo. Há espaço para diferentes níveis de experiência, desde quem está a começar até quem compete."}</T></p>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"COMO FUNCIONA"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"Na app, os membros poderão criar oportunidades de treino e indicar modalidade, local, data, hora e nível. Outras pessoas poderão procurar atividades de acordo com os seus interesses. A disponibilidade dependerá das oportunidades criadas em cada zona; a Hybrid Hub facilitará a ligação entre pessoas e não supervisionará presencialmente os treinos."}</T></p>
        <Link to="/como-funciona" className="btn-ghost mt-8"><T>{"Vê como funciona"}</T></Link>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"EM QUE FASE ESTAMOS"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"O website já apresenta o projeto e permite receber um aviso de lançamento. A app Hybrid Hub para iOS e Android está em preparação. As funcionalidades descritas no site referem-se à experiência planeada para a app."}</T></p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/app" className="btn-primary"><T>{"Conhece a app"}</T></Link>
          <Link to="/contactos" className="btn-ghost"><T>{"Fala connosco"}</T></Link>
        </div>
      </section>
    </article>
  );
}
