import { Link } from "@tanstack/react-router";
import { useState, type UIEvent } from "react";
import { LaunchNotice } from "./LaunchNotice";
import { Users, Dumbbell, Trophy, Globe2, UserCheck, Smartphone, ArrowRight } from "lucide-react";
import hero from "@/assets/glimpse-hybrid-leiria-runner.jpg";
import train from "@/assets/hybrid-hub-community-sunset.png";
import appScreen1 from "@/assets/app-ecra-1.jpg";
import appScreen2 from "@/assets/app-ecra-2.png";
import appScreen3 from "@/assets/app-ecra-3.png";
import exploreScreen from "@/assets/app-explorar-foz.png";
import ligateScreen from "@/assets/app-ligate.png";
import treinaScreen from "@/assets/treino-lisboa-03.png";
import merch from "@/assets/hybrid-hub-em-breve.png";

const wrap = "mx-auto max-w-7xl px-5 md:px-10";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <img src={hero} alt="Atleta a correr num evento de corrida ao ar livre" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/72 md:bg-background/60" />
        <div className={`relative w-full pb-8 pt-20 md:pb-16 md:pt-28 ${wrap}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-9xl">
          TRAIN•<br /><span className="text-primary">CONNECT•</span><br />COMPETE
        </h1>
        <p className="mt-6 max-w-xl text-lg font-medium md:text-xl">
          Encontra companhia para correr, treinar e preparar a tua próxima prova.
        </p>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Para quem está a começar ou já treina. A app Hybrid Hub está em preparação para iOS e Android.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a href="#aviso-lancamento" className="btn-primary">Avisem-me no lançamento <ArrowRight size={16} /></a>
          <Link to="/como-funciona" className="btn-ghost">Como funciona</Link>
        </div>
      </div>
    </section>
  );
}

export function About({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-2 md:gap-12 md:py-20 ${wrap} ${compact ? "md:py-16" : ""}`}>
      <img src={train} alt="Grupo de atletas a conversar junto ao mar ao pôr do sol" loading="lazy" width={1080} height={1350} className={`aspect-[4/5] w-full rounded-sm object-cover ${compact ? "max-w-[280px] md:max-w-[400px]" : "max-w-[320px] md:max-w-[440px]"}`} />
      <div>
        <p className="eyebrow">Sobre a Hybrid Hub</p>
        <h2 className="mt-4 text-3xl md:text-5xl">MAIS DO QUE <span className="text-primary">TREINAR.</span></h2>
        <p className="mt-6 text-muted-foreground md:text-lg">
          Nem sempre é fácil encontrar alguém com quem treinar ou participar numa prova. A Hybrid Hub nasceu para aproximar pessoas que partilham interesses, objetivos e a vontade de praticar desporto.
        </p>
        <p className="mt-4 text-muted-foreground md:text-lg">
          Não organizamos todos os treinos nem todos os eventos — ajudamos-te a encontrar as pessoas e as oportunidades certas.
        </p>
        <Link to="/app" className="btn-ghost mt-6">Conhece as funcionalidades da app <ArrowRight size={16} /></Link>
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
      <div className={`py-10 md:py-20 ${wrap}`}>
        <p className="eyebrow">Funcionalidades</p>
        <h2 className="mt-4 max-w-3xl text-3xl md:text-5xl">UM HUB. <span className="text-primary">MUITAS POSSIBILIDADES.</span></h2>
        <ul className="mt-10 divide-y divide-border border-y border-border md:mt-12">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-5 md:grid-cols-[3rem_1fr_1.2fr] md:gap-8 md:py-6">
              <Icon className="order-2 justify-self-end text-primary md:order-none md:justify-self-start" size={28} strokeWidth={1.5} />
              <h3 className="order-1 text-xl md:order-none md:text-2xl">{title}</h3>
              <p className="order-3 col-span-2 text-muted-foreground md:order-none md:col-span-1">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PhoneSlot({ label, src }: { label: string; src?: string | undefined }) {
  if (src) {
    return (
      <div className="mx-auto w-56 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[220px]">
        <img src={src} alt={label} loading="lazy" width={864} height={1920} className="aspect-[9/19] w-full rounded-[2rem] object-cover" />
      </div>
    );
  }
  return (
    <div className="mx-auto w-56 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[220px]">
      <div className="flex aspect-[9/19] flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-border text-center text-muted-foreground">
        <Smartphone size={26} />
        <span className="px-6 text-xs font-medium uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}

const steps = [
  { n: "01", title: "EXPLORA", text: "Descobre treinos e provas na tua zona." },
  { n: "02", title: "LIGA-TE", text: "Encontra pessoas com objetivos e horários compatíveis." },
  { n: "03", title: "TREINA", text: "Combina o local e a hora, e treina em companhia." },
];

export function HowItWorks({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const [activeStep, setActiveStep] = useState(0);
  function updateProgress(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    const cards = Array.from(track.children) as HTMLElement[];
    const origin = cards[0]?.offsetLeft ?? 0;
    let nearest = 0;
    cards.forEach((card, index) => {
      if (Math.abs(card.offsetLeft - origin - track.scrollLeft) < Math.abs(cards[nearest].offsetLeft - origin - track.scrollLeft)) nearest = index;
    });
    setActiveStep(nearest);
  }
  return (
    <section className={`py-10 md:py-20 ${wrap}`}>
      <p className="eyebrow">Como funciona</p>
      <Heading className="mt-4 text-3xl md:text-5xl">EXPLORA. <span className="text-primary">LIGA-TE.</span> TREINA.</Heading>
      <div className="mt-5 flex items-center justify-between gap-3 md:hidden">
        <p className="text-xs text-muted-foreground">Desliza para ver os passos <span aria-hidden="true">→</span></p>
        <p className="shrink-0 text-sm font-medium" role="status" aria-live="polite" aria-atomic="true">Passo {activeStep + 1} de {steps.length}</p>
      </div>
      <div className="mt-3 flex gap-2 md:hidden" aria-hidden="true">
        {steps.map((s, index) => <span key={s.n} className={`h-1 flex-1 rounded-full ${index === activeStep ? "bg-primary" : "bg-border"}`} />)}
      </div>
      <div onScroll={updateProgress} className="-mr-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pr-5 pb-4 md:mr-0 md:mt-12 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pr-0 md:pb-0" role="region" aria-label="Passos de como funciona" tabIndex={0}>
        {steps.map((s) => (
          <div key={s.n} className="w-[78vw] max-w-80 flex-none snap-start border-t border-primary pt-6 md:w-auto md:max-w-none">
            <span className="text-5xl font-extrabold text-primary">{s.n}</span>
            <h3 className="mt-4 text-3xl">{s.title}</h3>
            <p className="mt-3 min-h-12 text-muted-foreground">{s.text}</p>
            <div className="mt-6"><PhoneSlot label={`Ecrã — ${s.title.toLowerCase()}`} src={s.n === "01" ? exploreScreen : s.n === "02" ? ligateScreen : treinaScreen} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Community({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className="bg-muted">
      <div className={`py-10 md:py-24 ${wrap}`}>
        <p className="eyebrow">Comunidade</p>
        <Heading className="mt-4 text-4xl md:text-6xl">O TEU DESPORTO. <span className="text-primary">A TUA GENTE.</span></Heading>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Do primeiro quilómetro ao próximo desafio, descobre como podes fazer parte da comunidade de corrida e treino híbrido em Portugal.
        </p>
        {headingLevel === 2 && (
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/comunidade" className="btn-ghost">Explora a comunidade <ArrowRight size={16} /></Link>
            <Link to="/parceiros-de-treino" className="btn-ghost">Como encontrar parceiros</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function AppShowcase({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className={`py-10 md:py-12 ${wrap}`}>
      <div className="max-w-2xl">
        <p className="eyebrow">A app</p>
        <Heading className="mt-4 text-3xl md:text-5xl">TUDO COMEÇA COM UMA <span className="text-primary">LIGAÇÃO.</span></Heading>
        <p className="mt-6 text-muted-foreground md:text-lg">
          Explora oportunidades por modalidade, localização, horário e nível de experiência, ou cria uma oportunidade com os detalhes do teu treino.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">A app está em preparação para iOS e Android.</p>
        <a href="#aviso-lancamento" className="btn-primary mt-5">Avisem-me no lançamento <ArrowRight size={16} /></a>
      </div>
      <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-4 md:mt-8 md:grid md:grid-cols-3 md:overflow-visible">
        {[1, 2, 3].map((i) => (
          <PhoneSlot key={i} label={i === 1 ? "Ecrã de boas-vindas da app Hybrid Hub" : `Captura de ecrã ${i}`} src={i === 1 ? appScreen1 : i === 2 ? appScreen2 : appScreen3} />
        ))}
      </div>
      {/* Espaço para os botões oficiais das lojas, quando a app estiver disponível. */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 md:mt-6">
        {["App Store", "Google Play"].map((s) => (
          <div key={s} className="flex h-12 min-w-0 items-center justify-center whitespace-nowrap rounded-sm border border-dashed border-border px-1 text-[10px] font-medium uppercase text-muted-foreground sm:h-14 sm:w-48 sm:px-0 sm:text-xs sm:tracking-widest">
            {s} — em breve
          </div>
        ))}
      </div>
    </section>
  );
}

const merchItems = ["Bucket hats reversíveis", "T-shirts oficiais", "Hoodies oficiais"];

export function Shop() {
  return (
    <section className="bg-muted">
      <div className={`grid gap-8 py-10 md:grid-cols-2 md:items-center md:gap-12 md:py-20 ${wrap}`}>
        <img src={merch} alt="Sweatshirt e bucket hat Hybrid Hub — em breve" loading="lazy" width={1024} height={768} className="w-full rounded-sm object-cover" />
        <div>
          <p className="eyebrow">Loja</p>
          <h2 className="mt-6 text-3xl md:text-5xl">VESTE A <span className="text-primary">COMUNIDADE.</span></h2>
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
  return <LaunchNotice />;
}

export function PageTop({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={`pt-32 md:pt-40 ${wrap}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 text-5xl md:text-8xl">{title}</h1>
    </div>
  );
}
