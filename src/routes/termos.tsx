import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e Condições — Hybrid Hub" },
      { name: "description", content: "Termos e Condições de utilização da plataforma Hybrid Hub." },
      { property: "og:title", content: "Termos e Condições — Hybrid Hub" },
      { property: "og:description", content: "Termos e Condições de utilização da plataforma Hybrid Hub." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://hybridhub.pt/termos" }],
  }),
  component: TermosPage,
});

type Block = string | { list: string[] };

// Secções 09 a 19 aguardam o restante texto enviado pela Hybrid Hub.
const sections: { heading: string; body: Block[] }[] = [
  {
    heading: "Objeto e âmbito",
    body: [
      "A Hybrid Hub é uma plataforma digital destinada a aproximar pessoas através do desporto.",
      "Permite encontrar parceiros de treino, criar e descobrir oportunidades, procurar provas, integrar comunidades e encontrar profissionais de exercício físico.",
      "A plataforma funciona como intermediária e facilitadora de contactos entre utilizadores. Não organiza, supervisiona nem garante a execução das atividades criadas pelos utilizadores.",
    ],
  },
  {
    heading: "Aceitação dos termos",
    body: [
      "A utilização das funcionalidades que exigem registo pressupõe a aceitação dos presentes Termos e Condições e o conhecimento da Política de Privacidade.",
      "Os utilizadores devem respeitar as regras da plataforma e a legislação aplicável.",
    ],
  },
  {
    heading: "Requisitos de utilização",
    body: [
      "A idade mínima para criar uma conta e participar através da plataforma é de 18 anos.",
      "Cada pessoa pode ter apenas uma conta. O registo utiliza nome próprio e apelido.",
      "Os utilizadores devem fornecer informações verdadeiras e manter os seus dados atualizados.",
    ],
  },
  {
    heading: "Registo e segurança da conta",
    body: [
      "A plataforma utiliza verificação por SMS.",
      "Cada utilizador é responsável pela segurança da sua conta e pelas atividades realizadas através dela.",
      "É proibido utilizar identidades falsas, criar contas fraudulentas ou utilizar contas de terceiros sem autorização.",
    ],
  },
  {
    heading: "Utilização gratuita",
    body: [
      "A utilização da Hybrid Hub é gratuita para os utilizadores nesta fase.",
      "A criação e a participação em oportunidades de treino não estão sujeitas a taxas cobradas pela Hybrid Hub.",
    ],
  },
  {
    heading: "Criação de oportunidades",
    body: [
      "Os utilizadores podem criar oportunidades de treino e atividades desportivas. O criador define:",
      {
        list: [
          "Modalidade.",
          "Local de encontro.",
          "Data e horário.",
          "Nível de experiência.",
          "Número máximo de participantes.",
          "Outras características disponibilizadas no formulário.",
        ],
      },
      "As oportunidades são públicas e podem ser descobertas pelos utilizadores da plataforma. Não existe, nesta fase, a possibilidade de criar oportunidades privadas.",
      "A localização das oportunidades é definida pelos próprios utilizadores, pelo que não existe limitação geográfica a Portugal.",
      "O criador deve disponibilizar informações corretas e comunicar eventuais alterações relevantes.",
    ],
  },
  {
    heading: "Participação em oportunidades",
    body: [
      "Os utilizadores podem descobrir oportunidades e solicitar ou confirmar a sua participação de acordo com as funcionalidades disponíveis.",
      "Cada participante é responsável por avaliar se a atividade é adequada à sua experiência, condição física e capacidade técnica.",
      "A Hybrid Hub não garante a presença, a pontualidade, o comportamento ou a capacidade física dos participantes.",
    ],
  },
  {
    heading: "Cancelamentos",
    body: [
      "Os utilizadores podem cancelar a sua participação numa oportunidade a qualquer momento. O cancelamento não implica penalização automática.",
      "No entanto, devem informar os restantes participantes com a maior antecedência possível, através dos mecanismos disponibilizados na aplicação.",
      "O criador pode cancelar uma oportunidade, devendo comunicar essa decisão aos participantes.",
    ],
  },
];

function TermosPage() {
  return (
    <article className="mx-auto max-w-[850px] px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl">TERMOS E CONDIÇÕES</h1>
        <p className="mt-4 text-sm text-muted-foreground">HYBRID HUB | TRAIN • CONNECT • COMPETE</p>
        <div className="mt-8 h-px w-24 bg-primary" aria-hidden="true" />
      </header>

      <div className="mt-12 space-y-12">
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="text-lg font-bold uppercase tracking-normal md:text-xl">
              <span className="mr-2 text-primary">{String(i + 1).padStart(2, "0")} —</span>
              {s.heading}
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              {s.body.map((b, j) =>
                typeof b === "string" ? (
                  <p key={j}>{b}</p>
                ) : (
                  <ul key={j} className="list-disc space-y-1 pl-6 marker:text-primary">
                    {b.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <Link to="/" className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          ← Voltar ao início
        </Link>
      </div>
    </article>
  );
}
