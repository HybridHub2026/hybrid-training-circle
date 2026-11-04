import { Link } from "@tanstack/react-router";
import { Users, Dumbbell, Trophy, Globe2, UserCheck, Smartphone, ArrowRight } from "lucide-react";
import hero from "@/assets/hero-run.jpg";
import train from "@/assets/train-together.jpg";
import merch from "@/assets/merch.jpg";

const wrap = "mx-auto max-w-7xl px-5 md:px-10";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <img src={hero} alt="Pessoas de diferentes idades a correr juntas na cidade" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/65" />
      <div className={`relative w-full pb-16 pt-28 ${wrap}`}>
        <h1 className="text-6xl sm:text-7xl md:text-9xl">
          TRAIN<br /><span className="text-primary">CONNECT</span><br />COMPETE.
        </h1>
        <p className="mt-8 max-w-xl text-lg font-medium md:text-xl">
          O desporto aproxima pessoas. A Hybrid Hub ajuda-as a encontrar-se.
        </p>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Encontra parceiros, descobre treinos, explora provas e faz parte de uma comunidade que partilha a tua paixão pelo desporto.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link to="/app" className="btn-primary">Descobre a Hybrid Hub <ArrowRight size={16} /></Link>
          <Link to="/como-funciona" className="btn-ghost">Como funciona</Link>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className={`grid gap-12 py-24 md:grid-cols-2 md:items-center md:gap-20 md:py-40 ${wrap}`}>
      <img src={train} alt="Duas pessoas a treinar juntas" loading="lazy" width={1280} height={1600} className="aspect-[4/5] w-full rounded-sm object-cover" />
      <div>
        <p className="eyebrow">Sobre a Hybrid Hub</p>
        <h2 className="mt-6 text-4xl md:text-6xl">MAIS DO QUE <span className="text-primary">TREINAR.</span></h2>
        <p className="mt-8 text-muted-foreground md:text-lg">
          Nem sempre é fácil encontrar alguém com quem treinar ou participar numa prova. A Hybrid Hub nasceu para aproximar pessoas que partilham interesses, objetivos e a vontade de praticar desporto.
        </p>
        <p className="mt-6 text-muted-foreground md:text-lg">
          Não organizamos todos os treinos nem todos os eventos — ajudamos-te a encontrar as pessoas e as oportunidades certas.
        </p>
      </div>
    </section>
  );
}

const features = [
  { icon: Users, title: "ENCONTRA PARCEIROS", text: "Descobre pessoas com quem partilhar treinos e desafios." },
  { icon: Dumbbell, title: "DESCOBRE TREINOS", text: "Explora oportunidades criadas por outros membros ou cria a tua." },
  { icon: Trophy, title: "ENCONTRA PROVAS", text: "Descobre eventos desportivos e procura parceiros para participar." },
  { icon: Globe2, title: "EXPLORA COMUNIDADES", text: "Conhece pessoas e integra comunidades com interesses semelhantes." },
  { icon: UserCheck, title: "ENCONTRA COACHES", text: "Descobre profissionais de exercício físico que podem ajudar-te a evoluir." },
];

export function Features() {
  return (
    <section className="bg-muted">
      <div className={`py-24 md:py-32 ${wrap}`}>
        <p className="eyebrow">Funcionalidades</p>
        <h2 className="mt-6 max-w-3xl text-4xl md:text-6xl">UM HUB. <span className="text-primary">MUITAS POSSIBILIDADES.</span></h2>
        <ul className="mt-16 divide-y divide-border border-y border-border">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="grid gap-3 py-8 md:grid-cols-[3rem_1fr_1.2fr] md:items-center md:gap-10">
              <Icon className="text-primary" size={28} strokeWidth={1.5} />
              <h3 className="text-xl md:text-2xl">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PhoneSlot({ label }: { label: string }) {
  // Substituir por <img src=... /> com a captura real da app.
  return (
    <div className="mx-auto w-56 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[260px]">
      <div className="flex aspect-[9/19] flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-border text-center text-muted-foreground">
        <Smartphone size={26} />
        <span className="px-6 text-xs font-medium uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}

const steps = [
  { n: "01", title: "EXPLORA", text: "Descobre oportunidades de treino, provas e comunidades." },
  { n: "02", title: "LIGA-TE", text: "Encontra pessoas com interesses semelhantes e combina a tua próxima atividade." },
  { n: "03", title: "TREINA", text: "Participa, conhece pessoas e partilha a experiência." },
];

export function HowItWorks() {
  return (
    <section className={`py-24 md:py-40 ${wrap}`}>
      <p className="eyebrow">Como funciona</p>
      <h2 className="mt-6 text-4xl md:text-6xl">EXPLORA. <span className="text-primary">LIGA-TE.</span> TREINA.</h2>
      <div className="mt-16 grid gap-16 md:grid-cols-3 md:gap-10">
        {steps.map((s) => (
          <div key={s.n} className="border-t border-primary pt-8">
            <span className="text-5xl font-extrabold text-primary">{s.n}</span>
            <h3 className="mt-4 text-3xl">{s.title}</h3>
            <p className="mt-3 text-muted-foreground">{s.text}</p>
            <div className="mt-10"><PhoneSlot label={`Ecrã — ${s.title.toLowerCase()}`} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Community() {
  return (
    <section className="bg-muted">
      <div className={`py-24 md:py-40 ${wrap}`}>
        <p className="eyebrow">Comunidade</p>
        <h2 className="mt-6 text-5xl md:text-8xl">HÁ ESPAÇO <span className="text-primary">PARA TI.</span></h2>
        <p className="mt-8 max-w-2xl text-muted-foreground md:text-lg">
          Se estás a começar a correr, se treinas regularmente ou se já participas em provas, a Hybrid Hub ajuda-te a encontrar pessoas com quem partilhar o caminho.
        </p>
        <div className="mt-16 grid gap-px bg-border sm:grid-cols-3">
          {["A COMEÇAR", "A TREINAR", "A COMPETIR"].map((l) => (
            <div key={l} className="bg-muted py-6 sm:px-6">
              <span className="text-2xl font-extrabold">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppShowcase() {
  return (
    <section className={`py-24 md:py-40 ${wrap}`}>
      <div className="max-w-2xl">
        <p className="eyebrow">A app</p>
        <h2 className="mt-6 text-4xl md:text-6xl">TUDO COMEÇA COM UMA <span className="text-primary">LIGAÇÃO.</span></h2>
        <p className="mt-6 text-muted-foreground md:text-lg">
          Encontra oportunidades, descobre pessoas e mantém-te ligado ao desporto.
        </p>
      </div>
      <div className="mt-16 flex snap-x gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
        {[1, 2, 3].map((i) => <PhoneSlot key={i} label={`Captura de ecrã ${i}`} />)}
      </div>
      {/* Espaço para os botões oficiais das lojas, quando a app estiver disponível. */}
      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        {["App Store", "Google Play"].map((s) => (
          <div key={s} className="flex h-14 w-full items-center justify-center rounded-sm border border-dashed border-border text-xs font-medium uppercase tracking-widest text-muted-foreground sm:w-48">
            {s} — em breve
          </div>
        ))}
      </div>
    </section>
  );
}

const merchItems = ["Bucket hats reversíveis", "T-shirts oficiais", "Novos artigos"];

export function Shop() {
  return (
    <section className="bg-muted">
      <div className={`grid gap-12 py-24 md:grid-cols-2 md:items-center md:py-32 ${wrap}`}>
        <img src={merch} alt="Bucket hat e t-shirt Hybrid Hub" loading="lazy" width={1280} height={960} className="w-full rounded-sm object-cover" />
        <div>
          <p className="eyebrow">Loja</p>
          <h2 className="mt-6 text-4xl md:text-6xl">VESTE A <span className="text-primary">COMUNIDADE.</span></h2>
          <p className="mt-6 text-muted-foreground md:text-lg">A Hybrid Hub também se vive fora dos treinos.</p>
          <ul className="mt-8 space-y-2 text-sm">
            {merchItems.map((m) => <li key={m} className="flex gap-3"><span className="text-primary">—</span>{m}</li>)}
          </ul>
          <p className="mt-8 text-sm font-bold tracking-[0.25em] text-primary">EU NÃO TREINO SOZINHO.</p>
          <Link to="/loja" className="btn-ghost mt-8">Merch Hybrid Hub — em breve</Link>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className={`py-24 text-center md:py-40 ${wrap}`}>
      <h2 className="mx-auto max-w-5xl text-4xl md:text-7xl">A PRÓXIMA LIGAÇÃO <span className="text-primary">COMEÇA AQUI.</span></h2>
      <p className="mt-6 text-muted-foreground md:text-lg">Descobre novas pessoas, novos treinos e novas oportunidades.</p>
      <Link to="/app" className="btn-primary mt-12">Descobre a app</Link>
    </section>
  );
}

export function PageTop({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={`pt-32 md:pt-40 ${wrap}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 text-5xl md:text-8xl">{title}</h1>
    </div>
  );
}
