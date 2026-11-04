import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Dumbbell, Trophy, Globe2, Whistle, Smartphone, ArrowRight } from "lucide-react";
import hero from "@/assets/hero-run.jpg";
import train from "@/assets/train-together.jpg";
import merch from "@/assets/merch.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hybrid Hub — Train • Connect • Compete" },
      { name: "description", content: "A Hybrid Hub liga pessoas através do desporto: parceiros de treino, treinos, provas, comunidades e coaches de treino híbrido, HYROX e corrida." },
      { property: "og:title", content: "Hybrid Hub — Train • Connect • Compete" },
      { property: "og:description", content: "Treinar é bom. Treinar ligado é melhor. O desporto liga pessoas, seja qual for o teu nível." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Users, title: "Encontrar parceiros", text: "Liga-te a pessoas com objetivos e ritmos parecidos aos teus." },
  { icon: Dumbbell, title: "Descobrir treinos", text: "Explora oportunidades de treino perto de ti." },
  { icon: Trophy, title: "Encontrar provas", text: "Procura provas de corrida, HYROX e treino híbrido." },
  { icon: Globe2, title: "Comunidades", text: "Junta-te a grupos que partilham a mesma paixão." },
  { icon: Whistle, title: "Coaches", text: "Descobre coaches que te ajudam a evoluir." },
];

const steps = [
  { n: "01", title: "Explora", text: "Descobre treinos, provas, comunidades e coaches à tua volta." },
  { n: "02", title: "Liga-te", text: "Encontra pessoas que treinam como tu — ou que te desafiam a ir mais longe." },
  { n: "03", title: "Treina", text: "Aparece, partilha o esforço e faz do desporto um ponto de encontro." },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <img src={hero} alt="Grupo de pessoas a correr juntas na cidade" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-fade" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-10 md:pb-24">
          <p className="eyebrow">TRAIN • CONNECT • COMPETE</p>
          <h1 className="mt-6 max-w-5xl text-5xl sm:text-6xl md:text-8xl">
            TREINAR É BOM. <span className="text-primary">TREINAR LIGADO É MELHOR.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            A aplicação portuguesa que liga pessoas através do desporto — seja qual for o teu nível.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#app" className="btn-primary">Conhecer a app <ArrowRight size={16} /></a>
            <a href="#missao" className="btn-ghost">A nossa missão</a>
          </div>
        </div>
      </section>

      {/* MISSÃO */}
      <section id="missao" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center md:gap-20 md:px-10 md:py-40">
        <img src={train} alt="Duas pessoas a treinar juntas" loading="lazy" width={1280} height={1600} className="aspect-[4/5] w-full rounded-sm object-cover" />
        <div>
          <p className="eyebrow">A Hybrid Hub</p>
          <h2 className="mt-6 text-4xl md:text-6xl">O DESPORTO LIGA PESSOAS.</h2>
          <p className="mt-8 text-muted-foreground md:text-lg">
            A Hybrid Hub nasceu em Portugal com uma ideia simples: ninguém devia treinar sozinho se não quiser.
            Do primeiro quilómetro à próxima prova de HYROX, queremos aproximar quem partilha o gosto pelo movimento.
          </p>
          <p className="mt-6 text-muted-foreground md:text-lg">
            A nossa missão é criar uma comunidade inclusiva, onde iniciantes e atletas experientes se encontram,
            se motivam e crescem juntos. A competição é bem-vinda — mas a ligação vem primeiro.
          </p>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="border-y border-border bg-muted">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <p className="eyebrow">Funcionalidades</p>
          <h2 className="mt-6 max-w-3xl text-4xl md:text-6xl">TUDO O QUE PRECISAS PARA TREINAR LIGADO.</h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-border sm:grid-cols-2 lg:grid-cols-5">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group bg-background p-8 transition-colors hover:bg-card">
                <Icon className="text-primary" size={32} strokeWidth={1.5} />
                <h3 className="mt-8 font-sans text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-40">
        <p className="eyebrow">Como funciona</p>
        <h2 className="mt-6 text-4xl md:text-6xl">TRÊS PASSOS.</h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-primary pt-8">
              <span className="font-display text-6xl text-primary">{s.n}</span>
              <h3 className="mt-6 text-4xl">{s.title.toUpperCase()}</h3>
              <p className="mt-4 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APP */}
      <section id="app" className="border-y border-border bg-muted">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <div className="max-w-2xl">
            <p className="eyebrow">A app</p>
            <h2 className="mt-6 text-4xl md:text-6xl">O TEU HUB DE TREINO, NO BOLSO.</h2>
            <p className="mt-6 text-muted-foreground md:text-lg">
              A aplicação Hybrid Hub reúne parceiros, treinos, provas, comunidades e coaches num só lugar.
              Mais informações sobre a disponibilidade serão partilhadas em breve.
            </p>
          </div>
          {/* Espaço para capturas reais: substituir cada moldura por <img src=... /> */}
          <div className="mt-16 flex snap-x gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mx-auto w-64 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[280px]">
                <div className="flex aspect-[9/19] flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-border text-center text-muted-foreground">
                  <Smartphone size={28} />
                  <span className="px-6 text-xs uppercase tracking-widest">Captura de ecrã {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOJA */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center md:px-10 md:py-40">
        <div className="relative">
          <img src={merch} alt="Bucket hat e t-shirt Hybrid Hub" loading="lazy" width={1280} height={960} className="w-full rounded-sm object-cover" />
          <span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">Em breve</span>
        </div>
        <div>
          <p className="eyebrow">Loja Hybrid Hub</p>
          <h2 className="mt-6 text-4xl md:text-6xl">VESTE A COMUNIDADE.</h2>
          <p className="mt-6 text-muted-foreground md:text-lg">
            Bucket hats e t-shirts Hybrid Hub, pensados para treinar e para o dia a dia. A loja está a caminho.
          </p>
          <Link to="/loja" className="btn-ghost mt-10">Saber mais</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-24 text-center md:px-10 md:py-32">
          <h2 className="text-4xl md:text-7xl">INDEPENDENTEMENTE DO TEU NÍVEL, <span className="text-primary">HÁ LUGAR PARA TI.</span></h2>
          <Link to="/contactos" className="btn-primary mt-12">Fala connosco</Link>
        </div>
      </section>
    </>
  );
}
