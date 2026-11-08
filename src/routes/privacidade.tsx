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

const MARK = "[INFORMAÇÃO A CONFIRMAR]";

// Versão preliminar da Política de Privacidade, em revisão.
// Os campos [INFORMAÇÃO A CONFIRMAR] devem ser preenchidos com os dados reais
// antes da aprovação jurídica final. Não alterar a redação sem validação legal.
const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Identificação do responsável pelo tratamento",
    body: [
      "O responsável pelo tratamento dos dados pessoais recolhidos através da aplicação e do website Hybrid Hub é Hybrid Hub, com sede em Maia, Portugal.",
      "Para qualquer questão relacionada com o tratamento dos seus dados pessoais, pode contactar-nos através do endereço de correio eletrónico hybridhubadmin@gmail.com.",
    ],
  },
  {
    heading: "Dados pessoais recolhidos",
    body: [
      "A Hybrid Hub recolhe apenas os dados pessoais necessários ao funcionamento da aplicação e à prestação das suas funcionalidades. Consoante a utilização que fizer da aplicação, podemos recolher: dados de identificação e de contacto (nome, endereço de correio eletrónico, número de telemóvel e data de nascimento); dados de perfil (fotografia, modalidades desportivas preferidas, nível de experiência e zona de residência); dados de localização; conteúdos partilhados nas comunidades; e dados de utilização da aplicação.",
      "A aplicação Hybrid Hub destina-se exclusivamente a maiores de 18 anos. Ao criar uma conta, o utilizador declara ter idade igual ou superior a 18 anos.",
    ],
  },
  {
    heading: "Registo e perfil dos utilizadores",
    body: [
      "Para utilizar a aplicação é necessário criar uma conta. No momento do registo, solicitamos os dados estritamente necessários à criação e gestão da conta. Os restantes elementos do perfil são facultados voluntariamente pelo utilizador e podem ser editados ou removidos a qualquer momento nas definições da aplicação.",
      "As informações do perfil destinam-se a facilitar a ligação entre utilizadores com interesses desportivos comuns, como a procura de parceiros de treino, atividades, provas, comunidades e coaches.",
    ],
  },
  {
    heading: "Verificação de conta por SMS",
    body: [
      "Para garantir a autenticidade das contas e a segurança da comunidade, a Hybrid Hub utiliza um processo de verificação por SMS. O número de telemóvel fornecido é utilizado exclusivamente para o envio do código de verificação e para fins de segurança da conta, não sendo utilizado para qualquer outra finalidade sem o consentimento do titular.",
    ],
  },
  {
    heading: "Dados de localização",
    body: [
      "A Hybrid Hub utiliza dados de localização para apresentar oportunidades de treino, atividades, provas e comunidades geograficamente relevantes para o utilizador.",
      "A recolha de dados de localização depende da autorização concedida pelo utilizador no seu dispositivo e pode ser desativada a qualquer momento nas definições do sistema operativo. Sem essa autorização, algumas funcionalidades baseadas na proximidade geográfica podem ficar limitadas.",
    ],
  },
  {
    heading: "Oportunidades de treino e histórico de participação",
    body: [
      "As oportunidades de treino disponíveis na aplicação são criadas pelos próprios utilizadores. Quando um utilizador cria ou adere a uma oportunidade de treino, os dados essenciais dessa participação (como o nome de utilizador e a confirmação de presença) ficam visíveis para os restantes participantes dessa atividade.",
      "A aplicação mantém um histórico de participação associado à conta do utilizador, utilizado para apresentar as atividades passadas e futuras do próprio e para o funcionamento do sistema de reconhecimento descrito no ponto seguinte.",
    ],
  },
  {
    heading: "Sistema de reconhecimento Bucket Hat e gestão de faltas",
    body: [
      "O sistema Bucket Hat reconhece a participação e o envolvimento dos utilizadores nas atividades da comunidade Hybrid Hub. Para o seu funcionamento, a aplicação regista dados relativos à participação em treinos e eventos, incluindo presenças confirmadas e faltas.",
      "Estes dados são utilizados exclusivamente para atribuir reconhecimentos dentro da aplicação e para gerir a fiabilidade das inscrições nas oportunidades de treino, podendo influenciar a visibilidade ou o acesso a determinadas atividades.",
    ],
  },
  {
    heading: "Comunidades e conteúdos partilhados",
    body: [
      "A Hybrid Hub permite a criação e a participação em comunidades, nas quais os utilizadores podem partilhar conteúdos como mensagens, fotografias e informações sobre atividades desportivas.",
      "Os conteúdos partilhados numa comunidade ficam visíveis para os membros dessa comunidade. O utilizador é responsável pelos conteúdos que publica e deve abster-se de partilhar dados pessoais de terceiros sem o seu consentimento.",
    ],
  },
  {
    heading: "Coaches e verificação profissional",
    body: [
      "Os utilizadores que se apresentam como coaches na aplicação podem ser sujeitos a um processo de verificação profissional. Nesse âmbito, podem ser recolhidos dados adicionais, como qualificações, certificações e experiência profissional.",
      "Estes dados são utilizados apenas para validar o perfil do coach e para informar os restantes utilizadores sobre o estatuto de verificação, não sendo divulgados para outros fins.",
    ],
  },
  {
    heading: "Denúncias e moderação de conteúdos",
    body: [
      "A aplicação contempla um sistema de denúncias que permite aos utilizadores reportar conteúdos ou comportamentos que violem as regras da comunidade. As denúncias são analisadas pela equipa de moderação.",
      "No âmbito deste processo, podem ser tratados os dados dos utilizadores envolvidos (denunciante, autor do conteúdo e conteúdo denunciado), exclusivamente para análise e decisão sobre a denúncia. A identidade do denunciante não é revelada ao utilizador denunciado.",
    ],
  },
  {
    heading: "Finalidades e fundamentos legais do tratamento",
    body: [
      "Os dados pessoais são tratados para as seguintes finalidades: criação e gestão da conta de utilizador; verificação de identidade; funcionamento das funcionalidades de ligação entre utilizadores (parceiros de treino, atividades, provas, comunidades e coaches); gestão do sistema de reconhecimento Bucket Hat; moderação de conteúdos e análise de denúncias; envio de notificações; e melhoria da aplicação.",
      "O tratamento fundamenta-se, consoante o caso, na execução do contrato de utilização da aplicação, no consentimento do titular (por exemplo, para a localização e comunicações de marketing), no interesse legítimo da Hybrid Hub (por exemplo, segurança e moderação) e no cumprimento de obrigações legais.",
    ],
  },
  {
    heading: "Partilha de dados pessoais",
    body: [
      "A Hybrid Hub não vende dados pessoais a terceiros. Os dados dos utilizadores são partilhados apenas nas seguintes situações: com outros utilizadores, na medida necessária ao funcionamento das funcionalidades sociais da aplicação (por exemplo, perfil visível, participação em treinos e conteúdos em comunidades); com prestadores de serviços que apoiam o funcionamento da aplicação, nos termos do ponto seguinte; e quando exigido por lei ou por autoridade competente.",
    ],
  },
  {
    heading: "Prestadores de serviços e transferências internacionais",
    body: [
      `Para o funcionamento da aplicação, a Hybrid Hub recorre a prestadores de serviços tecnológicos (por exemplo, alojamento, envio de SMS e análise de utilização). A identificação destes fornecedores é ${MARK}.`,
      `Caso algum destes prestadores implique a transferência de dados pessoais para fora do Espaço Económico Europeu, essa transferência será efetuada apenas com as garantias adequadas previstas no Regulamento Geral sobre a Proteção de Dados (RGPD). Detalhes específicos: ${MARK}.`,
    ],
  },
  {
    heading: "Notificações e comunicações",
    body: [
      "A Hybrid Hub envia notificações relacionadas com a conta e com a atividade do utilizador na aplicação (por exemplo, confirmações de participação, mensagens e alertas de atividades). Estas notificações fazem parte do funcionamento do serviço.",
      "O envio de comunicações de marketing ou promocionais só é efetuado com o consentimento do utilizador, que pode ser retirado a qualquer momento nas definições da aplicação.",
    ],
  },
  {
    heading: "Dados de utilização e ferramentas de análise",
    body: [
      "Recolhemos dados sobre a forma como a aplicação é utilizada (por exemplo, funcionalidades acedidas e interações) com o objetivo de melhorar o serviço, corrigir problemas técnicos e desenvolver novas funcionalidades.",
      `As ferramentas de análise utilizadas são ${MARK}. Sempre que estas ferramentas impliquem o tratamento de dados pessoais, a sua utilização respeita o RGPD e, quando aplicável, depende do consentimento do utilizador.`,
    ],
  },
  {
    heading: "Prazos de conservação",
    body: [
      "Os dados pessoais são conservados apenas durante o período necessário às finalidades para que foram recolhidos. Em regra, os dados da conta são mantidos enquanto a conta estiver ativa.",
      `Os prazos de conservação específicos aplicáveis a cada categoria de dados são ${MARK}. Findos os prazos aplicáveis, os dados são eliminados ou anonimizados de forma segura.`,
    ],
  },
  {
    heading: "Eliminação de contas e dados",
    body: [
      "O utilizador pode, a qualquer momento, solicitar a eliminação da sua conta e dos dados pessoais associados, através das definições da aplicação ou dos contactos indicados no ponto 21.",
      `Após o pedido de eliminação, os dados são apagados no prazo de ${MARK}, salvo quando a sua conservação seja exigida por lei ou necessária para o exercício ou defesa de direitos em processo judicial.`,
    ],
  },
  {
    heading: "Direitos dos titulares dos dados segundo o RGPD",
    body: [
      "Nos termos do RGPD, o titular dos dados tem direito a: aceder aos seus dados pessoais; retificar dados inexatos ou incompletos; solicitar o apagamento dos dados; limitar o tratamento; opor-se ao tratamento; solicitar a portabilidade dos dados; e retirar o consentimento a qualquer momento, sem comprometer a licitude do tratamento efetuado com base no consentimento previamente dado.",
      "Para exercer qualquer destes direitos, o titular pode contactar-nos através dos meios indicados no ponto 21. A Hybrid Hub responde aos pedidos nos prazos legais aplicáveis.",
    ],
  },
  {
    heading: "Segurança dos dados pessoais",
    body: [
      "A Hybrid Hub adota medidas técnicas e organizativas adequadas para proteger os dados pessoais contra acesso não autorizado, perda, destruição ou divulgação indevida.",
      "Apesar destas medidas, nenhum sistema é totalmente infalível. Caso ocorra uma violação de dados pessoais suscetível de implicar um risco elevado para os direitos e liberdades dos titulares, estes serão informados nos termos previstos no RGPD.",
    ],
  },
  {
    heading: "Alterações à Política de Privacidade",
    body: [
      "A presente Política de Privacidade pode ser atualizada para refletir alterações nas funcionalidades da aplicação, nos prestadores de serviços ou na legislação aplicável.",
      "A versão em vigor estará sempre disponível nesta página. Em caso de alterações significativas, os utilizadores serão informados através da aplicação ou dos contactos associados à conta.",
    ],
  },
  {
    heading: "Contactos e direito de reclamação",
    body: [
      "Para qualquer questão sobre esta Política de Privacidade ou sobre o tratamento dos seus dados pessoais, pode contactar-nos através do endereço de correio eletrónico hybridhubadmin@gmail.com ou do seguinte endereço postal: Rua Maria da Conceição Ramos de Araújo Jorge, 210, 4425-193 Águas Santas, Maia.",
      "Sem prejuízo de qualquer outra via administrativa ou judicial, o titular dos dados tem o direito de apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD), a autoridade de controlo competente em Portugal, através do sítio www.cnpd.pt.",
    ],
  },
];

function PolicyText({ text }: { text: string }) {
  const parts = text.split(MARK);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className="font-medium text-primary">{MARK}</span>}
        </span>
      ))}
    </>
  );
}

function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-[850px] px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <header>
        <h1 className="text-4xl sm:text-5xl md:text-6xl">POLÍTICA DE PRIVACIDADE</h1>
        <p className="mt-4 text-sm text-muted-foreground">Hybrid Hub | Train • Connect • Compete</p>
        <div className="mt-8 h-px w-24 bg-primary" aria-hidden="true" />
        <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
          Versão preliminar em revisão — não constitui documento jurídico aprovado.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="text-lg font-bold tracking-normal md:text-xl">
              <span className="mr-2 text-primary">{i + 1}.</span>
              {s.heading}
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              {s.body.map((p, j) => (
                <p key={j}>
                  <PolicyText text={p} />
                </p>
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
