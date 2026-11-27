import { emptyProfile, profileSchema } from "./profile-data";

export type PartnerApplication = {
  id: string;
  name: string;
  subject: string;
  message: string;
  email: string;
  language: string;
  created_at: number;
  hasImage?: number;
  consent_text?: string;
};
// Older applications store the generated questionnaire as labelled paragraphs.
// Keep the complete original response in the inbox/export for review.
export function applicationFields(message: string) {
  const result: Record<string, string> = {};
  const labels =
    /(?:^|\n\n)(Tipo|Cidade|País|Modalidades|Apresentação|Acompanhamento|Atividades e frequência|Instagram \/ site|Imagem enviada): /g;
  const matches = [...message.matchAll(labels)];
  matches.forEach((match, index) => {
    result[match[1]!] = message
      .slice(match.index! + match[0].length, matches[index + 1]?.index ?? message.length)
      .trim();
  });
  return result;
}
export function applicationKind(row: PartnerApplication) {
  return row.subject === "[Participação] Comunidade" ? ("community" as const) : ("coach" as const);
}
export function applicationProfile(row: PartnerApplication, imageId: string | null) {
  const fields = applicationFields(row.message);
  const data = emptyProfile();
  const language = row.language === "es" || row.language === "en" ? row.language : "pt";
  data.kind = applicationKind(row);
  data.name = row.name.trim().slice(0, 100);
  data.city = (fields["Cidade"] ?? "").slice(0, 100);
  data.country[language] = (fields["País"] ?? "").slice(0, 100);
  const activities = fields["Acompanhamento"] ?? fields["Atividades e frequência"] ?? "";
  const description = [fields["Apresentação"], activities].filter(Boolean).join("\n\n");
  data.description[language] = description.slice(0, 900);
  const sports = (fields["Modalidades"] ?? "")
    .split(/[,;\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  data.sports[language] = sports.slice(0, 10).map((value) => value.slice(0, 60));
  data.imageId = imageId;
  if (imageId) data.imageAlt[language] = row.name.slice(0, 160);
  const rawLink = fields["Instagram / site"]?.trim() ?? "";
  const link = rawLink.startsWith("@")
    ? `https://www.instagram.com/${rawLink.slice(1)}/`
    : /^https?:\/\//i.test(rawLink)
      ? rawLink
      : rawLink && !/\s/.test(rawLink) && rawLink.includes(".")
        ? `https://${rawLink}`
        : "";
  try {
    const url = new URL(link);
    if (url.protocol === "http:") url.protocol = "https:";
    if (url.protocol === "https:" && !url.username && !url.password && url.href.length <= 500) {
      if (/(^|\.)instagram\.com$/i.test(url.hostname)) data.instagram = url.href;
      else data.website = url.href;
    }
  } catch {
    /* Unrecognised links stay in the original answers for manual review. */
  }
  const warnings = [
    "Revê os dados, a descrição da imagem e as traduções. A autorização de publicação continua por confirmar.",
  ];
  if (description.length > 900 || sports.length > 10 || sports.some((value) => value.length > 60))
    warnings.push(
      "Alguns textos excedem os limites do perfil e foram encurtados. As respostas completas continuam no pedido e na exportação.",
    );
  if (rawLink && !data.instagram && !data.website)
    warnings.push("O link enviado precisa de revisão manual.");
  if (language !== "pt")
    warnings.push("Os textos foram colocados no idioma do pedido; falta preencher o português.");
  return { data: profileSchema.parse(data), warnings };
}

const common = [
  "ID registo",
  "Email proprietário",
  "Nome responsável",
  "Origem",
  "Data receção",
  "Referência da origem",
];
export const applicationExportHeaders = {
  community: [
    ...common,
    "Nome comunidade",
    "Descrição",
    "Categoria",
    "Localização",
    "Imagem capa (URL ou caminho)",
    "Regras aceites",
    "Autorização de criação",
    "Data autorização",
    "Prova da autorização",
    "Notas internas",
  ],
  coach: [
    ...common,
    "Nome público coach",
    "Local de trabalho",
    "Especialidades",
    "Serviços",
    "Presencial",
    "Online",
    "Preço desde (EUR)",
    "Biografia",
    "Experiência",
    "Qualificações",
    "Foto (URL ou caminho)",
    "Link social",
    "Consentimento candidatura",
    "Autorização de criação",
    "Data autorização",
    "Prova da autorização",
    "Notas internas",
  ],
};
export function applicationExportRow(row: PartnerApplication) {
  const fields = applicationFields(row.message),
    kind = applicationKind(row);
  const source = `https://hybridhub.pt/inscritos | Pedido ${row.id}`;
  const image = row.hasImage
    ? `https://hybridhub.pt/api/admin?action=partner-image&id=${row.id}&download=1`
    : "";
  const notes = `RASCUNHO para revisão. Email proprietário, autorizações e dados não indicados por confirmar. Descrição/biografia limitada a 300/500 caracteres para a folha de recolha; rever o resumo e os campos antes de importar. Imagem acessível apenas com sessão na área privada; descarregar e guardar junto do Excel. Não importado na app nem publicado.\n\nRespostas originais (${row.language}):\n${row.message}`;
  const values = [
    row.id,
    row.email,
    kind === "coach" ? row.name : "",
    "Inquérito do site",
    new Date(row.created_at).toLocaleDateString("pt-PT", { timeZone: "Europe/Lisbon" }),
    source,
  ];
  const location = [fields["Cidade"], fields["País"]].filter(Boolean).join(", ");
  return [
    ...values,
    ...(kind === "community"
      ? [
          row.name,
          (fields["Apresentação"] ?? "").slice(0, 300),
          "",
          location,
          image,
          "",
          "",
          "",
          "",
          notes,
        ]
      : [
          row.name,
          location,
          fields["Modalidades"] ?? "",
          fields["Acompanhamento"] ?? "",
          "",
          "",
          "",
          (fields["Apresentação"] ?? "").slice(0, 500),
          "",
          "",
          image,
          fields["Instagram / site"] ?? "",
          row.consent_text ? "Sim" : "",
          "",
          "",
          "",
          notes,
        ]),
  ];
}
export function excelCsv(rows: string[][]) {
  const cell = (text: string) =>
    `"${(/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
