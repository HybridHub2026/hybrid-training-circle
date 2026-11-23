import { useEffect, useState, type FormEvent } from "react";

type Campaign = {
  reserved: number;
  launchedAt: number | null;
  expiresAt: number | null;
  reservations: {
    slot: number;
    code: string;
    email: string | null;
    claimed_at: number;
    redeemed_at: number | null;
    order_reference: string | null;
  }[];
};
const field = "mt-2 block w-full rounded-sm border border-border bg-background px-4 py-3";
const date = (timestamp: number) =>
  new Date(timestamp).toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
    dateStyle: "short",
    timeStyle: "short",
  });
export function CampaignManager({
  onUnauthorized,
  onLogout,
}: {
  onUnauthorized: () => void;
  onLogout: () => void;
}) {
  const [data, setData] = useState<Campaign | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin?action=campaign", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          onUnauthorized();
          return;
        }
        if (!response.ok) throw new Error("Não foi possível carregar as reservas.");
        setData(await response.json());
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message);
      });
    return () => controller.abort();
  }, [refresh, onUnauthorized]);
  async function submit(
    event: FormEvent<HTMLFormElement>,
    action: "campaign-start" | "campaign-redeem",
  ) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget,
      fields = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const body =
        action === "campaign-start"
          ? {
              action,
              launchedAt: new Date(String(fields.get("launch"))).toISOString(),
              confirmed: fields.get("confirmed") === "on",
            }
          : {
              action,
              code: fields.get("code"),
              orderReference: fields.get("order"),
              personConfirmed: fields.get("confirmed") === "on",
            };
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message ?? "Não foi possível guardar. Confirma os campos e tenta novamente.",
        );
      form.reset();
      setRefresh((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl">OFERTA BUCKET HAT</h2>
        <div className="flex gap-3">
          <button className="btn-outline" onClick={() => setRefresh((value) => value + 1)}>
            Atualizar
          </button>
          <button className="btn-outline" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Primeiros 100 inscritos nesta campanha. Uma oferta por pessoa, uma utilização, na primeira
        compra de qualquer produto (exceto bucket hats). As inscrições anteriores só entram na campanha se voltarem a
        preencher o formulário com o novo consentimento.
      </p>
      {error && (
        <p role="alert" className="border border-primary p-4">
          {error}
        </p>
      )}
      {!data ? (
        <p role="status">A carregar…</p>
      ) : (
        <>
          <div className="rounded-sm border border-primary p-5">
            <strong className="text-3xl text-primary">{data.reserved}/100</strong>
            <p className="mt-2">
              reservas · {data.reservations.filter((row) => row.redeemed_at !== null).length}{" "}
              utilizadas
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.launchedAt === null
                ? "O prazo ainda não começou. Não há produtos à venda."
                : `Lançamento: ${date(data.launchedAt)} · Termina: ${date(data.expiresAt!)}`}
            </p>
          </div>
          {data.launchedAt === null && (
            <form
              className="rounded-sm border border-border p-5"
              onSubmit={(event) => submit(event, "campaign-start")}
            >
              <h3 className="text-lg">INICIAR O PRAZO DE 60 DIAS</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Define apenas quando o merchandising estiver pronto para venda. A data fica fixa e
                será enviado um aviso automático aos titulares de uma reserva na abertura.
              </p>
              <label className="mt-4 block">
                Data e hora de lançamento (hora do teu dispositivo)
                <input
                  name="launch"
                  type="datetime-local"
                  className={field}
                  required
                  disabled={busy}
                />
              </label>
              <label className="mt-4 flex gap-3 text-sm">
                <input type="checkbox" name="confirmed" required disabled={busy} />
                Confirmo a data de abertura das vendas e o início do prazo da oferta.
              </label>
              <button className="btn-primary mt-5" disabled={busy}>
                Guardar data de lançamento
              </button>
            </form>
          )}
          <form
            onSubmit={(event) => submit(event, "campaign-redeem")}
            className="rounded-sm border border-border p-5"
          >
            <h3 className="text-lg">REGISTAR UTILIZAÇÃO</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                Código individual
                <input
                  name="code"
                  className={field}
                  placeholder="HH-…"
                  required
                  maxLength={15}
                  disabled={busy}
                />
              </label>
              <label>
                Referência da encomenda
                <input name="order" className={field} required maxLength={100} disabled={busy} />
              </label>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <input type="checkbox" name="confirmed" required disabled={busy} className="mt-1" />
              Verifiquei a compra de um produto (exceto bucket hats), que esta pessoa ainda não recebeu
              a oferta (mesmo usando outro email) e que será entregue apenas um bucket hat.
            </label>
            <button
              className="btn-primary mt-5"
              disabled={
                busy ||
                data.launchedAt === null ||
                Date.now() < data.launchedAt ||
                Date.now() >= data.expiresAt!
              }
            >
              Confirmar utilização única
            </button>
          </form>
          <div className="space-y-3">
            {data.reservations.map((row) => (
              <article key={row.slot} className="rounded-sm border border-border p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <strong className="font-mono text-primary">{row.code}</strong>
                  <span className="text-sm">{row.redeemed_at ? "Utilizada" : data.expiresAt!==null && Date.now()>=data.expiresAt ? "Expirada" : "Reservada"}</span>
                </div>
                <p className="mt-2 break-all">{row.email ?? "Inscrição removida"}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Reserva {row.slot} · {date(row.claimed_at)}
                  {row.redeemed_at
                    ? ` · Utilizada: ${date(row.redeemed_at)} · Encomenda: ${row.order_reference}`
                    : ""}
                </p>
              </article>
            ))}
            {data.reservations.length === 0 && (
              <p className="text-muted-foreground">Ainda não há reservas nesta campanha.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
