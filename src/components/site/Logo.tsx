// Espaço reservado para o logótipo oficial (bucket hat HH).
// Para usar o original: coloque o ficheiro em src/assets e passe-o em `src`.
export function Logo({ src, className = "" }: { src?: string; className?: string }) {
  if (src) return <img src={src} alt="Hybrid Hub" className={`h-10 w-auto ${className}`} />;
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-primary text-[9px] font-semibold uppercase tracking-widest text-primary ${className}`}
      aria-label="Logótipo Hybrid Hub"
      title="Espaço para o logótipo oficial"
    >
      Logo
    </span>
  );
}
