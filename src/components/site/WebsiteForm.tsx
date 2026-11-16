import { useEffect, useRef, useState } from "react";
import { Localized, T } from "@/i18n";
import type { Language } from "@/i18n/language";

type TurnstileApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
let loading: Promise<void> | undefined;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => { loading = undefined; script.remove(); reject(new Error("verification_unavailable")); }, { once: true });
    document.head.appendChild(script);
  });
  return loading;
}

export function useWebsiteForm() {
  const [siteKey, setSiteKey] = useState("");
  const [configurationError, setConfigurationError] = useState(false);
  const [token, setToken] = useState("");
  const [resetNonce, setResetNonce] = useState(0);
  const requestId = useRef<string | null>(null);
  const requestContent = useRef("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/forms", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("service_unavailable");
        const config = await response.json() as { ready?: boolean; siteKey?: string };
        if (!config.ready || !config.siteKey) throw new Error("service_unavailable");
        setSiteKey(config.siteKey);
      })
      .catch(() => { if (!controller.signal.aborted) setConfigurationError(true); });
    return () => controller.abort();
  }, []);
  async function submit(payload: Record<string, unknown>) {
    if (!token || !siteKey) throw new Error("verification_required");
    const content = JSON.stringify(payload);
    if (requestContent.current !== content) { requestId.current = null; requestContent.current = content; }
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({ ...payload, id: requestId.current, token }),
      });
      if (!response.ok) throw new Error("submission_failed");
      const result = await response.json() as { accepted?: boolean };
      if (result.accepted !== true) throw new Error("submission_failed");
      requestId.current = null;
    } finally {
      setToken("");
      setResetNonce(value => value + 1);
    }
  }
  return { submit, token, ready: Boolean(token && siteKey), resetProtection: () => { setToken(""); setResetNonce(value => value + 1); }, protection: { siteKey, configurationError, resetNonce, onToken: setToken } };
}

export function FormProtection({ siteKey, configurationError, resetNonce, onToken, language }: {
  siteKey: string;
  configurationError: boolean;
  resetNonce: number;
  onToken: (token: string) => void;
  language: Language;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    onToken("");
    if (!siteKey) return;
    let disposed = false;
    let widget: string | undefined;
    setFailed(false);
    loadTurnstile().then(() => {
      if (disposed || !container.current || !window.turnstile) return;
      widget = window.turnstile.render(container.current, {
        sitekey: siteKey, action: "website-form", theme: "dark", language, size: "flexible",
        callback: (value: string) => onToken(value),
        "expired-callback": () => onToken(""),
        "error-callback": () => { onToken(""); setFailed(true); },
      });
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; if (widget && window.turnstile) window.turnstile.remove(widget); };
  }, [siteKey, resetNonce, language, onToken]);
  return <div className="mt-5">
    <Localized as="div" aria-label="Verificação de segurança" className="min-h-16 max-w-full"><div ref={container} /></Localized>
    {(configurationError || failed) && <p role="alert" className="mt-2 text-sm text-muted-foreground"><T>{"Não foi possível preparar o formulário. Atualiza a página ou contacta-nos por email."}</T></p>}
  </div>;
}
