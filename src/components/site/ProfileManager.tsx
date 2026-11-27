import { useEffect, useState, type FormEvent } from "react";
import { Plus, Eye, Save, Upload, ArchiveRestore, Archive, LogOut, Languages } from "lucide-react";
import {
  emptyProfile,
  profileLanguages,
  publicationErrors,
  pendingTranslationReviews,
  translationReviewState,
  translationComplete,
  type ProfileData,
  type ManagedProfile,
} from "@/lib/profile-data";
import { ProfileCard } from "./ProfileCard";
import type { MemberProfile } from "./member-profiles";
import type { Language } from "@/i18n/language";
import { DirectoryPreview } from "./DirectoryPreview";

const field =
  "mt-2 w-full rounded-sm border border-border bg-background px-3 py-3 text-base focus:border-primary focus:outline-none";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-sm disabled:opacity-50";
const labels = { pt: "Português", es: "Espanhol", en: "Inglês" };
const translationLanguages = ["es", "en"] as const;
function hasPortuguese(data: ProfileData) {
  return !!(
    data.country.pt.trim() &&
    data.description.pt.trim() &&
    data.sports.pt.some((value) => value.trim())
  );
}
function translationFields(data: ProfileData, replace: boolean) {
  return Object.fromEntries(
    translationLanguages.map((language) => [
      language,
      {
        country: replace || !data.country[language].trim(),
        description: replace || !data.description[language].trim(),
        sports: replace || !data.sports[language].some((value) => value.trim()),
        imageAlt:
          !!data.imageId &&
          !!data.imageAlt.pt.trim() &&
          (replace || !data.imageAlt[language].trim()),
      },
    ]),
  ) as Record<"es" | "en", Record<"country" | "description" | "sports" | "imageAlt", boolean>>;
}
function needsTranslation(data: ProfileData) {
  return Object.values(translationFields(data, false)).some((fields) =>
    Object.values(fields).some(Boolean),
  );
}
function hasOtherTexts(data: ProfileData) {
  return translationLanguages.some(
    (language) =>
      data.country[language].trim() ||
      data.description[language].trim() ||
      data.sports[language].some((value) => value.trim()) ||
      data.imageAlt[language].trim(),
  );
}
function status(profile: ManagedProfile) {
  return profile.archivedAt
    ? "Arquivado"
    : profile.publishedData
      ? JSON.stringify(profile.data) === JSON.stringify(profile.publishedData)
        ? "Publicado"
        : "Publicado · alterações em rascunho"
      : "Rascunho";
}

export function ProfileManager({
  onUnauthorized,
  onLogout,
}: {
  onUnauthorized: () => void;
  onLogout: () => Promise<void>;
}) {
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [directoryPreview, setDirectoryPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [editor, setEditor] = useState<{
    id: string;
    current: ManagedProfile | null;
    data: ProfileData;
  } | null>(null);
  const [language, setLanguage] = useState<Language>("pt");
  const [permission, setPermission] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [overwritePrompt, setOverwritePrompt] = useState(false);
  const dirty =
    !!editor &&
    (!editor.current || JSON.stringify(editor.data) !== JSON.stringify(editor.current.data));
  const incomplete = editor ? publicationErrors(editor.data) : [];
  const pendingReviews = editor
    ? pendingTranslationReviews(editor.data, editor.current?.translationReviews)
    : [];
  const portugueseChanged =
    !!editor &&
    translationLanguages.some(
      (lang) =>
        translationReviewState(editor.data, lang, editor.current?.translationReviews?.[lang]) ===
        "outdated",
    );

  async function api(body?: unknown) {
    const response = await fetch(body ? "/api/admin" : "/api/admin?action=profiles", {
      method: body ? "POST" : "GET",
      cache: "no-store",
      ...(body
        ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
        : {}),
    });
    if (response.status === 401) {
      onUnauthorized();
      throw new Error("A sessão terminou. Volta a entrar.");
    }
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.message ?? "Não foi possível concluir. Atualiza a lista e tenta novamente.",
      );
    return data;
  }
  useEffect(() => {
    let active = true;
    api()
      .then((data) => {
        if (active) setProfiles(data.profiles);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function update(next: Partial<ProfileData>) {
    setEditor((value) => (value ? { ...value, data: { ...value.data, ...next } } : value));
    setPermission(false);
    setMessage("");
  }
  function open(profile?: ManagedProfile) {
    if (dirty && !window.confirm("Descartar as alterações que ainda não guardaste?")) return;
    setEditor({
      id: profile?.id ?? crypto.randomUUID(),
      current: profile ?? null,
      data: profile ? structuredClone(profile.data) : emptyProfile(),
    });
    setPermission(false);
    setLanguage("pt");
    setMessage("");
    setError("");
    setOverwritePrompt(false);
  }
  function record(saved: ManagedProfile) {
    setProfiles((current) => [saved, ...current.filter((profile) => profile.id !== saved.id)]);
    setEditor((current) =>
      current?.id === saved.id
        ? { id: saved.id, current: saved, data: structuredClone(saved.data) }
        : current,
    );
    setPermission(false);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let next = editor.data;
      let translationError = "";
      let translated = false;
      if (autoTranslate && hasPortuguese(next) && needsTranslation(next)) {
        setTranslating(true);
        try {
          next = await translatedData(next, false);
          update(next);
          translated = true;
        } catch (reason) {
          translationError =
            reason instanceof Error ? reason.message : "A tradução automática está indisponível.";
        } finally {
          setTranslating(false);
        }
      }
      const data = await api({
        action: "profile-save",
        id: editor.id,
        revision: editor.current?.revision ?? 0,
        data: next,
      });
      record(data.profile);
      setMessage(
        translated
          ? "Rascunho guardado com traduções automáticas. Revê e ajusta os textos em espanhol e inglês antes de publicar."
          : "Rascunho guardado. A versão pública só muda quando carregares em Publicar.",
      );
      if (translated) setLanguage("es");
      if (translationError)
        setError(
          `O rascunho foi guardado, mas não foi possível preencher as traduções. ${translationError}`,
        );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  async function translatedData(data: ProfileData, replace: boolean): Promise<ProfileData> {
    const result = await api({
      action: "profile-translate",
      source: {
        country: data.country.pt,
        description: data.description.pt,
        sports: data.sports.pt.map((value) => value.trim()).filter(Boolean),
        imageAlt: data.imageAlt.pt,
      },
      fields: translationFields(data, replace),
    });
    const next = structuredClone(data);
    for (const language of translationLanguages) {
      const text = result.translations[language] as Partial<{
        country: string;
        description: string;
        sports: string[];
        imageAlt: string;
      }>;
      if (text.country !== undefined) next.country[language] = text.country;
      if (text.description !== undefined) next.description[language] = text.description;
      if (text.sports !== undefined) next.sports[language] = text.sports;
      if (text.imageAlt !== undefined) next.imageAlt[language] = text.imageAlt;
    }
    return next;
  }
  async function generateTranslations(confirmed = false) {
    if (!editor || busy || !hasPortuguese(editor.data)) return;
    if (!confirmed && hasOtherTexts(editor.data)) {
      setOverwritePrompt(true);
      return;
    }
    setOverwritePrompt(false);
    setBusy(true);
    setTranslating(true);
    setError("");
    setMessage("");
    try {
      update(await translatedData(editor.data, true));
      setLanguage("es");
      setMessage(
        "Traduções geradas. Revê espanhol e inglês e guarda o rascunho. Nada foi publicado.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível traduzir. Os textos anteriores foram mantidos.",
      );
    } finally {
      setBusy(false);
      setTranslating(false);
    }
  }
  async function action(profile: ManagedProfile, action: string, reviewLanguage?: "es" | "en") {
    if (busy) return;
    if (
      action !== "profile-publish" &&
      dirty &&
      !window.confirm("Continuar sem guardar as alterações do editor?")
    )
      return;
    if (
      action === "profile-archive" &&
      !window.confirm(
        `Arquivar «${profile.data.name || "Sem nome"}»? O perfil sai do site e pode ser recuperado depois.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api({
        action,
        id: profile.id,
        revision: profile.revision,
        ...(action === "profile-publish" ? { permission } : {}),
        ...(action === "profile-review" ? { language: reviewLanguage } : {}),
      });
      record(data.profile);
      setMessage(
        action === "profile-review"
          ? `Tradução de ${reviewLanguage === "es" ? "espanhol" : "inglês"} marcada como revista.`
          : action === "profile-publish"
            ? "Perfil publicado nos três idiomas. Atualiza a página pública para ver o resultado."
            : action === "profile-unpublish"
              ? "Perfil retirado da página pública. O rascunho continua guardado."
              : action === "profile-restore"
                ? "Perfil recuperado como rascunho."
                : "Perfil arquivado e retirado do site.",
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível alterar o perfil.");
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    if (dirty && !window.confirm("Atualizar a lista e descartar as alterações não guardadas?"))
      return;
    setLoading(true);
    setError("");
    try {
      const data = await api();
      setProfiles(data.profiles);
      setEditor(null);
      setPermission(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  }
  async function upload(file: File) {
    if (!editor) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 15 * 1024 * 1024
    ) {
      setError("Escolhe uma fotografia JPG, PNG ou WebP até 15 MB.");
      return;
    }
    setBusy(true);
    setError("");
    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível preparar a imagem.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("Não foi possível preparar a imagem.")),
          "image/webp",
          0.82,
        ),
      );
      if (blob.size > 800000)
        throw new Error("A imagem tem demasiados detalhes. Escolhe uma fotografia mais pequena.");
      const response = await fetch("/api/profile-images", {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (response.status === 401) {
        onUnauthorized();
        throw new Error("A sessão terminou. Volta a entrar.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Não foi possível carregar a imagem.");
      update({ imageId: result.id });
      setMessage("Imagem carregada. Guarda o rascunho para a associar ao perfil.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar a imagem.");
    } finally {
      bitmap?.close();
      setBusy(false);
    }
  }
  const visible = profiles.filter(
    (profile) =>
      (filter === "archived"
        ? !!profile.archivedAt
        : !profile.archivedAt &&
          (filter === "published"
            ? !!profile.publishedData
            : filter === "draft"
              ? !profile.publishedData
              : true)) &&
      `${profile.data.name} ${profile.data.city}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const preview: MemberProfile | null = editor
    ? {
        id: editor.id,
        kind: editor.data.kind,
        city: editor.data.city,
        country: editor.data.country,
        description: editor.data.description,
        sports: editor.data.sports,
        name: editor.data.name || "Nome do perfil",
        ...(editor.data.imageId
          ? {
              image: {
                src: `/api/profile-images?id=${editor.data.imageId}&preview=1`,
                alt: editor.data.imageAlt,
              },
            }
          : {}),
        ...(editor.data.instagram
          ? { instagram: editor.data.instagram as `https://${string}` }
          : {}),
        ...(editor.data.website ? { website: editor.data.website as `https://${string}` } : {}),
      }
    : null;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl md:text-3xl">PERFIS PÚBLICOS</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Cria e gere os coaches e comunidades de «Quem já faz parte». As candidaturas recebidas
            continuam separadas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className={button}
            onClick={() => setDirectoryPreview(true)}
            disabled={
              busy || loading || dirty || !profiles.some((profile) => profile.archivedAt === null)
            }
            title={
              dirty
                ? "Guarda o rascunho para incluir as alterações na pré-visualização."
                : undefined
            }
          >
            <Eye size={16} />
            Pré-visualizar página
          </button>
          <button
            className="btn-primary inline-flex items-center gap-2"
            onClick={() => open()}
            disabled={busy}
          >
            <Plus size={17} />
            Adicionar perfil
          </button>
          <button className={button} onClick={refresh} disabled={busy || loading}>
            Atualizar
          </button>
          <button className={button} onClick={onLogout} disabled={busy}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
      {directoryPreview && (
        <DirectoryPreview profiles={profiles} onClose={() => setDirectoryPreview(false)} />
      )}
      {message && (
        <p role="status" className="mt-5 border border-primary/50 p-4 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 border border-destructive p-4 text-sm">
          {error}
        </p>
      )}
      {editor && (
        <div className="mt-7 rounded-sm border border-primary/50 bg-card p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl">{editor.current ? "EDITAR PERFIL" : "NOVO PERFIL"}</h3>
            <button
              className={button}
              disabled={busy}
              onClick={() => {
                if (!dirty || window.confirm("Descartar as alterações não guardadas?"))
                  setEditor(null);
              }}
            >
              Fechar editor
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {editor.current ? status(editor.current) : "Rascunho privado"}. Guardar mantém o
            rascunho privado; publicar atualiza o site.
          </p>
          <form
            onSubmit={save}
            className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)]"
          >
            <fieldset className="min-w-0 space-y-5" disabled={busy || !!editor.current?.archivedAt}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm">
                  Tipo
                  <select
                    className={field}
                    value={editor.data.kind}
                    onChange={(event) =>
                      update({ kind: event.target.value as ProfileData["kind"] })
                    }
                  >
                    <option value="coach">PT / coach</option>
                    <option value="community">Comunidade</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Nome
                  <input
                    className={field}
                    maxLength={100}
                    value={editor.data.name}
                    onChange={(event) => update({ name: event.target.value })}
                  />
                </label>
              </div>
              <label className="block text-sm">
                Cidade
                <input
                  className={field}
                  maxLength={100}
                  value={editor.data.city}
                  onChange={(event) => update({ city: event.target.value })}
                />
              </label>
              <div className="rounded-sm border border-border p-4">
                <p className="text-sm">Fotografia ou logótipo (opcional)</p>
                <label className={`${button} mt-3 cursor-pointer`}>
                  <Upload size={16} />
                  Carregar imagem
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  JPG, PNG ou WebP até 15 MB. A imagem é ajustada automaticamente para o site.
                </p>
                {editor.data.imageId && (
                  <button
                    type="button"
                    className="mt-3 py-2 text-sm text-primary underline"
                    onClick={() => update({ imageId: null })}
                  >
                    Retirar imagem do rascunho
                  </button>
                )}
              </div>
              <div className="rounded-sm border border-primary/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Languages size={17} className="shrink-0 text-primary" />
                  Tradução automática
                </p>
                <label className="mt-3 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                    checked={autoTranslate}
                    onChange={(event) => setAutoTranslate(event.target.checked)}
                  />
                  <span>Traduzir os campos vazios de espanhol e inglês ao guardar.</span>
                </label>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Preenche país, apresentação e modalidades em português. Podes rever e editar as
                  traduções antes de publicar. Os textos já preenchidos são preservados ao guardar.
                </p>
                <button
                  type="button"
                  className={`${button} mt-4 w-full`}
                  disabled={busy || !hasPortuguese(editor.data)}
                  onClick={() => void generateTranslations()}
                >
                  {translating ? "A traduzir…" : "Traduzir PT → ES e EN"}
                </button>
                {overwritePrompt && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm">
                      Queres substituir os textos atuais de espanhol e inglês por novas traduções do
                      português? As tuas revisões nesses idiomas serão substituídas no editor.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className={button}
                        onClick={() => void generateTranslations(true)}
                      >
                        Substituir traduções
                      </button>
                      <button
                        type="button"
                        className={button}
                        onClick={() => setOverwritePrompt(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <aside
                aria-label="Revisão das traduções"
                className={`rounded-sm border p-4 text-sm ${pendingReviews.length ? "border-primary/60" : "border-border"}`}
              >
                <p className="font-semibold">
                  {portugueseChanged
                    ? "Alteraste o português. As traduções precisam de revisão."
                    : pendingReviews.length
                      ? "Há traduções por rever antes de publicar."
                      : "Traduções revistas e atualizadas."}
                </p>
                {pendingReviews.length > 0 && (
                  <p className="mt-2 text-muted-foreground">
                    Revê {pendingReviews.map((lang) => labels[lang].toLowerCase()).join(" e ")}.
                    Podes atualizar automaticamente ou editar os textos. Guarda e marca cada idioma
                    como revisto.
                  </p>
                )}
              </aside>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Idioma dos textos">
                {profileLanguages.map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    aria-pressed={language === lang}
                    aria-label={labels[lang]}
                    className={`${button} ${language === lang ? "border-primary text-primary" : ""}`}
                    onClick={() => setLanguage(lang)}
                  >
                    {labels[lang]}
                    {lang !== "pt" && (
                      <span
                        aria-hidden="true"
                        className={`text-[10px] ${pendingReviews.includes(lang) ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {translationReviewState(
                          editor.data,
                          lang,
                          editor.current?.translationReviews?.[lang],
                        ) === "outdated"
                          ? "Desatualizada"
                          : pendingReviews.includes(lang)
                            ? "Por rever"
                            : "Revista"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {language !== "pt" && (
                <div className="text-sm">
                  <button
                    type="button"
                    className={button}
                    disabled={
                      busy ||
                      dirty ||
                      !editor.current ||
                      !translationComplete(editor.data, "pt") ||
                      !translationComplete(editor.data, language) ||
                      !pendingReviews.includes(language)
                    }
                    onClick={() => void action(editor.current!, "profile-review", language)}
                  >
                    Marcar {language === "es" ? "espanhol" : "inglês"} como revisto
                  </button>
                  {dirty && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Guarda o rascunho antes de confirmar a revisão.
                    </p>
                  )}
                </div>
              )}
              <label className="block text-sm">
                País — {labels[language]}
                <input
                  className={field}
                  maxLength={100}
                  value={editor.data.country[language]}
                  onChange={(event) =>
                    update({ country: { ...editor.data.country, [language]: event.target.value } })
                  }
                />
              </label>
              <label className="block text-sm">
                Apresentação — {labels[language]}
                <textarea
                  className={field}
                  maxLength={900}
                  rows={4}
                  value={editor.data.description[language]}
                  onChange={(event) =>
                    update({
                      description: { ...editor.data.description, [language]: event.target.value },
                    })
                  }
                />
              </label>
              <label className="block text-sm">
                Modalidades — {labels[language]}
                <input
                  className={field}
                  maxLength={600}
                  value={editor.data.sports[language].join(",")}
                  onChange={(event) =>
                    update({
                      sports: {
                        ...editor.data.sports,
                        [language]: event.target.value.split(",").slice(0, 10),
                      },
                    })
                  }
                />
                <span className="mt-2 block text-xs text-muted-foreground">
                  Separa as modalidades por vírgulas (máximo 10).
                </span>
              </label>
              {editor.data.imageId && (
                <label className="block text-sm">
                  Descrição da imagem — {labels[language]}
                  <input
                    className={field}
                    maxLength={160}
                    value={editor.data.imageAlt[language]}
                    onChange={(event) =>
                      update({
                        imageAlt: { ...editor.data.imageAlt, [language]: event.target.value },
                      })
                    }
                  />
                </label>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm">
                  Instagram (opcional)
                  <input
                    className={field}
                    type="url"
                    maxLength={500}
                    placeholder="https://www.instagram.com/..."
                    value={editor.data.instagram}
                    onChange={(event) => update({ instagram: event.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  Site (opcional)
                  <input
                    className={field}
                    type="url"
                    maxLength={500}
                    placeholder="https://..."
                    value={editor.data.website}
                    onChange={(event) => update({ website: event.target.value })}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-50 sm:w-auto"
                disabled={busy}
              >
                <Save size={16} />
                {translating ? "A traduzir…" : busy ? "A guardar…" : "Guardar rascunho"}
              </button>
            </fieldset>
            <div className="min-w-0 self-start">
              <p className="mb-4 flex items-center gap-2 text-sm text-primary">
                <Eye size={16} />
                Pré-visualização — {labels[language]}
              </p>
              {preview && <ProfileCard profile={preview} languageOverride={language} />}
            </div>
          </form>
          {editor.current && !editor.current.archivedAt && (
            <div className="mt-7 border-t border-border pt-6">
              {incomplete.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Para publicar:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {incomplete.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {dirty && (
                <p className="mt-3 text-sm text-primary">Guarda o rascunho antes de publicar.</p>
              )}
              <label className="mt-5 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={permission}
                  onChange={(event) => setPermission(event.target.checked)}
                  disabled={busy || dirty || pendingReviews.length > 0}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  Confirmo que o participante autorizou a publicação destes dados e da imagem no
                  site e que revi os textos nos três idiomas.
                </span>
              </label>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn-primary disabled:opacity-50"
                  disabled={
                    busy ||
                    dirty ||
                    !permission ||
                    incomplete.length > 0 ||
                    pendingReviews.length > 0
                  }
                  onClick={() => void action(editor.current!, "profile-publish")}
                >
                  Publicar no site
                </button>
                {editor.current.publishedData && (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => void action(editor.current!, "profile-unpublish")}
                  >
                    Retirar do site
                  </button>
                )}
                <a
                  href="/quem-ja-faz-parte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={button}
                >
                  Ver página pública
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Pesquisar nome ou cidade
          <input
            type="search"
            className={field}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Estado
          <select
            className={field}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="active">Todos os ativos</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="archived">Arquivados</option>
          </select>
        </label>
      </div>
      <div className="mt-5 space-y-4" aria-busy={loading}>
        {loading ? (
          <p role="status">A carregar perfis…</p>
        ) : !visible.length ? (
          <p className="rounded-sm border border-border p-6 text-sm text-muted-foreground">
            Ainda não há perfis nesta vista. Usa «Adicionar perfil» para começar.
          </p>
        ) : (
          visible.map((profile) => (
            <article
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border p-5"
            >
              <div className="min-w-0">
                <h3 className="break-words text-xl">{profile.data.name || "Sem nome"}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {profile.data.kind === "coach" ? "PT / coach" : "Comunidade"}
                  {profile.data.city ? ` · ${profile.data.city}` : ""}
                </p>
                <p className="mt-2 text-sm text-primary">{status(profile)}</p>
                {!profile.archivedAt &&
                  pendingTranslationReviews(profile.data, profile.translationReviews).length >
                    0 && <p className="mt-2 text-xs text-primary">Traduções por rever</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.archivedAt ? (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => void action(profile, "profile-restore")}
                  >
                    <ArchiveRestore size={16} />
                    Recuperar
                  </button>
                ) : (
                  <>
                    <button className={button} disabled={busy} onClick={() => open(profile)}>
                      Editar / publicar
                    </button>
                    {profile.publishedData && (
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => void action(profile, "profile-unpublish")}
                      >
                        Retirar do site
                      </button>
                    )}
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() => void action(profile, "profile-archive")}
                    >
                      <Archive size={16} />
                      Arquivar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Os rascunhos e perfis arquivados ficam privados. Só as versões publicadas aparecem no site.
        Limite: 500 perfis, incluindo os arquivados.
      </p>
    </section>
  );
}
