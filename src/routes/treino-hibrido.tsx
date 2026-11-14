import { languageAlternates } from "@/i18n/language";
import { Link, T } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/treino-hibrido")({
  head: () => ({
    meta: [
      { title: "Treino híbrido: o que é e como começar | Hybrid Hub" },
      { name: "description", content: "Percebe o que é o treino híbrido, como combinar corrida e força e o que considerar antes de treinar com outras pessoas ou preparar uma prova como HYROX." },
      { property: "og:title", content: "Treino híbrido: o que é e como começar | Hybrid Hub" },
      { property: "og:description", content: "Um guia simples para combinar corrida e força e encontrar companhia para treinar." },
    ],
    links: [...languageAlternates("/treino-hibrido"), { rel: "canonical", href: "https://hybridhub.pt/treino-hibrido" }],
  }),
  component: HybridTrainingGuide,
});

export function HybridTrainingGuide() {
  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <header className="max-w-3xl">
        <p className="eyebrow"><T>{"Guia de treino"}</T></p>
        <h1 className="mt-5 text-4xl md:text-6xl"><T>{"TREINO HÍBRIDO:"}</T>{" "}<span className="text-primary"><T>{"O QUE É E COMO COMEÇAR"}</T></span></h1>
        <p className="mt-6 text-muted-foreground md:text-lg"><T>{"Treino híbrido é uma forma de combinar corrida ou outro trabalho de resistência com exercícios de força. Pode servir para variar a rotina, desenvolver capacidades diferentes ou preparar uma prova. O ponto de partida é perceber o teu objetivo e adaptar as sessões à tua experiência."}</T></p>
        <p className="mt-5 text-sm text-muted-foreground"><T>{"Guia editorial da Hybrid Hub. Conhece o fundador, Tiago Passos, personal trainer há mais de 15 anos, na página"}</T>{" "}<Link to="/sobre" className="text-primary underline underline-offset-4"><T>{"Sobre a Hybrid Hub"}</T></Link>.</p>
      </header>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"COMO COMEÇAR"}</T></h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          <li><h3 className="text-xl text-primary"><T>{"01. Define o objetivo"}</T></h3><p className="mt-3 text-muted-foreground"><T>{"Queres começar a correr, ganhar força, treinar com companhia ou preparar uma prova? Um objetivo claro ajuda-te a escolher sessões adequadas e a explicar o que procuras a outras pessoas."}</T></p></li>
          <li><h3 className="text-xl text-primary"><T>{"02. Combina modalidades com critério"}</T></h3><p className="mt-3 text-muted-foreground"><T>{"Alternar corrida e exercícios de força é uma forma simples de experimentar. Ajusta a duração, a intensidade e a recuperação ao teu nível; se tiveres dúvidas sobre limitações físicas, procura orientação profissional individual."}</T></p></li>
          <li><h3 className="text-xl text-primary"><T>{"03. Acerta expectativas com quem treina contigo"}</T></h3><p className="mt-3 text-muted-foreground"><T>{"Antes de marcar uma sessão, combina ritmo, exercícios, equipamento, local e horário. Não precisam de ter o mesmo nível, mas todos devem saber o que vai acontecer."}</T></p></li>
        </ol>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"TREINO HÍBRIDO E HYROX"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"Treino híbrido é uma expressão ampla; HYROX é uma prova com formato próprio que combina corrida e estações de exercícios funcionais. Se tens uma prova em vista, confirma sempre o formato, as regras e as inscrições nos canais oficiais da organização."}</T></p>
        <a href="https://hyrox.com/the-fitness-race/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-primary underline underline-offset-4"><T>{"Conhece o formato oficial de HYROX"}</T></a>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-3xl md:text-4xl"><T>{"TREINAR COM OUTRAS PESSOAS"}</T></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"Ter companhia pode ajudar-te a manter uma rotina e a partilhar objetivos. A Hybrid Hub foi criada para aproximar pessoas interessadas em corrida, treino híbrido e provas. A app para iOS e Android está em preparação; as futuras oportunidades de treino dependerão das atividades criadas pelos membros em cada zona."}</T></p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/parceiros-de-treino" className="btn-primary"><T>{"Como encontrar parceiros de treino"}</T></Link>
          <Link to="/comunidade" className="btn-ghost"><T>{"Conhece a comunidade"}</T></Link>
        </div>
      </section>
    </article>
  );
}
