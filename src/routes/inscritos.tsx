import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Download, LogOut, LockKeyhole, Search, Users } from "lucide-react";
import wordmark from "@/assets/hybrid-hub-wordmark.webp";
import { FormProtection, useWebsiteForm } from "@/components/site/WebsiteForm";
import { ProfileManager } from "@/components/site/ProfileManager";
import { CampaignManager } from "@/components/site/CampaignManager";

export const Route = createFileRoute("/inscritos")({
  head: () => ({ meta: [{ title: "Inscritos | Hybrid Hub — área privada" }, { name: "robots", content: "noindex, nofollow, noarchive" }, { name: "referrer", content: "no-referrer" }] }),
  component: SubscribersPage,
});

type Subscriber = { id?: string; name?: string; subject?: string; message?: string; email: string; language: string; created_at: number };
type List = { subscribers: Subscriber[]; total: number; page: number; pageSize: number };
const field = "w-full rounded-sm border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none";
const languages: Record<string, string> = { pt: "Português", es: "Espanhol", en: "Inglês" };
const empty: List = { subscribers: [], total: 0, page: 1, pageSize: 50 };
const isTest = (email: string) => email.startsWith("hybridhubadmin+") && /\+(?:launch|contact)-(?:pt|es|en)@gmail\.com$/.test(email);
const dateLabel = (timestamp: number) => new Date(timestamp).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon", dateStyle: "short", timeStyle: "short" });

function SubscribersPage() {
  const form = useWebsiteForm();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [expiresAt, setExpiresAt] = useState(0);
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("");
  const [tests, setTests] = useState(false);
  const [group, setGroup] = useState("launch");
  const [page, setPage] = useState(1);
  const [list, setList] = useState<List>(empty);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  function clearAccess() { setAuthenticated(false); setExpiresAt(0); setList(empty); setChallenge(""); setCode(""); }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin", { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error();
      const data = await response.json(); setAuthenticated(data.authenticated === true); setExpiresAt(data.expiresAt ?? 0);
    }).catch(() => { if (!controller.signal.aborted) setError("Não foi possível verificar o acesso. Atualiza a página para tentar novamente."); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => { const timer = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300); return () => clearTimeout(timer); }, [q]);
  useEffect(() => {
    if (!authenticated || !expiresAt) return;
    const timer = setTimeout(() => { clearAccess(); setError("A sessão terminou. Pede um novo código para voltar a entrar."); }, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [authenticated, expiresAt]);
  const filters = new URLSearchParams({ q: query, language, group, tests: tests ? "1" : "0" });
  const filterString = filters.toString();
  useEffect(() => {
    if (!authenticated || group === "profiles" || group === "campaign") return;
    const controller = new AbortController(); setLoading(true); setError(""); setList(empty);
    fetch(`/api/admin?action=list&page=${page}&${filterString}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (response.status === 401) { clearAccess(); throw new Error("A sessão terminou. Pede um novo código."); }
      if (!response.ok) throw new Error("Não foi possível carregar a lista. Tenta atualizar.");
      setList(await response.json());
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [authenticated, page, filterString, refresh]);

  async function login(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(25000), body: JSON.stringify(challenge ? { action: "verify", challenge, code } : { action: "request", token: form.token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === "invalid_code" ? "O código está incorreto, expirou ou atingiu o limite de tentativas. Confirma os 8 algarismos ou pede um novo código." : data.error === "rate_limited" ? "Aguarda pelo menos um minuto antes de pedir outro código. Se atingiste o limite diário, tenta amanhã." : "Não foi possível concluir o acesso. Tenta novamente dentro de um minuto.");
      if (challenge) { setCode(""); setChallenge(""); setAuthenticated(true); setExpiresAt(data.expiresAt); }
      else setChallenge(data.challenge);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível entrar. Tenta novamente."); }
    finally { setBusy(false); if (!challenge) form.resetProtection(); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); if (!response.ok) throw new Error(); clearAccess(); }
    catch { setError("Não foi possível terminar a sessão. Tenta novamente."); }
    finally { setBusy(false); }
  }
  async function download() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin?action=export&${filterString}`, { cache: "no-store" });
      if (response.status === 401) { clearAccess(); throw new Error("A sessão terminou. Volta a entrar para exportar."); }
      if (!response.ok) throw new Error(response.status === 422 ? "A lista tem mais de 10 000 inscrições. Usa os filtros para exportar uma lista mais pequena." : "Não foi possível exportar. Tenta novamente.");
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `hybrid-hub-inscritos-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível exportar."); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><a href="/" aria-label="Ir para o site Hybrid Hub"><img src={wordmark} alt="Hybrid Hub" className="w-40" /></a><span className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><LockKeyhole size={14} />Área privada</span></div></header>
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <p className="eyebrow">Hybrid Hub</p><h1 className="mt-3 text-3xl md:text-5xl">LISTA DE <span className="text-primary">INSCRITOS.</span></h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Consulta as inscrições e gere os perfis públicos dos coaches e comunidades.</p>
      {checking ? <p role="status" className="mt-10">A verificar o acesso…</p> : !authenticated ? <div className="mt-9 max-w-lg rounded-sm border border-border bg-card p-6 md:p-8">
        <h2 className="text-xl">{challenge ? "CONFIRMA O TEU ACESSO" : "ENTRA COM O TEU EMAIL"}</h2>
        <p className="mt-4 break-words text-sm leading-relaxed text-muted-foreground">{challenge ? "Enviámos um código para hybridhubadmin@gmail.com. Introduz os 8 algarismos abaixo. O código é válido durante 10 minutos. Verifica também o spam." : "O código de acesso será enviado apenas para hybridhubadmin@gmail.com. Não precisas de criar uma palavra-passe."}</p>
        <form className="mt-6" onSubmit={login}>
          {challenge ? <><label htmlFor="access-code" className="mb-2 block text-sm">Código de acesso</label><input id="access-code" className={`${field} tracking-[0.25em]`} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} required autoFocus disabled={busy} /></> : <FormProtection {...form.protection} language="pt" />}
          <button className="btn-primary mt-5 w-full disabled:opacity-50" disabled={busy || (challenge ? code.length !== 8 : !form.ready)}>{busy ? "Aguarda…" : challenge ? "Entrar" : "Enviar código de acesso"}</button>
        </form>
        {challenge && <button className="mt-5 text-sm text-primary underline" disabled={busy} onClick={() => { setChallenge(""); setCode(""); setError(""); form.resetProtection(); }}>Pedir um novo código</button>}
        <p className="mt-5 text-xs text-muted-foreground">A sessão termina ao fim de uma hora. Não partilhes o código de acesso.</p>
      </div> : <>
        <div className="mt-7 flex flex-wrap gap-3" role="group" aria-label="Lista a consultar">{([["launch", "Aviso de lançamento"], ["partners", "Coaches e comunidades"], ["profiles", "Gerir perfis públicos"], ["campaign", "Oferta bucket hat"]] as const).map(([value, label]) => <button key={value} aria-pressed={group === value} className={`min-h-11 rounded-sm border px-4 py-3 text-sm ${group === value ? "border-primary text-primary" : "border-border"}`} onClick={() => { setGroup(value); setPage(1); setList(empty); }}>{label}</button>)}</div>
        {group === "profiles" ? <ProfileManager onUnauthorized={clearAccess} onLogout={logout} /> : group === "campaign" ? <CampaignManager onUnauthorized={clearAccess} onLogout={logout} /> : <>
        <div className="mt-9 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Users className="text-primary" /><p><strong className="text-3xl">{loading ? "…" : list.total}</strong><span className="ml-2 text-muted-foreground">{query || language || tests ? "inscrições nesta vista" : "inscrições reais"}</span></p></div><div className="flex flex-wrap gap-3"><button onClick={() => setRefresh(value => value + 1)} className="rounded-sm border border-border px-4 py-3 text-sm" disabled={loading}>Atualizar</button><button onClick={download} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50" disabled={busy || loading || !list.total}><Download size={16} />Exportar para Excel</button><button onClick={logout} className="flex items-center gap-2 rounded-sm border border-border px-4 py-3 text-sm" disabled={busy}><LogOut size={16} />Sair</button></div></div>
        <div className="mt-7 grid gap-4 md:grid-cols-[1fr_220px]"><div><label htmlFor="subscriber-search" className="mb-2 flex items-center gap-2 text-sm"><Search size={14} />Pesquisar por email</label><input id="subscriber-search" type="search" className={field} value={q} maxLength={254} onChange={event => setQ(event.target.value)} placeholder="Escreve parte do email" /></div><div><label htmlFor="subscriber-language" className="mb-2 block text-sm">Idioma</label><select id="subscriber-language" className={field} value={language} onChange={event => { setLanguage(event.target.value); setPage(1); }}><option value="">Todos os idiomas</option><option value="pt">Português</option><option value="es">Espanhol</option><option value="en">Inglês</option></select></div></div>
        <label className="mt-5 flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" className="h-4 w-4 accent-primary" checked={tests} onChange={event => { setTests(event.target.checked); setPage(1); }} />Incluir inscrições de teste</label>
        <div className="mt-6 overflow-hidden rounded-sm border border-border" aria-busy={loading}>
          {group === "launch" && <table className="hidden w-full text-left text-sm md:table"><thead className="bg-card text-muted-foreground"><tr><th scope="col" className="p-4">Email</th><th scope="col" className="p-4">Idioma</th><th scope="col" className="p-4">Inscrição</th></tr></thead><tbody>{list.subscribers.map(row => <tr key={row.email} className="border-t border-border"><td className="p-4 break-all">{row.email}{isTest(row.email) && <span className="ml-2 text-xs text-primary">Teste</span>}</td><td className="p-4">{languages[row.language]}</td><td className="whitespace-nowrap p-4">{dateLabel(row.created_at)}</td></tr>)}</tbody></table>}
          <div className={`divide-y divide-border ${group === "launch" ? "md:hidden" : ""}`}>{list.subscribers.map(row => <article key={row.id ?? row.email} className="p-4">{row.name && <h2 className="text-lg">{row.name}</h2>}{row.subject && <p className="mt-1 text-sm text-primary">{row.subject.replace("[Participação] ", "")}</p>}<p className="mt-1 break-all text-sm">{row.email}</p>{row.message && <details className="mt-4 text-sm"><summary className="cursor-pointer py-2 text-primary">Ver respostas</summary><p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{row.message}</p></details>}{isTest(row.email) && <p className="mt-1 text-xs text-primary">Inscrição de teste</p>}<dl className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground"><div><dt className="sr-only">Idioma</dt><dd>{languages[row.language]}</dd></div><div><dt className="sr-only">Inscrição</dt><dd>{dateLabel(row.created_at)}</dd></div></dl></article>)}</div>
          {!list.subscribers.length && <p role="status" className="p-6 text-sm text-muted-foreground">{loading ? "A carregar inscritos…" : query || language ? "Nenhuma inscrição corresponde aos filtros." : "Ainda não há inscrições nesta lista. As inscrições de teste estão ocultas por defeito."}</p>}
        </div>
        {list.total > list.pageSize && <div className="mt-5 flex items-center justify-between gap-3 text-sm"><button className="rounded-sm border border-border px-4 py-2 disabled:opacity-40" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page} de {Math.ceil(list.total / list.pageSize)}</span><button className="rounded-sm border border-border px-4 py-2 disabled:opacity-40" disabled={loading || page * list.pageSize >= list.total} onClick={() => setPage(value => value + 1)}>Seguinte</button></div>}
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Datas na hora de Lisboa. O ficheiro CSV abre no Excel e inclui a lista e os filtros escolhidos. As inscrições antigas do Formspree continuam nessa conta. Os pedidos de coaches e comunidades são manifestações de interesse; os perfis só devem ser publicados após confirmação com cada pessoa.</p>
        </>}
      </>}
      {error && <p role="alert" className="mt-5 max-w-2xl rounded-sm border border-primary/40 p-4 text-sm">{error}</p>}
    </section>
  </div>;
}
