import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos — Hybrid Hub" },
      { name: "description", content: "Fala com a equipa Hybrid Hub." },
      { property: "og:title", content: "Contactos — Hybrid Hub" },
      { property: "og:description", content: "Fala com a equipa Hybrid Hub." },
    ],
  }),
  component: Contactos,
});

// Preencher com os contactos oficiais quando disponíveis.
const contacts: { label: string; value: string; href?: string }[] = [];

function Contactos() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <p className="eyebrow">Contactos</p>
      <h1 className="mt-6 text-5xl md:text-8xl">VAMOS FALAR.</h1>
      <p className="mt-6 max-w-xl text-muted-foreground md:text-lg">
        Queres colaborar, sugerir uma comunidade ou saber mais sobre a Hybrid Hub? Os nossos contactos oficiais serão publicados em breve.
      </p>
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {contacts.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-8 text-muted-foreground">
            Contactos oficiais — em breve.
          </div>
        ) : (
          contacts.map((c) => (
            <div key={c.label} className="border-t border-primary pt-6">
              <span className="eyebrow">{c.label}</span>
              {c.href ? <a href={c.href} className="mt-3 block text-xl">{c.value}</a> : <p className="mt-3 text-xl">{c.value}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
