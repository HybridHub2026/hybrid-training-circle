import { Link, T, Localized, useLanguage, translateText } from "@/i18n";
import { useState, type FormEvent } from "react";
import { FormProtection, useWebsiteForm } from "./WebsiteForm";

export function LaunchNotice() {
  const language = useLanguage();
  const websiteForm = useWebsiteForm();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!websiteForm.ready || status === "sending") return;
    const fields = new FormData(event.currentTarget);
    if (fields.get("_gotcha")) return;
    setStatus("sending");
    try {
      await websiteForm.submit({ kind: "launch", email, idioma: language, consent: fields.get("consent") === "on", _gotcha: fields.get("_gotcha") ?? "", consentimento: translateText("Quero receber por email o aviso de lançamento da Hybrid Hub. Posso cancelar a qualquer momento por resposta ao email.", language) });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="aviso-lancamento" className="scroll-mt-24 border-y border-border bg-muted">
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16">
        <p className="eyebrow"><T>{"App em preparação · iOS e Android"}</T></p>
        <h2 className="mt-4 text-3xl md:text-5xl"><T>{"A TUA PRÓXIMA LIGAÇÃO "}</T><span className="text-primary"><T>{"ESTÁ A CHEGAR."}</T></span></h2>
        <p className="mt-5 text-muted-foreground md:text-lg"><T>{"Deixa o teu email para receberes o aviso quando a app Hybrid Hub estiver disponível."}</T></p>
        <T>{status === "success" ? (
          <div className="mt-8 rounded-sm border border-primary p-6" role="status">
            <p className="font-semibold"><T>{"O teu pedido foi recebido!"}</T></p>
            <p className="mt-2 text-muted-foreground"><T>{"Vamos avisar-te neste email quando a app estiver disponível. Obrigado por fazeres parte deste início."}</T></p>
          </div>
        ) : (
          <form onSubmit={subscribe} method="POST" className="mt-8">
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label htmlFor="launch-email" className="text-sm font-medium"><T>{"O teu email"}</T></label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Localized as="input" id="launch-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.pt" className="min-h-12 min-w-0 flex-1 rounded-sm border border-border bg-background px-4 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-describedby="launch-privacy launch-feedback" disabled={status === "sending"} />
              <button type="submit" className="btn-primary min-h-12 disabled:cursor-wait disabled:opacity-60" disabled={!websiteForm.ready || status === "sending"}><T>{status === "sending" ? "A enviar…" : "Avisem-me no lançamento"}</T></button>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-primary" disabled={status === "sending"} />
              <span><T>{"Quero receber por email o aviso de lançamento da Hybrid Hub. Posso cancelar a qualquer momento por resposta ao email."}</T></span>
            </label>
            <FormProtection {...websiteForm.protection} language={language} />
            <p id="launch-privacy" className="mt-3 text-sm text-muted-foreground"><T>{"Consulta a "}</T><Link to="/privacidade" className="text-primary underline underline-offset-4"><T>{"Política de Privacidade"}</T></Link><T>{" para saberes como tratamos os teus dados."}</T></p>
            <p id="launch-feedback" role={status === "error" ? "alert" : "status"} className="mt-4 text-sm text-foreground"><T>{status === "error" ? "Não foi possível enviar o pedido. O teu email continua no campo; tenta novamente ou contacta hybridhubadmin@gmail.com." : ""}</T></p>
          </form>
        )}</T>
      </div>
    </section>
  );
}
