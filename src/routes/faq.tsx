import { createFileRoute, Link } from "@tanstack/react-router";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — Hybrid Hub" },
      { name: "description", content: "Respostas às perguntas sobre a Hybrid Hub: conta, parceiros de treino, provas, comunidades, coaches e segurança." },
      { property: "og:title", content: "FAQ — Hybrid Hub" },
      { property: "og:description", content: "Tudo o que precisas de saber sobre a aplicação e a comunidade Hybrid Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <header className="mb-14 md:mb-20">
        <h1 className="text-3xl leading-tight tracking-normal sm:text-5xl lg:text-6xl">
          PERGUNTAS<br /><span className="text-primary">FREQUENTES.</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">Tudo o que precisas de saber sobre a Hybrid Hub.</p>
      </header>
      <FaqAccordion />
      <div className="mt-20 border-t border-border pt-12">
        <h2 className="text-xl leading-tight tracking-normal md:text-2xl">NÃO ENCONTRASTE A TUA RESPOSTA?</h2>
        <p className="mt-4 text-muted-foreground">Estamos disponíveis para ajudar.</p>
        <Button asChild size="lg" className="mt-7 h-auto px-7 py-4 font-semibold">
          <Link to="/contactos">FALA CONNOSCO</Link>
        </Button>
      </div>
    </section>
  ),
});
