import { Link, Localized, T } from "@/i18n";

import { useState, type UIEvent } from "react";
import { LaunchNotice } from "./LaunchNotice";
import { Users, Dumbbell, Trophy, Ticket, Globe2, UserCheck, Smartphone, ArrowRight } from "lucide-react";
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
      <Localized as="img" src={hero} alt="Atleta a correr num evento de corrida ao ar livre" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/72 md:bg-background/60" />
        <div className={`relative w-full pb-8 pt-20 md:pb-16 md:pt-28 ${wrap}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-9xl"><T>{"TRAIN•"}</T><br /><span className="text-primary"><T>{"CONNECT•"}</T></span><br /><T>{"COMPETE"}</T></h1>
        <p className="mt-6 max-w-xl text-lg font-medium md:text-xl"><T>{"Encontra companhia para correr, treinar e preparar a tua próxima prova."}</T></p>
        <p className="mt-3 max-w-xl text-muted-foreground"><T>{"Para quem está a começar ou já treina. A app Hybrid Hub está em preparação para iOS e Android."}</T></p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Localized as="a" href="#aviso-lancamento" className="btn-primary"><T>{"Avisem-me no lançamento "}</T><ArrowRight size={16} /></Localized>
          <Link to="/como-funciona" className="btn-ghost"><T>{"Como funciona"}</T></Link>
        </div>
      </div>
    </section>
  );
}

export function About({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`grid grid-cols-1 items-center gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-16 ${wrap} ${compact ? "md:py-14" : ""}`}>
      <Localized as="img" src={train} alt="Grupo de atletas a conversar junto ao mar ao pôr do sol" loading="lazy" width={1080} height={1350} className={`aspect-[4/5] w-full rounded-sm object-cover ${compact ? "max-w-[280px] md:max-w-[400px]" : "max-w-[320px] md:max-w-[440px]"}`} />
      <div>
        <p className="eyebrow"><T>{"Sobre a Hybrid Hub"}</T></p>
        <h2 className="mt-4 text-3xl md:text-5xl"><T>{"MAIS DO QUE "}</T><span className="text-primary"><T>{"TREINAR."}</T></span></h2>
        <p className="mt-6 text-muted-foreground md:text-lg"><T>{"Nem sempre é fácil encontrar alguém com quem treinar ou participar numa prova. A Hybrid Hub nasceu para aproximar pessoas que partilham interesses, objetivos e a vontade de praticar desporto."}</T></p>
        <p className="mt-4 text-muted-foreground md:text-lg"><T>{"Não organizamos todos os treinos nem todos os eventos — ajudamos-te a encontrar as pessoas e as oportunidades certas."}</T></p>
        <Link to="/sobre" className="btn-ghost mt-8"><T>{"Conhece a Hybrid Hub"}</T></Link>
      </div>
    </section>
  );
}

const features = [
  { icon: Users, title: "ENCONTRA PARCEIROS", text: "Descobre pessoas com quem partilhar treinos e desafios." },
  { icon: Dumbbell, title: "DESCOBRE TREINOS", text: "Explora oportunidades criadas por outros membros ou cria a tua." },
  { icon: Trophy, title: "ENCONTRA PROVAS", text: "Descobre eventos desportivos e procura parceiros para participar." },
  { icon: Ticket, title: "VENDE O TEU BILHETE", text: "Já não vais participar numa prova? Anuncia o teu bilhete na app e encontra alguém interessado." },
  { icon: Globe2, title: "EXPLORA COMUNIDADES", text: "Conhece pessoas e integra comunidades com interesses semelhantes." },
  { icon: UserCheck, title: "ENCONTRA COACHES", text: "Descobre profissionais de exercício físico que podem ajudar-te a evoluir." },
];

export function Features() {
  return (
    <section className="bg-muted">
      <div className={`py-8 md:py-16 ${wrap}`}>
        <p className="eyebrow"><T>{"Funcionalidades"}</T></p>
        <h2 className="mt-4 max-w-3xl text-3xl md:text-5xl"><T>{"UM HUB. "}</T><span className="text-primary"><T>{"MUITAS POSSIBILIDADES."}</T></span></h2>
        <ul className="mt-10 divide-y divide-border border-y border-border md:mt-12">
          <T>{features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-5 md:grid-cols-[3rem_1fr_1.2fr] md:gap-8 md:py-6">
              <Icon className="order-2 justify-self-end text-primary md:order-none md:justify-self-start" size={28} strokeWidth={1.5} />
              <h3 className="order-1 text-xl md:order-none md:text-2xl"><T>{title}</T></h3>
              <p className="order-3 col-span-2 text-muted-foreground md:order-none md:col-span-1"><T>{text}</T></p>
            </li>
          ))}</T>
        </ul>
      </div>
    </section>
  );
}

function PhoneSlot({ label, src }: { label: string; src?: string | undefined }) {
  if (src) {
    return (
      <div className="mx-auto w-56 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[220px]">
        <Localized as="img" src={src} alt={label} loading="lazy" width={864} height={1920} className="aspect-[9/19] w-full rounded-[2rem] object-cover" />
      </div>
    );
  }
  return (
    <div className="mx-auto w-56 shrink-0 snap-center rounded-[2.5rem] border-4 border-secondary bg-background p-2 md:w-full md:max-w-[220px]">
      <div className="flex aspect-[9/19] flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-border text-center text-muted-foreground">
        <Smartphone size={26} />
        <span className="px-6 text-xs font-medium uppercase tracking-widest"><T>{label}</T></span>
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
      if (Math.abs(card.offsetLeft - origin - track.scrollLeft) < Math.abs((cards[nearest]?.offsetLeft ?? origin) - origin - track.scrollLeft)) nearest = index;
    });
    setActiveStep(nearest);
  }
  return (
    <section className={`py-8 md:py-16 ${wrap}`}>
      <p className="eyebrow"><T>{"Como funciona"}</T></p>
      <Heading className="mt-4 text-3xl md:text-5xl"><T>{"EXPLORA. "}</T><span className="text-primary"><T>{"LIGA-TE."}</T></span><T>{" TREINA."}</T></Heading>
      <div className="mt-5 flex items-center justify-between gap-3 md:hidden">
        <p className="text-xs text-muted-foreground"><T>{"Desliza para ver os passos "}</T><span aria-hidden="true"><T>{"→"}</T></span></p>
        <p className="shrink-0 text-sm font-medium" role="status" aria-live="polite" aria-atomic="true"><T>{"Passo "}</T><T>{activeStep + 1}</T><T>{" de "}</T><T>{steps.length}</T></p>
      </div>
      <div className="mt-3 flex gap-2 md:hidden" aria-hidden="true">
        <T>{steps.map((s, index) => <span key={s.n} className={`h-1 flex-1 rounded-full ${index === activeStep ? "bg-primary" : "bg-border"}`} />)}</T>
      </div>
      <Localized as="div" onScroll={updateProgress} className="-mr-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pr-5 pb-4 md:mr-0 md:mt-12 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pr-0 md:pb-0" role="region" aria-label="Passos de como funciona" tabIndex={0}>
        <T>{steps.map((s) => (
          <div key={s.n} className="w-[78vw] max-w-80 flex-none snap-start border-t border-primary pt-6 md:w-auto md:max-w-none">
            <span className="text-5xl font-extrabold text-primary"><T>{s.n}</T></span>
            <h3 className="mt-4 text-3xl"><T>{s.title}</T></h3>
            <p className="mt-3 min-h-12 text-muted-foreground"><T>{s.text}</T></p>
            <div className="mt-6"><PhoneSlot label={`Ecrã — ${s.title.toLowerCase()}`} src={s.n === "01" ? exploreScreen : s.n === "02" ? ligateScreen : treinaScreen} /></div>
          </div>
        ))}</T>
      </Localized>
    </section>
  );
}

export function Community({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className="bg-muted">
      <div className={`py-8 md:py-20 ${wrap}`}>
        <p className="eyebrow"><T>{"Comunidade"}</T></p>
        <Heading className="mt-4 text-4xl md:text-6xl"><T>{"HÁ ESPAÇO "}</T><span className="text-primary"><T>{"PARA TI."}</T></span></Heading>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg"><T>{"Seja para correr, combinar corrida e força no treino híbrido ou preparar uma prova como HYROX, a Hybrid Hub aproxima pessoas com vontade de treinar em conjunto em Portugal."}</T></p>
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-3 md:mt-12">
          <T>{[
            { title: "A COMEÇAR", text: "Dá os primeiros passos com companhia e ganha confiança ao teu ritmo." },
            { title: "A TREINAR", text: "Partilha a rotina, mantém a motivação e encontra novos parceiros de treino." },
            { title: "A COMPETIR", text: "Encontra quem partilhe os teus objetivos e prepara a próxima prova em conjunto." },
          ].map(({ title, text }) => (
            <div key={title} className="bg-muted py-4 md:py-6 sm:px-6">
              <h3 className="text-2xl font-extrabold"><T>{title}</T></h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base"><T>{text}</T></p>
            </div>
          ))}</T>
        </div>
        <T>{headingLevel === 2 && (
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/comunidade" className="btn-ghost"><T>{"Explora a comunidade "}</T><ArrowRight size={16} /></Link>
            <Link to="/parceiros-de-treino" className="btn-ghost"><T>{"Como encontrar parceiros"}</T></Link>
          </div>
        )}</T>
      </div>
    </section>
  );
}

export function AppShowcase({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className={`py-8 md:py-10 ${wrap}`}>
      <div className="max-w-2xl">
        <p className="eyebrow"><T>{"A app"}</T></p>
        <Heading className="mt-4 text-3xl md:text-5xl"><T>{"TUDO COMEÇA COM UMA "}</T><span className="text-primary"><T>{"LIGAÇÃO."}</T></span></Heading>
        <p className="mt-6 text-muted-foreground md:text-lg"><T>{"Encontra oportunidades, descobre pessoas e mantém-te ligado ao desporto."}</T></p>
        <p className="mt-4 text-sm text-muted-foreground"><T>{"A app está em preparação para iOS e Android."}</T></p>
        <Localized as="a" href="#aviso-lancamento" className="btn-primary mt-5"><T>{"Avisem-me no lançamento "}</T><ArrowRight size={16} /></Localized>
      </div>
      <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-4 md:mt-8 md:grid md:grid-cols-3 md:overflow-visible">
        <T>{[
          { src: appScreen1, label: "Ecrã de boas-vindas da app Hybrid Hub com opções para entrar ou explorar como convidado" },
          { src: appScreen2, label: "Ecrã da app Hybrid Hub com opções para criar uma oportunidade ou encontrar parceiro, prova e coach" },
          { src: appScreen3, label: "Formulário Criar Oportunidade da app Hybrid Hub, com treino híbrido selecionado e campos de descrição e local" },
        ].map(({ src, label }) => (
          <PhoneSlot key={src} label={label} src={src} />
        ))}</T>
      </div>
      {/* Espaço para os botões oficiais das lojas, quando a app estiver disponível. */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 md:mt-6">
        <T>{["App Store", "Google Play"].map((s) => (
          <div key={s} className="flex h-12 min-w-0 items-center justify-center whitespace-nowrap rounded-sm border border-dashed border-border px-1 text-[10px] font-medium uppercase text-muted-foreground sm:h-14 sm:w-48 sm:px-0 sm:text-xs sm:tracking-widest">
            <T>{s}</T><T>{" — em breve"}</T></div>
        ))}</T>
      </div>
    </section>
  );
}

const merchItems = ["Bucket hats reversíveis", "T-shirts oficiais", "Hoodies oficiais"];

export function Shop() {
  return (
    <section className="bg-muted">
      <div className={`grid gap-8 py-8 md:grid-cols-2 md:items-center md:gap-12 md:py-16 ${wrap}`}>
        <Localized as="img" src={merch} alt="Sweatshirt e bucket hat Hybrid Hub — em breve" loading="lazy" width={1024} height={768} className="w-full rounded-sm object-cover" />
        <div>
          <p className="eyebrow"><T>{"Loja"}</T></p>
          <h2 className="mt-6 text-3xl md:text-5xl"><T>{"VESTE A "}</T><span className="text-primary"><T>{"COMUNIDADE."}</T></span></h2>
          <p className="mt-6 text-muted-foreground md:text-lg"><T>{"A Hybrid Hub também se vive fora dos treinos."}</T></p>
          <ul className="mt-8 space-y-2 text-sm">
            <T>{merchItems.map((m) => <li key={m} className="flex gap-3"><span className="text-primary"><T>{"—"}</T></span><T>{m}</T></li>)}</T>
          </ul>
          <p className="mt-8 text-sm font-bold tracking-[0.25em] text-primary"><T>{"EU NÃO TREINO SOZINHO."}</T></p>
          <Link to="/loja" className="btn-ghost mt-8"><T>{"Merch Hybrid Hub — em breve"}</T></Link>
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
      <p className="eyebrow"><T>{eyebrow}</T></p>
      <h1 className="mt-6 text-5xl md:text-8xl"><T>{title}</T></h1>
    </div>
  );
}
