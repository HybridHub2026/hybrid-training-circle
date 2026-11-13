import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
    links: [{ rel: "canonical", href: "https://hybridhub.pt/cookies" }],
  }),
  component: CookiesPage,
});

// Campo editável: atualizar sempre que a política for alterada.
const LAST_UPDATED = "[DATA DA ÚLTIMA ATUALIZAÇÃO]";

// Verificação do código (website): não são definidos cookies, nem é usado
// localStorage/sessionStorage, nem existem ferramentas de análise ou marketing.
// Se isso mudar, atualizar a tabela abaixo e implementar o consentimento.
const cookieRows: { name: string; purpose: string; entity: string; duration: string; category: string }[] = [];

function H({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold uppercase tracking-normal md:text-xl">
      <span className="mr-2 text-primary">{String(n).padStart(2, "0")} —</span>
      {children}
    </h2>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-base font-bold uppercase text-foreground">{children}</h3>;
}

function CookiesPage() {
  return (
    <article className="mx-auto max-w-[850px] px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl">POLÍTICA DE COOKIES</h1>
        <p className="mt-4 text-sm text-muted-foreground">HYBRID HUB | TRAIN • CONNECT • COMPETE</p>
        <div className="mt-8 h-px w-24 bg-primary" aria-hidden="true" />
      </header>

      <div className="mt-12 space-y-12 leading-relaxed text-muted-foreground [&_section>div]:mt-4 [&_section>div]:space-y-4">
        <section>
          <H n={1}>O que são cookies?</H>
          <div>
            <p>Os cookies são pequenos ficheiros ou informações armazenadas no dispositivo do visitante (computador, telemóvel ou tablet) durante a navegação num website.</p>
            <p>Os cookies podem permitir o funcionamento técnico do website, guardar as preferências do visitante ou, quando utilizados e autorizados, recolher informações estatísticas sobre a forma como o website é utilizado.</p>
            <p>Existem também tecnologias semelhantes, como o armazenamento local do navegador (por exemplo, localStorage e sessionStorage), às quais se aplicam as mesmas regras descritas nesta política.</p>
          </div>
        </section>

        <section>
          <H n={2}>Como utilizamos cookies?</H>
          <div>
            <p>O website da Hybrid Hub tem como principal objetivo apresentar a marca e divulgar a aplicação móvel Hybrid Hub.</p>
            <p>A utilização de cookies e tecnologias semelhantes limita-se às que sejam efetivamente necessárias ao funcionamento do website ou às que sejam expressamente autorizadas pelo visitante.</p>
            <p>Atualmente, o website não utiliza ferramentas de análise estatística nem ferramentas de marketing.</p>
          </div>
        </section>

        <section>
          <H n={3}>Tipos de cookies</H>
          <div>
            <Sub>A. Cookies necessários</Sub>
            <p>Permitem funcionalidades técnicas essenciais, a segurança e o funcionamento básico do website. Quando estritamente necessários, não dependem de consentimento prévio.</p>
            <Sub>B. Cookies de preferências</Sub>
            <p>Podem guardar opções escolhidas pelo visitante, como o idioma ou preferências de apresentação. A sua utilização depende da finalidade e, quando não forem estritamente necessários a um serviço solicitado pelo visitante, do seu consentimento.</p>
            <Sub>C. Cookies de estatística</Sub>
            <p>Podem ser utilizados para compreender, de forma agregada, como os visitantes utilizam o website — por exemplo, o número de visitas, as páginas consultadas e o desempenho. Os cookies de análise não essenciais dependem sempre de consentimento prévio.</p>
            <Sub>D. Cookies de marketing</Sub>
            <p>Podem ser utilizados para medir campanhas publicitárias ou apresentar publicidade relevante. O website não utiliza atualmente cookies de marketing; esta categoria é indicada apenas como possibilidade futura e nunca será ativada sem consentimento válido.</p>
          </div>
        </section>

        <section>
          <H n={4}>Cookies efetivamente utilizados</H>
          <div>
            <p>Após verificação do website, não foram identificados cookies nem outras tecnologias de armazenamento no dispositivo do visitante definidos pelo website da Hybrid Hub.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary text-foreground">
                    <th className="py-3 pr-4 font-semibold">Nome</th>
                    <th className="py-3 pr-4 font-semibold">Finalidade</th>
                    <th className="py-3 pr-4 font-semibold">Entidade responsável</th>
                    <th className="py-3 pr-4 font-semibold">Duração</th>
                    <th className="py-3 font-semibold">Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieRows.length === 0 ? (
                    <tr className="border-b border-border">
                      <td colSpan={5} className="py-4">Nenhum cookie identificado.</td>
                    </tr>
                  ) : (
                    cookieRows.map((r) => (
                      <tr key={r.name} className="border-b border-border">
                        <td className="py-3 pr-4">{r.name}</td>
                        <td className="py-3 pr-4">{r.purpose}</td>
                        <td className="py-3 pr-4">{r.entity}</td>
                        <td className="py-3 pr-4">{r.duration}</td>
                        <td className="py-3">{r.category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p>Esta tabela diz respeito apenas ao website. A aplicação móvel Hybrid Hub é regida pela respetiva Política de Privacidade.</p>
          </div>
        </section>

        <section>
          <H n={5}>Consentimento</H>
          <div>
            <p>Os cookies não essenciais dependem sempre do consentimento prévio do visitante. Caso venham a ser utilizados, a Hybrid Hub disponibilizará três opções:</p>
            <Sub>Aceitar todos</Sub>
            <p>Autoriza todas as categorias opcionais disponíveis.</p>
            <Sub>Apenas necessários</Sub>
            <p>Recusa os cookies não essenciais, mantendo apenas os estritamente necessários ao funcionamento do website.</p>
            <Sub>Personalizar</Sub>
            <p>Permite escolher individualmente as categorias opcionais.</p>
            <p>O consentimento é livre, informado, específico e revogável, e nenhuma categoria não essencial é pré-selecionada. Como o website não utiliza atualmente cookies opcionais, não é apresentado qualquer pedido de consentimento.</p>
          </div>
        </section>

        <section>
          <H n={6}>Alterar preferências</H>
          <div>
            <p>O visitante pode alterar ou retirar o seu consentimento a qualquer momento. Caso o website passe a utilizar cookies opcionais, será disponibilizado no rodapé um acesso ao painel de preferências, que permitirá rever as escolhas efetuadas.</p>
          </div>
        </section>

        <section>
          <H n={7}>Cookies de terceiros</H>
          <div>
            <p>Determinados serviços externos podem utilizar cookies ou tecnologias semelhantes. O website não integra atualmente serviços de terceiros que definam cookies, como redes sociais incorporadas, mapas, vídeos, ferramentas de análise ou publicidade.</p>
            <p>A ligação para o Instagram presente no rodapé apenas abre o perfil da Hybrid Hub numa nova página; a partir desse momento, aplicam-se as políticas do respetivo serviço.</p>
            <p>Se forem adicionados serviços externos no futuro, esta política será atualizada.</p>
          </div>
        </section>

        <section>
          <H n={8}>Duração dos cookies</H>
          <div>
            <p>Os cookies de sessão são normalmente eliminados quando termina a sessão de navegação. Os cookies persistentes permanecem armazenados no dispositivo durante um período definido ou até serem eliminados pelo visitante.</p>
            <p>Quando existirem, as durações reais de cada cookie serão indicadas na tabela do ponto 04.</p>
          </div>
        </section>

        <section>
          <H n={9}>Como gerir cookies no navegador</H>
          <div>
            <p>O visitante pode consultar, bloquear ou eliminar cookies através das definições do seu navegador, como o Google Chrome, o Microsoft Edge, o Firefox ou o Safari.</p>
            <p>Bloquear cookies estritamente necessários pode afetar o funcionamento de determinadas funcionalidades dos websites visitados.</p>
          </div>
        </section>

        <section>
          <H n={10}>Proteção de dados pessoais</H>
          <div>
            <p>Sempre que os cookies envolvam o tratamento de dados pessoais, são aplicáveis as regras de proteção de dados e o Regulamento Geral sobre a Proteção de Dados (RGPD). Para mais informações, consulte a nossa{" "}
              <Link to="/privacidade" className="text-primary underline-offset-4 hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
        </section>

        <section>
          <H n={11}>Alterações à política</H>
          <div>
            <p>A presente Política de Cookies poderá ser atualizada sempre que existam alterações tecnológicas, legais ou funcionais.</p>
            <p>Última atualização: <span className="font-medium text-primary">{LAST_UPDATED}</span></p>
          </div>
        </section>

        <section>
          <H n={12}>Contactos</H>
          <div>
            <p>Para questões relacionadas com a utilização de cookies ou com a proteção de dados, utilize a nossa{" "}
              <Link to="/contactos" className="text-primary underline-offset-4 hover:underline">página de Contactos</Link>.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <Link to="/" className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          ← Voltar ao início
        </Link>
      </div>
    </article>
  );
}
