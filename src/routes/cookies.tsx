import { languageAlternates } from "@/i18n/language";
import { Link, T } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
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
    links: [...languageAlternates("/cookies"), { rel: "canonical", href: "https://hybridhub.pt/cookies" }],
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
      <span className="mr-2 text-primary"><T>{String(n).padStart(2, "0")}</T><T>{" —"}</T></span>
      <T>{children}</T>
    </h2>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-base font-bold uppercase text-foreground"><T>{children}</T></h3>;
}

function CookiesPage() {
  return (
    <article className="mx-auto max-w-[850px] px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl"><T>{"POLÍTICA DE COOKIES"}</T></h1>
        <p className="mt-4 text-sm text-muted-foreground"><T>{"HYBRID HUB | TRAIN • CONNECT • COMPETE"}</T></p>
        <div className="mt-8 h-px w-24 bg-primary" aria-hidden="true" />
      </header>

      <div className="mt-12 space-y-12 leading-relaxed text-muted-foreground [&_section>div]:mt-4 [&_section>div]:space-y-4">
        <section>
          <H n={1}><T>{"O que são cookies?"}</T></H>
          <div>
            <p><T>{"Os cookies são pequenos ficheiros ou informações armazenadas no dispositivo do visitante (computador, telemóvel ou tablet) durante a navegação num website."}</T></p>
            <p><T>{"Os cookies podem permitir o funcionamento técnico do website, guardar as preferências do visitante ou, quando utilizados e autorizados, recolher informações estatísticas sobre a forma como o website é utilizado."}</T></p>
            <p><T>{"Existem também tecnologias semelhantes, como o armazenamento local do navegador (por exemplo, localStorage e sessionStorage), às quais se aplicam as mesmas regras descritas nesta política."}</T></p>
          </div>
        </section>

        <section>
          <H n={2}><T>{"Como utilizamos cookies?"}</T></H>
          <div>
            <p><T>{"O website da Hybrid Hub tem como principal objetivo apresentar a marca e divulgar a aplicação móvel Hybrid Hub."}</T></p>
            <p><T>{"A utilização de cookies e tecnologias semelhantes limita-se às que sejam efetivamente necessárias ao funcionamento do website ou às que sejam expressamente autorizadas pelo visitante."}</T></p>
            <p><T>{"Atualmente, o website não utiliza ferramentas de análise estatística nem ferramentas de marketing."}</T></p>
          </div>
        </section>

        <section>
          <H n={3}><T>{"Tipos de cookies"}</T></H>
          <div>
            <Sub><T>{"A. Cookies necessários"}</T></Sub>
            <p><T>{"Permitem funcionalidades técnicas essenciais, a segurança e o funcionamento básico do website. Quando estritamente necessários, não dependem de consentimento prévio."}</T></p>
            <Sub><T>{"B. Cookies de preferências"}</T></Sub>
            <p><T>{"Podem guardar opções escolhidas pelo visitante, como o idioma ou preferências de apresentação. A sua utilização depende da finalidade e, quando não forem estritamente necessários a um serviço solicitado pelo visitante, do seu consentimento."}</T></p>
            <Sub><T>{"C. Cookies de estatística"}</T></Sub>
            <p><T>{"Podem ser utilizados para compreender, de forma agregada, como os visitantes utilizam o website — por exemplo, o número de visitas, as páginas consultadas e o desempenho. Os cookies de análise não essenciais dependem sempre de consentimento prévio."}</T></p>
            <Sub><T>{"D. Cookies de marketing"}</T></Sub>
            <p><T>{"Podem ser utilizados para medir campanhas publicitárias ou apresentar publicidade relevante. O website não utiliza atualmente cookies de marketing; esta categoria é indicada apenas como possibilidade futura e nunca será ativada sem consentimento válido."}</T></p>
          </div>
        </section>

        <section>
          <H n={4}><T>{"Cookies efetivamente utilizados"}</T></H>
          <div>
            <p><T>{"Após verificação do website, não foram identificados cookies nem outras tecnologias de armazenamento no dispositivo do visitante definidos pelo website da Hybrid Hub."}</T></p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary text-foreground">
                    <th className="py-3 pr-4 font-semibold"><T>{"Nome"}</T></th>
                    <th className="py-3 pr-4 font-semibold"><T>{"Finalidade"}</T></th>
                    <th className="py-3 pr-4 font-semibold"><T>{"Entidade responsável"}</T></th>
                    <th className="py-3 pr-4 font-semibold"><T>{"Duração"}</T></th>
                    <th className="py-3 font-semibold"><T>{"Categoria"}</T></th>
                  </tr>
                </thead>
                <tbody>
                  <T>{cookieRows.length === 0 ? (
                    <tr className="border-b border-border">
                      <td colSpan={5} className="py-4"><T>{"Nenhum cookie identificado."}</T></td>
                    </tr>
                  ) : (
                    cookieRows.map((r) => (
                      <tr key={r.name} className="border-b border-border">
                        <td className="py-3 pr-4"><T>{r.name}</T></td>
                        <td className="py-3 pr-4"><T>{r.purpose}</T></td>
                        <td className="py-3 pr-4"><T>{r.entity}</T></td>
                        <td className="py-3 pr-4"><T>{r.duration}</T></td>
                        <td className="py-3"><T>{r.category}</T></td>
                      </tr>
                    ))
                  )}</T>
                </tbody>
              </table>
            </div>
            <p><T>{"Esta tabela diz respeito apenas ao website. A aplicação móvel Hybrid Hub é regida pela respetiva Política de Privacidade."}</T></p>
          </div>
        </section>

        <section>
          <H n={5}><T>{"Consentimento"}</T></H>
          <div>
            <p><T>{"Os cookies não essenciais dependem sempre do consentimento prévio do visitante. Caso venham a ser utilizados, a Hybrid Hub disponibilizará três opções:"}</T></p>
            <Sub><T>{"Aceitar todos"}</T></Sub>
            <p><T>{"Autoriza todas as categorias opcionais disponíveis."}</T></p>
            <Sub><T>{"Apenas necessários"}</T></Sub>
            <p><T>{"Recusa os cookies não essenciais, mantendo apenas os estritamente necessários ao funcionamento do website."}</T></p>
            <Sub><T>{"Personalizar"}</T></Sub>
            <p><T>{"Permite escolher individualmente as categorias opcionais."}</T></p>
            <p><T>{"O consentimento é livre, informado, específico e revogável, e nenhuma categoria não essencial é pré-selecionada. Como o website não utiliza atualmente cookies opcionais, não é apresentado qualquer pedido de consentimento."}</T></p>
          </div>
        </section>

        <section>
          <H n={6}><T>{"Alterar preferências"}</T></H>
          <div>
            <p><T>{"O visitante pode alterar ou retirar o seu consentimento a qualquer momento. Caso o website passe a utilizar cookies opcionais, será disponibilizado no rodapé um acesso ao painel de preferências, que permitirá rever as escolhas efetuadas."}</T></p>
          </div>
        </section>

        <section>
          <H n={7}><T>{"Cookies de terceiros"}</T></H>
          <div>
            <p><T>{"Determinados serviços externos podem utilizar cookies ou tecnologias semelhantes. O website não integra atualmente serviços de terceiros que definam cookies, como redes sociais incorporadas, mapas, vídeos, ferramentas de análise ou publicidade."}</T></p>
            <p><T>{"A ligação para o Instagram presente no rodapé apenas abre o perfil da Hybrid Hub numa nova página; a partir desse momento, aplicam-se as políticas do respetivo serviço."}</T></p>
            <p><T>{"Se forem adicionados serviços externos no futuro, esta política será atualizada."}</T></p>
          </div>
        </section>

        <section>
          <H n={8}><T>{"Duração dos cookies"}</T></H>
          <div>
            <p><T>{"Os cookies de sessão são normalmente eliminados quando termina a sessão de navegação. Os cookies persistentes permanecem armazenados no dispositivo durante um período definido ou até serem eliminados pelo visitante."}</T></p>
            <p><T>{"Quando existirem, as durações reais de cada cookie serão indicadas na tabela do ponto 04."}</T></p>
          </div>
        </section>

        <section>
          <H n={9}><T>{"Como gerir cookies no navegador"}</T></H>
          <div>
            <p><T>{"O visitante pode consultar, bloquear ou eliminar cookies através das definições do seu navegador, como o Google Chrome, o Microsoft Edge, o Firefox ou o Safari."}</T></p>
            <p><T>{"Bloquear cookies estritamente necessários pode afetar o funcionamento de determinadas funcionalidades dos websites visitados."}</T></p>
          </div>
        </section>

        <section>
          <H n={10}><T>{"Proteção de dados pessoais"}</T></H>
          <div>
            <p><T>{"Sempre que os cookies envolvam o tratamento de dados pessoais, são aplicáveis as regras de proteção de dados e o Regulamento Geral sobre a Proteção de Dados (RGPD). Para mais informações, consulte a nossa"}</T><T>{" "}</T>
              <Link to="/privacidade" className="text-primary underline-offset-4 hover:underline"><T>{"Política de Privacidade"}</T></Link><T>{"."}</T></p>
          </div>
        </section>

        <section>
          <H n={11}><T>{"Alterações à política"}</T></H>
          <div>
            <p><T>{"A presente Política de Cookies poderá ser atualizada sempre que existam alterações tecnológicas, legais ou funcionais."}</T></p>
            <p><T>{"Última atualização: "}</T><span className="font-medium text-primary"><T>{LAST_UPDATED}</T></span></p>
          </div>
        </section>

        <section>
          <H n={12}><T>{"Contactos"}</T></H>
          <div>
            <p><T>{"Para questões relacionadas com a utilização de cookies ou com a proteção de dados, utilize a nossa"}</T><T>{" "}</T>
              <Link to="/contactos" className="text-primary underline-offset-4 hover:underline"><T>{"página de Contactos"}</T></Link><T>{"."}</T></p>
          </div>
        </section>
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <Link to="/" className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"><T>{"← Voltar ao início"}</T></Link>
      </div>
    </article>
  );
}
