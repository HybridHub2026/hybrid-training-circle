import { createFileRoute, Link } from "@tanstack/react-router";

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
    links: [{ rel: "canonical", href: "https://hybridhub.pt/comunidade" }],
  }),
  component: () => (
    <div className="pt-8">
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-20">
          <p className="eyebrow">Comunidade</p>
          <h1 className="mt-4 text-4xl md:text-6xl">HÁ ESPAÇO <span className="text-primary">PARA TI.</span></h1>
          <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">Não precisas de ter o mesmo ritmo que toda a gente. Procura pessoas com quem partilhar a fase em que estás e o desafio que queres alcançar.</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { title: "A COMEÇAR", text: "Combina uma primeira sessão simples e explica o teu ritmo. Ter companhia pode ajudar a ganhar confiança." },
              { title: "A TREINAR", text: "Partilha a tua disponibilidade e encontra companhia para manter uma rotina de corrida ou treino híbrido." },
              { title: "A COMPETIR", text: "Diz qual é a tua próxima prova e encontra pessoas com quem partilhar a preparação e a motivação." },
            ].map(({ title, text }) => (
              <div key={title} className="border-t border-border pt-5">
                <h2 className="text-2xl">{title}</h2>
                <p className="mt-3 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Modalidades e objetivos</p>
          <h2 className="mt-4 text-3xl md:text-5xl">O QUE QUERES <span className="text-primary">PARTILHAR?</span></h2>
          <p className="mt-6 text-muted-foreground md:text-lg">
            Escolhe o tipo de sessão que faz sentido para ti e combina as expectativas antes de treinar. As atividades são criadas pelos próprios membros; a disponibilidade varia conforme a participação em cada local.
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl">HYROX E PROVAS HÍBRIDAS</h3>
            <p className="mt-4 text-muted-foreground">
              Partilha o teu objetivo de prova e combina sessões de corrida e exercícios funcionais com pessoas que também se estão a preparar. As inscrições nas provas são feitas pelos canais oficiais dos organizadores.
            </p>
          </div>
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl">TREINO HÍBRIDO</h3>
            <p className="mt-4 text-muted-foreground">
              Alternas corrida e força? Explica o plano da sessão, a intensidade e o equipamento necessário para que quem participa saiba o que esperar.
            </p>
          </div>
          <div className="border-t border-primary pt-6">
            <h3 className="text-2xl">CORRIDA E RUNNING</h3>
            <p className="mt-4 text-muted-foreground">
              Combina a distância, o ritmo e o percurso antes do encontro. Uma corrida tranquila também conta: não precisas de competir para participar.
            </p>
          </div>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          A app para iOS e Android está em preparação. Na página da app podes pedir para receber o aviso de lançamento.
        </p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link to="/app" className="btn-primary">Conhece a app</Link>
          <Link to="/parceiros-de-treino" className="btn-ghost">Como encontrar parceiros de treino</Link>
          <Link to="/faq" className="btn-ghost">Perguntas frequentes</Link>
        </div>
      </section>
    </div>
  ),
});
