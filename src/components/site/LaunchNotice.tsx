import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

const LAUNCH_FORM_ENDPOINT = "https://formspree.io/f/mwlovnjz";

export function LaunchNotice() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!LAUNCH_FORM_ENDPOINT || status === "sending") return;
    const fields = new FormData(event.currentTarget);
    if (fields.get("_gotcha")) return;
    setStatus("sending");
    try {
      const response = await fetch(LAUNCH_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ email, finalidade: "Aviso de lançamento da app Hybrid Hub", consentimento: "Quero receber por email o aviso de lançamento. Posso cancelar por resposta ao email." }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="aviso-lancamento" className="scroll-mt-24 border-y border-border bg-muted">
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16">
        <p className="eyebrow">App em preparação · iOS e Android</p>
        <h2 className="mt-4 text-3xl md:text-5xl">A TUA PRÓXIMA LIGAÇÃO <span className="text-primary">ESTÁ A CHEGAR.</span></h2>
        <p className="mt-5 text-muted-foreground md:text-lg">Deixa o teu email para receberes o aviso quando a app Hybrid Hub estiver disponível.</p>
        {status === "success" ? (
          <div className="mt-8 rounded-sm border border-primary p-6" role="status">
            <p className="font-semibold">O teu pedido foi recebido!</p>
            <p className="mt-2 text-muted-foreground">Vamos avisar-te neste email quando a app estiver disponível. Obrigado por fazeres parte deste início.</p>
          </div>
        ) : (
          <form onSubmit={subscribe} action={LAUNCH_FORM_ENDPOINT} method="POST" className="mt-8">
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label htmlFor="launch-email" className="text-sm font-medium">O teu email</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input id="launch-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.pt" className="min-h-12 min-w-0 flex-1 rounded-sm border border-border bg-background px-4 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-describedby="launch-privacy launch-feedback" disabled={status === "sending"} />
              <button type="submit" className="btn-primary min-h-12 disabled:cursor-wait disabled:opacity-60" disabled={!LAUNCH_FORM_ENDPOINT || status === "sending"}>{status === "sending" ? "A enviar…" : "Avisem-me no lançamento"}</button>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-primary" disabled={status === "sending"} />
              <span>Quero receber por email o aviso de lançamento da Hybrid Hub. Posso cancelar a qualquer momento por resposta ao email.</span>
            </label>
            <p id="launch-privacy" className="mt-3 text-sm text-muted-foreground">Consulta a <Link to="/privacidade" className="text-primary underline underline-offset-4">Política de Privacidade</Link> para saberes como tratamos os teus dados.</p>
            <p id="launch-feedback" role={status === "error" ? "alert" : "status"} className="mt-4 text-sm text-foreground">{status === "error" ? "Não foi possível enviar o pedido. O teu email continua no campo; tenta novamente ou contacta hybridhubadmin@gmail.com." : !LAUNCH_FORM_ENDPOINT ? "As inscrições estarão disponíveis em breve." : ""}</p>
          </form>
        )}
      </div>
    </section>
  );
}
