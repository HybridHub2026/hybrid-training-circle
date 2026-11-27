import { useState } from "react";
import { FilePlus2, ArrowRight } from "lucide-react";

export function ApplicationDraftButton({
  id,
  profileId,
  onCreated,
  onUnauthorized,
}: {
  id: string;
  profileId?: string | undefined;
  onCreated: (id: string, message: string) => void;
  onUnauthorized: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function create() {
    if (profileId) {
      onCreated(profileId, "Este pedido já tem um perfil. Revê os dados antes de publicar.");
      return;
    }
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile-from-application", submissionId: id }),
      });
      if (response.status === 401) {
        onUnauthorized();
        throw new Error("A sessão terminou. Volta a entrar.");
      }
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message ?? "Não foi possível criar o rascunho. O pedido continua guardado.",
        );
      onCreated(data.profileId, data.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar o rascunho.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-primary px-4 py-3 text-sm text-primary disabled:opacity-50"
      >
        {profileId ? <ArrowRight size={16} /> : <FilePlus2 size={16} />}
        {busy
          ? "A criar rascunho…"
          : profileId
            ? "Abrir perfil existente"
            : "Criar perfil em rascunho"}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        Copia os dados e a imagem para revisão. Não publica nada automaticamente.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
