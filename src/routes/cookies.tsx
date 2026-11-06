import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — Hybrid Hub" },
      { name: "description", content: "Política de Cookies do website Hybrid Hub." },
      { property: "og:title", content: "Política de Cookies — Hybrid Hub" },
      { property: "og:description", content: "Política de Cookies do website Hybrid Hub." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CookiesPage,
});

// Restantes secções aguardam o texto completo enviado pela Hybrid Hub.
const sections: { heading: string; body: string[] }[] = [
  {
    heading: "O que são cookies?",
    body: [
      "Os cookies são pequenos ficheiros ou informações armazenadas no dispositivo do visitante (computador, telemóvel ou tablet) durante a navegação num website.",
      "Os cookies podem permitir o funcionamento técnico do website, guardar as preferências do visitante ou, quando utilizados e autorizados, recolher informações estatísticas sobre a forma como o website é utilizado.",
    ],
  },
];

function CookiesPage() {
  return (
    <article className="mx-auto max-w-[850px] px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl">POLÍTICA DE COOKIES</h1>
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
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
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
