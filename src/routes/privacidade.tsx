import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Hybrid Hub" },
      { name: "description", content: "Política de Privacidade da Hybrid Hub." },
      { property: "og:title", content: "Política de Privacidade — Hybrid Hub" },
      { property: "og:description", content: "Política de Privacidade da Hybrid Hub." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://hybrid-training-circle.lovable.app/privacidade" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://hybrid-training-circle.lovable.app/privacidade" }],
  }),
  component: PrivacidadePage,
});

// Texto jurídico: inserir aqui as secções da Política de Privacidade
// (título + parágrafos), preservando integralmente a redação original.
const sections: { heading: string; body: string[] }[] = [];

function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl">POLÍTICA DE PRIVACIDADE</h1>
        <p className="mt-4 text-sm text-muted-foreground">Hybrid Hub | Train • Connect • Compete</p>
        <div className="mt-8 h-px w-24 bg-primary" aria-hidden="true" />
      </header>

      <div className="mt-12 space-y-12">
        {sections.length === 0 ? (
          <p className="leading-relaxed text-muted-foreground">
            O texto da Política de Privacidade será publicado em breve.
          </p>
        ) : (
          sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold normal-case tracking-normal md:text-2xl">{s.heading}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
          ← Voltar ao início
        </Link>
      </div>
    </article>
  );
}
