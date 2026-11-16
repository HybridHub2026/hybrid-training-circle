export type FormLanguage = "pt" | "es" | "en";
export type FormKind = "launch" | "contact";
export type RecipientKind = "user" | "admin";

export interface Submission {
  id: string;
  kind: FormKind;
  language: FormLanguage;
  email: string;
  name: string;
  subject: string;
  message: string;
  consent_text: string;
  request_hash: string;
  created_at: number;
}

const copy = {
  pt: {
    hello: "Olá",
    launchSubject: "Hybrid Hub — inscrição confirmada",
    launch: "Recebemos a tua inscrição para o aviso de lançamento da app Hybrid Hub. Obrigado por fazeres parte deste início! Vamos enviar-te um email quando a app estiver disponível.",
    contactSubject: "Hybrid Hub — recebemos a tua mensagem",
    contact: "Obrigado por entrares em contacto com a Hybrid Hub. Recebemos a tua mensagem e vamos responder-te assim que possível.",
    reply: "Se precisares de falar connosco, basta responder a este email.",
    unsubscribe: "Se já não quiseres receber o aviso de lançamento, responde a este email a pedir a remoção da tua inscrição.",
    launchConsent: "Quero receber por email o aviso de lançamento da Hybrid Hub. Posso cancelar a qualquer momento por resposta ao email.",
    contactConsent: "Li a Política de Privacidade e compreendo que os meus dados serão utilizados para responder ao meu contacto.",
    privacy: "Política de Privacidade",
  },
  es: {
    hello: "Hola",
    launchSubject: "Hybrid Hub — inscripción confirmada",
    launch: "Hemos recibido tu inscripción para el aviso de lanzamiento de la app Hybrid Hub. ¡Gracias por acompañarnos desde el principio! Te enviaremos un correo electrónico cuando la app esté disponible.",
    contactSubject: "Hybrid Hub — hemos recibido tu mensaje",
    contact: "Gracias por ponerte en contacto con Hybrid Hub. Hemos recibido tu mensaje y te responderemos lo antes posible.",
    reply: "Si necesitas hablar con nosotros, responde a este correo electrónico.",
    unsubscribe: "Si ya no quieres recibir el aviso de lanzamiento, responde a este correo electrónico para pedir que eliminemos tu inscripción.",
    launchConsent: "Quiero recibir por correo electrónico el aviso de lanzamiento de Hybrid Hub. Puedo cancelar en cualquier momento respondiendo al correo electrónico.",
    contactConsent: "He leído la Política de Privacidad y entiendo que mis datos se utilizarán para responder a mi consulta.",
    privacy: "Política de Privacidad",
  },
  en: {
    hello: "Hi",
    launchSubject: "Hybrid Hub — you're on the launch list",
    launch: "We've received your request to hear about the Hybrid Hub app launch. Thanks for being part of it from the start! We'll email you when the app is available.",
    contactSubject: "Hybrid Hub — we've received your message",
    contact: "Thanks for getting in touch with Hybrid Hub. We've received your message and will get back to you as soon as possible.",
    reply: "If you need to get in touch, just reply to this email.",
    unsubscribe: "If you no longer want the launch notification, reply to this email to ask us to remove your sign-up.",
    launchConsent: "I want to receive the Hybrid Hub launch notification by email. I can unsubscribe at any time by replying to the email.",
    contactConsent: "I have read the Privacy Policy and understand that my data will be used to respond to my enquiry.",
    privacy: "Privacy Policy",
  },
} as const;

export function consentText(kind: FormKind, language: FormLanguage) {
  return copy[language][kind === "launch" ? "launchConsent" : "contactConsent"];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function makeEmail(submission: Submission, recipient: RecipientKind, senderEmail: string, adminEmail: string) {
  const { kind, language, email, name } = submission;
  const text = copy[language];
  const prefix = language === "pt" ? "" : `/${language}`;
  const privacyUrl = `https://hybridhub.pt${prefix}/privacidade`;
  const paragraphs = recipient === "user" ? [
    `${text.hello}${name ? ` ${name}` : ""},`,
    text[kind],
    text.reply,
    ...(kind === "launch" ? [text.unsubscribe] : []),
    "Hybrid Hub · TRAIN • CONNECT • COMPETE",
  ] : [
    kind === "launch" ? "Nova inscrição para o aviso de lançamento da app." : "Nova mensagem recebida pelo site.",
    `Email: ${email}`,
    ...(name ? [`Nome: ${name}`] : []),
    `Idioma: ${language.toUpperCase()}`,
    ...(kind === "contact" ? [`Assunto: ${submission.subject}`, `Mensagem:\n${submission.message}`] : []),
    `Recebido em: ${new Date(submission.created_at).toISOString()}`,
    `Referência: ${submission.id}`,
    `Registo de consentimento/privacidade: ${submission.consent_text}`,
    ...(kind === "launch" ? ["Consultar a lista de inscritos: https://hybridhub.pt/inscritos"] : []),
  ];
  const subject = recipient === "user" ? text[`${kind}Subject`] : `Hybrid Hub — ${kind === "launch" ? "nova inscrição" : "novo contacto"}`;
  const body = paragraphs.map(paragraph => `<p style="margin:0 0 18px;line-height:1.6">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  return {
    sender: { email: senderEmail, name: "Hybrid Hub" },
    to: [{ email: recipient === "user" ? email : adminEmail }],
    replyTo: { email: recipient === "user" ? adminEmail : email },
    subject,
    textContent: `${paragraphs.join("\n\n")}\n\n${text.privacy}: ${privacyUrl}`,
    htmlContent: `<!doctype html><html lang="${language}"><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#161616"><div style="max-width:600px;margin:24px auto;background:#fff;padding:28px;border-top:5px solid #f5c518"><h1 style="font-size:22px;margin:0 0 24px">HYBRID HUB</h1>${body}<p style="font-size:12px"><a href="${privacyUrl}" style="color:#444">${text.privacy}</a></p></div></body></html>`,
    tags: ["hybridhub", kind, language, recipient],
  };
}
