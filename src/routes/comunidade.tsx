import { languageAlternates } from "@/i18n/language";
import { Link, T } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { About, Community } from "@/components/site/Sections";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade de corrida, HYROX e treino híbrido | Hybrid Hub" },
      {
        name: "description",
        content:
          "Descobre a comunidade Hybrid Hub para corrida, treino híbrido e preparação de provas como HYROX. Encontra pessoas com objetivos semelhantes em Portugal.",
      },
      { property: "og:title", content: "Comunidade de corrida, HYROX e treino híbrido | Hybrid Hub" },
      {
        property: "og:description",
        content:
          "Corrida, treino híbrido e provas como HYROX: encontra pessoas para partilhar o caminho na Hybrid Hub.",
      },
    ],
    links: [...languageAlternates("/comunidade"), { rel: "canonical", href: "https://hybridhub.pt/comunidade" }],
  }),
  component: () => (
    <div className="pt-8">
      <Community headingLevel={1} />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow"><T>{"Treina com outras pessoas"}</T></p>
          <h2 className="mt-4 text-3xl md:text-5xl"><T>{"ENCONTRA O TEU "}</T><span className="text-primary"><T>{"RITMO."}</T></span></h2>
          <p className="mt-6 text-muted-foreground md:text-lg"><T>{"A Hybrid Hub foi criada para aproximar pessoas através do desporto. Quer estejas a começar ou já tenhas uma prova em vista, podes procurar oportunidades de treino por modalidade, localização, horário e nível de experiência. As atividades são criadas pelos próprios membros e a disponibilidade varia conforme a comunidade em cada local."}</T></p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl"><T>{"HYROX E PROVAS HÍBRIDAS"}</T></h3>
            <p className="mt-4 text-muted-foreground"><T>{"Preparar uma prova que combina corrida e exercícios funcionais é mais fácil de partilhar com quem tem objetivos semelhantes. Encontra companhia para treinar e pessoas interessadas em provas como HYROX. A inscrição é feita pelos canais oficiais dos organizadores."}</T></p>
          </div>
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl"><T>{"TREINO HÍBRIDO"}</T></h3>
            <p className="mt-4 text-muted-foreground"><T>{"Se alternas corrida e treino de força, encontra pessoas para partilhar sessões, manter a motivação e explorar diferentes formas de treinar. Podes procurar atividades adequadas ao teu nível e criar uma oportunidade com local, data e hora definidos por ti."}</T></p>
          </div>
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl"><T>{"CORRIDA E RUNNING"}</T></h3>
            <p className="mt-4 text-muted-foreground"><T>{"Queres começar a correr, manter uma rotina ou preparar uma prova? Descobre pessoas para correr contigo e oportunidades na tua zona. Não precisas de competir para fazer parte da comunidade."}</T></p>
          </div>
        </div>
        <p className="mt-10 text-sm text-muted-foreground"><T>{"A app para iOS e Android está em preparação. As oportunidades disponíveis dependem das atividades criadas pelos membros."}</T></p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link to="/app" className="btn-primary"><T>{"Conhece a app"}</T></Link>
          <Link to="/parceiros-de-treino" className="btn-ghost"><T>{"Como encontrar parceiros de treino"}</T></Link>
          <Link to="/faq" className="btn-ghost"><T>{"Perguntas frequentes"}</T></Link>
        </div>
      </section>
      <About compact />
    </div>
  ),
});
