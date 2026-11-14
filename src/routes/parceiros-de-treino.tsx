import { languageAlternates } from "@/i18n/language";
import { Link, T } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/parceiros-de-treino")({
  head: () => ({
    meta: [
      { title: "Como encontrar parceiros de treino | Hybrid Hub" },
      {
        name: "description",
        content:
          "Guia para encontrar parceiros de corrida, treino híbrido e preparação de provas como HYROX em Portugal. Compara objetivos, ritmo, local e horários.",
      },
      { property: "og:title", content: "Como encontrar parceiros de treino | Hybrid Hub" },
      {
        property: "og:description",
        content:
          "O que combinar antes de treinar com alguém em corrida, treino híbrido ou preparação de provas.",
      },
    ],
    links: [...languageAlternates("/parceiros-de-treino"), { rel: "canonical", href: "https://hybridhub.pt/parceiros-de-treino" }],
  }),
  component: PartnersGuide,
});

function PartnersGuide() {
  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <header className="max-w-3xl">
        <p className="eyebrow"><T>{"Guia de treino"}</T></p>
        <h1 className="mt-5 text-4xl md:text-6xl"><T>{"COMO ENCONTRAR UM "}</T><span className="text-primary"><T>{"PARCEIRO DE TREINO."}</T></span>
        </h1>
        <p className="mt-6 text-muted-foreground md:text-lg"><T>{"Correr com companhia, combinar corrida e força ou preparar uma prova pode ser mais simples quando as expectativas estão alinhadas. Antes de marcar uma sessão, compara quatro pontos: objetivo, nível, local e horário."}</T></p>
      </header>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"O QUE COMBINAR ANTES DO PRIMEIRO TREINO"}</T></h2>
        <ol className="mt-8 grid gap-7 md:grid-cols-2">
          <li>
            <h3 className="text-xl text-primary"><T>{"01. Objetivo e modalidade"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Explica se procuras uma corrida tranquila, uma sessão de treino híbrido ou companhia para preparar uma prova. Assim, cada pessoa sabe o que esperar."}</T></p>
          </li>
          <li>
            <h3 className="text-xl text-primary"><T>{"02. Ritmo e experiência"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Não é preciso ter o mesmo nível, mas convém combinar distância, duração e intensidade. Numa corrida em grupo, um ritmo confortável para uma pessoa pode ser exigente para outra."}</T></p>
          </li>
          <li>
            <h3 className="text-xl text-primary"><T>{"03. Local e horário"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Escolhe uma zona acessível e confirma o ponto de encontro, a data e a hora. As oportunidades na Hybrid Hub dependem dos locais e horários definidos pelos próprios membros."}</T></p>
          </li>
          <li>
            <h3 className="text-xl text-primary"><T>{"04. Plano da sessão"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Decide com antecedência se vão seguir um percurso, fazer intervalos ou usar equipamento. Para um primeiro encontro, um local público e um plano simples ajudam todos a sentir-se à vontade."}</T></p>
          </li>
        </ol>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"ENCONTRA COMPANHIA PARA O TEU DESPORTO"}</T></h2>
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-2xl"><T>{"Corrida e running"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Para começar a correr, manter uma rotina ou preparar uma distância específica, procura alguém com disponibilidade e ritmo compatíveis. Combinar o percurso e a duração evita surpresas no primeiro treino."}</T></p>
          </div>
          <div>
            <h3 className="text-2xl"><T>{"Treino híbrido"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Se alternas corrida com exercícios de força, diz que tipo de sessão queres fazer e que equipamento estará disponível. Uma pessoa pode querer trabalhar resistência; outra pode preferir técnica ou intensidade."}</T></p>
          </div>
          <div>
            <h3 className="text-2xl"><T>{"Preparação de provas como HYROX"}</T></h3>
            <p className="mt-3 text-muted-foreground"><T>{"Encontra pessoas com um objetivo de prova semelhante e combina sessões que façam sentido para ambos. Consulta sempre o organizador para informações oficiais sobre calendário, regras e inscrições."}</T></p>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"COMO A HYBRID HUB PODE AJUDAR"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"A Hybrid Hub foi pensada para ligar pessoas através de oportunidades de treino criadas pelos membros. Podes explorar atividades por modalidade, localização, horário e nível de experiência, ou criar uma oportunidade com os detalhes do teu treino. A app para iOS e Android está em preparação; a disponibilidade de atividades depende da participação da comunidade em cada zona."}</T></p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/comunidade" className="btn-primary"><T>{"Explora a comunidade"}</T></Link>
          <Link to="/app" className="btn-ghost"><T>{"Conhece a app"}</T></Link>
        </div>
      </section>
    </article>
  );
}
