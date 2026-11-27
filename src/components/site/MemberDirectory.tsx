import { Dumbbell, Users, ArrowRight } from "lucide-react";
import { Link, T, useLanguage } from "@/i18n";
import { ProfileCard } from "./ProfileCard";
import type { MemberProfile } from "./member-profiles";

export function MemberDirectory({
  memberProfiles,
  preview = false,
}: {
  memberProfiles: MemberProfile[];
  preview?: boolean;
}) {
  const language = useLanguage();
  return (
    <div className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-10 md:pb-20 md:pt-36">
      <section className="max-w-3xl">
        <p className="eyebrow">
          <T>{"Pessoas e projetos"}</T>
        </p>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl">
          <T>{"QUEM JÁ "}</T>
          <span className="text-primary">
            <T>{"FAZ PARTE."}</T>
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          <T>
            {
              "Conhece os coaches e comunidades que se preparam para integrar a Hybrid Hub. Pessoas com vontade de partilhar o desporto e criar novas ligações."
            }
          </T>
        </p>
        <p className="mt-4 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
          <T>
            {
              "A app está em preparação. Apresentamos cada perfil depois de confirmar os dados e a autorização de publicação com o participante."
            }
          </T>
        </p>
      </section>
      <nav
        className="mt-7 flex flex-wrap gap-3"
        aria-label={
          language === "en" ? "Profile categories" : language === "es" ? "Perfiles" : "Perfis"
        }
      >
        <Link
          to={preview ? "/inscritos" : "/quem-ja-faz-parte"}
          hash="coaches"
          className="btn-ghost min-w-0"
        >
          <T>{"Coaches"}</T>
        </Link>
        <Link
          to={preview ? "/inscritos" : "/quem-ja-faz-parte"}
          hash="comunidades"
          className="btn-ghost min-w-0"
        >
          <T>{"Comunidades"}</T>
        </Link>
      </nav>
      {(["coach", "community"] as const).map((kind) => {
        const profiles = memberProfiles.filter((profile) => profile.kind === kind);
        const Icon = kind === "coach" ? Dumbbell : Users;
        return (
          <section
            key={kind}
            id={kind === "coach" ? "coaches" : "comunidades"}
            className="scroll-mt-24 border-b border-border py-10 md:py-12"
          >
            <div className="flex items-center gap-3">
              <Icon className="shrink-0 text-primary" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl">
                <T>{kind === "coach" ? "COACHES" : "COMUNIDADES"}</T>
              </h2>
            </div>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              <T>
                {kind === "coach"
                  ? "Profissionais que ajudam a transformar objetivos em treino, com acompanhamento e motivação."
                  : "Grupos que juntam pessoas para treinar, partilhar experiências e viver o desporto em conjunto."}
              </T>
            </p>
            {profiles.length ? (
              <div className="mt-7 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="mt-7 flex flex-col items-start gap-4 rounded-sm border border-dashed border-primary/40 bg-card p-6 sm:flex-row sm:gap-5 md:p-8">
                <Icon size={28} className="shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="text-xl">
                    <T>
                      {kind === "coach"
                        ? "Os primeiros coaches estão a caminho."
                        : "As primeiras comunidades estão a caminho."}
                    </T>
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    <T>
                      {kind === "coach"
                        ? "Este espaço vai dar a conhecer os coaches, as suas modalidades e onde treinam, à medida que os perfis forem confirmados."
                        : "Aqui vais poder descobrir os grupos, as suas atividades e onde se encontram, à medida que os perfis forem confirmados."}
                    </T>
                  </p>
                </div>
              </div>
            )}
          </section>
        );
      })}
      <section className="mt-10 rounded-sm border border-primary p-6 md:mt-12 md:p-8">
        <h2 className="text-2xl md:text-3xl">
          <T>{"O PRÓXIMO PERFIL PODE SER O TEU."}</T>
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          <T>
            {
              "És PT, coach ou representas uma comunidade desportiva? Apresenta o teu projeto e ajuda-nos a preparar este início."
            }
          </T>
        </p>
        <Link to="/coaches-comunidades" className="btn-primary mt-6 max-w-full text-center">
          <T>{"Quero fazer parte"}</T>
          <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
