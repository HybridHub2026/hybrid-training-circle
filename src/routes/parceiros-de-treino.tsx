import { createFileRoute, Link } from "@tanstack/react-router";

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
    links: [{ rel: "canonical", href: "https://hybridhub.pt/parceiros-de-treino" }],
  }),
  component: PartnersGuide,
});

function PartnersGuide() {
  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <header className="max-w-3xl">
        <p className="eyebrow">Guia de treino</p>
        <h1 className="mt-5 text-4xl md:text-6xl">
          COMO ENCONTRAR UM <span className="text-primary">PARCEIRO DE TREINO.</span>
        </h1>
        <p className="mt-6 text-muted-foreground md:text-lg">
          Correr com companhia, combinar corrida e força ou preparar uma prova pode ser mais simples quando as expectativas estão alinhadas. Antes de marcar uma sessão, compara quatro pontos: objetivo, nível, local e horário.
        </p>
      </header>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl">O QUE COMBINAR ANTES DO PRIMEIRO TREINO</h2>
        <ol className="mt-8 grid gap-7 md:grid-cols-2">
          <li>
            <h3 className="text-xl text-primary">01. Objetivo e modalidade</h3>
            <p className="mt-3 text-muted-foreground">Explica se procuras uma corrida tranquila, uma sessão de treino híbrido ou companhia para preparar uma prova. Assim, cada pessoa sabe o que esperar.</p>
          </li>
          <li>
            <h3 className="text-xl text-primary">02. Ritmo e experiência</h3>
            <p className="mt-3 text-muted-foreground">Não é preciso ter o mesmo nível, mas convém combinar distância, duração e intensidade. Numa corrida em grupo, um ritmo confortável para uma pessoa pode ser exigente para outra.</p>
          </li>
          <li>
            <h3 className="text-xl text-primary">03. Local e horário</h3>
            <p className="mt-3 text-muted-foreground">Escolhe uma zona acessível e confirma o ponto de encontro, a data e a hora. As oportunidades na Hybrid Hub dependem dos locais e horários definidos pelos próprios membros.</p>
          </li>
          <li>
            <h3 className="text-xl text-primary">04. Plano da sessão</h3>
            <p className="mt-3 text-muted-foreground">Decide com antecedência se vão seguir um percurso, fazer intervalos ou usar equipamento. Para um primeiro encontro, um local público e um plano simples ajudam todos a sentir-se à vontade.</p>
          </li>
        </ol>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl">ENCONTRA COMPANHIA PARA O TEU DESPORTO</h2>
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-2xl">Corrida e running</h3>
            <p className="mt-3 text-muted-foreground">Para começar a correr, manter uma rotina ou preparar uma distância específica, procura alguém com disponibilidade e ritmo compatíveis. Combinar o percurso e a duração evita surpresas no primeiro treino.</p>
          </div>
          <div>
            <h3 className="text-2xl">Treino híbrido</h3>
            <p className="mt-3 text-muted-foreground">Se alternas corrida com exercícios de força, diz que tipo de sessão queres fazer e que equipamento estará disponível. Uma pessoa pode querer trabalhar resistência; outra pode preferir técnica ou intensidade.</p>
          </div>
          <div>
            <h3 className="text-2xl">Preparação de provas como HYROX</h3>
            <p className="mt-3 text-muted-foreground">Encontra pessoas com um objetivo de prova semelhante e combina sessões que façam sentido para ambos. Consulta sempre o organizador para informações oficiais sobre calendário, regras e inscrições.</p>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl">COMO A HYBRID HUB PODE AJUDAR</h2>
        <p className="mt-5 text-muted-foreground md:text-lg">
          A Hybrid Hub foi pensada para ligar pessoas através de oportunidades de treino criadas pelos membros. Podes explorar atividades por modalidade, localização, horário e nível de experiência, ou criar uma oportunidade com os detalhes do teu treino. A app para iOS e Android está em preparação; a disponibilidade de atividades depende da participação da comunidade em cada zona.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/comunidade" className="btn-primary">Explora a comunidade</Link>
          <Link to="/app" className="btn-ghost">Conhece a app</Link>
        </div>
      </section>
    </article>
  );
}
