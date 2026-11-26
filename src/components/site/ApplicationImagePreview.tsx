export function ApplicationImagePreview({ id }: { id: string }) {
  const url = `/api/admin?action=partner-image&id=${encodeURIComponent(id)}`;
  return (
    <details className="mt-4 rounded-sm border border-border p-3 text-sm">
      <summary className="cursor-pointer py-2 text-primary">Ver imagem enviada (privada)</summary>
      <p className="mt-2 text-xs text-muted-foreground">
        Imagem associada à candidatura. Não publicada. Confirma a autorização antes de a usar num
        perfil.
      </p>
      <img
        src={url}
        alt="Fotografia ou logótipo enviado com a candidatura"
        loading="lazy"
        referrerPolicy="no-referrer"
        className="mt-4 max-h-64 max-w-full rounded-sm object-contain"
      />
      <a
        href={`${url}&download=1`}
        className="mt-3 inline-flex min-h-11 items-center text-primary underline"
      >
        Descarregar imagem para preparar o perfil
      </a>
    </details>
  );
}
