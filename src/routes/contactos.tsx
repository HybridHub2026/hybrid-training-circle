import { languageAlternates } from "@/i18n/language";
import { Link, T, Localized, useLanguage, translateText } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos Hybrid Hub | Fala com a equipa" },
      { name: "description", content: "Tens dúvidas sobre a app, comunidades, coaches ou parcerias? Encontra o email, telefone e morada da equipa Hybrid Hub." },
      { property: "og:title", content: "Contactos Hybrid Hub | Fala com a equipa" },
      { property: "og:description", content: "Fala com a equipa Hybrid Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [...languageAlternates("/contactos"), { rel: "canonical", href: "https://hybridhub.pt/contactos" }],
  }),
  component: Contactos,
});

// Separate from the launch notification list in the same Formspree account.
const FORMSPREE_FORM_ID = "xyewkngw";

const EMAIL = "hybridhubadmin@gmail.com";
const PHONE_DISPLAY = "+351 933 002 870";
const PHONE_TEL = "tel:+351933002870";

const SUBJECTS = [
  "Informações gerais",
  "Aplicação Hybrid Hub",
  "Parcerias e colaborações",
  "Coaches e comunidades",
  "Merchandising",
  "Outro assunto",
];

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function Contactos() {
  const language = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next["name"] = "Indica o teu nome.";
    if (!email.trim()) next["email"] = "Indica o teu email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next["email"] = "O formato do email não é válido.";
    if (!subject) next["subject"] = "Escolhe um assunto.";
    if (!message.trim()) next["message"] = "Escreve a tua mensagem.";
    if (!consent) next["consent"] = "É necessário aceitar a Política de Privacidade.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    if (new FormData(e.currentTarget).get("_gotcha")) return;
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          nome: name.trim(),
          email: email.trim(),
          idioma: language,
          assunto: translateText(subject, language),
          mensagem: message.trim(),
          privacidade: translateText("Li a Política de Privacidade e compreendo que os meus dados serão utilizados para responder ao meu contacto.", language),
          enviado_em: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setConsent(false);
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      {/* Cabeçalho */}
      <p className="eyebrow"><T>{"Contactos"}</T></p>
      <h1 className="mt-6 text-5xl md:text-8xl"><T>{"FALA "}</T><span className="text-primary"><T>{"CONNOSCO."}</T></span>
      </h1>
      <p className="mt-6 max-w-xl text-muted-foreground md:text-lg"><T>{"Tens alguma dúvida, sugestão ou queres saber mais sobre a Hybrid Hub? Estamos deste lado."}</T></p>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        {/* Coluna esquerda — contactos oficiais */}
        <div>
          <h2 className="text-2xl md:text-3xl"><T>{"ESTAMOS À DISTÂNCIA DE UMA MENSAGEM."}</T></h2>
          <div className="mt-10 flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <Mail size={20} className="mt-1 shrink-0 text-primary" />
              <div>
                <span className="eyebrow"><T>{"Email"}</T></span>
                <Localized as="a" href={`mailto:${EMAIL}`} className="mt-2 block text-lg hover:text-primary">
                  <T>{EMAIL}</T>
                </Localized>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone size={20} className="mt-1 shrink-0 text-primary" />
              <div>
                <span className="eyebrow"><T>{"Telefone"}</T></span>
                <Localized as="a" href={PHONE_TEL} className="mt-2 block text-lg hover:text-primary">
                  <T>{PHONE_DISPLAY}</T>
                </Localized>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={20} className="mt-1 shrink-0 text-primary" />
              <div>
                <span className="eyebrow"><T>{"Morada"}</T></span>
                <p className="mt-2 text-lg leading-relaxed text-muted-foreground"><T>{"Rua Maria da Conceição Ramos de Araújo Jorge"}</T><br /><T>{"4425-193 Maia"}</T><br /><T>{"Portugal"}</T></p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <div>
          <h2 className="text-2xl md:text-3xl"><T>{"ENVIA-NOS UMA MENSAGEM."}</T></h2>

          <T>{status === "success" ? (
            <div role="status" className="mt-10 rounded-sm border border-primary p-8">
              <h3 className="text-xl text-primary"><T>{"MENSAGEM ENVIADA!"}</T></h3>
              <p className="mt-4 text-muted-foreground"><T>{"Obrigado pelo teu contacto. Recebemos a tua mensagem e responderemos assim que possível."}</T></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-6">
              {/* Honeypot anti-spam (invisível para humanos) */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <div>
                <label htmlFor="nome" className="eyebrow mb-2 block"><T>{"Nome"}</T></label>
                <Localized as="input"
                  id="nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O teu nome"
                  maxLength={100}
                  className={inputClass}
                />
                <T>{errors["name"] && <p className="mt-2 text-sm text-destructive"><T>{errors["name"]}</T></p>}</T>
              </div>

              <div>
                <label htmlFor="email" className="eyebrow mb-2 block"><T>{"Email"}</T></label>
                <Localized as="input"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="O teu email"
                  maxLength={255}
                  className={inputClass}
                />
                <T>{errors["email"] && <p className="mt-2 text-sm text-destructive"><T>{errors["email"]}</T></p>}</T>
              </div>

              <div>
                <label htmlFor="assunto" className="eyebrow mb-2 block"><T>{"Assunto"}</T></label>
                <select
                  id="assunto"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`${inputClass} ${subject ? "" : "text-muted-foreground"}`}
                >
                  <option value="" disabled><T>{"Escolhe um assunto"}</T></option>
                  <T>{SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      <T>{s}</T>
                    </option>
                  ))}</T>
                </select>
                <T>{errors["subject"] && <p className="mt-2 text-sm text-destructive"><T>{errors["subject"]}</T></p>}</T>
              </div>

              <div>
                <label htmlFor="mensagem" className="eyebrow mb-2 block"><T>{"Mensagem"}</T></label>
                <Localized as="textarea"
                  id="mensagem"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreve aqui a tua mensagem..."
                  rows={6}
                  maxLength={2000}
                  className={`${inputClass} resize-y`}
                />
                <T>{errors["message"] && <p className="mt-2 text-sm text-destructive"><T>{errors["message"]}</T></p>}</T>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#F5C518]"
                  />
                  <span><T>{"Li a"}</T><T>{" "}</T>
                    <Link to="/privacidade" className="text-primary underline underline-offset-2"><T>{"Política de Privacidade"}</T></Link><T>{" "}</T><T>{"e compreendo que os meus dados serão utilizados para responder ao meu contacto."}</T></span>
                </label>
                <T>{errors["consent"] && <p className="mt-2 text-sm text-destructive"><T>{errors["consent"]}</T></p>}</T>
              </div>

              <T>{status === "error" && (
                <div role="alert" className="rounded-sm border border-destructive p-6">
                  <h3 className="text-lg text-destructive"><T>{"NÃO FOI POSSÍVEL ENVIAR A MENSAGEM."}</T></h3>
                  <p className="mt-3 text-sm text-muted-foreground"><T>{"Tenta novamente ou contacta-nos diretamente através do email"}</T><T>{" "}</T>
                    <Localized as="a" href={`mailto:${EMAIL}`} className="text-primary underline underline-offset-2">
                      <T>{EMAIL}</T>
                    </Localized><T>{"."}</T></p>
                </div>
              )}</T>

              <button type="submit" disabled={status === "sending"} className="btn-primary disabled:opacity-60">
                <T>{status === "sending" ? "A ENVIAR…" : "ENVIAR MENSAGEM"}</T>
              </button>
            </form>
          )}</T>
        </div>
      </div>

      <div className="mt-24">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary"><T>{"← Voltar ao início"}</T></Link>
      </div>
    </section>
  );
}
