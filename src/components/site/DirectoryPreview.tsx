import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ManagedProfile } from "@/lib/profile-data";
import type { MemberProfile } from "./member-profiles";
import { MemberDirectory } from "./MemberDirectory";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function DirectoryPreview({
  profiles,
  onClose,
}: {
  profiles: ManagedProfile[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const members: MemberProfile[] = profiles
    .filter((profile) => profile.archivedAt === null)
    .map(({ id, data }) => ({
      id,
      kind: data.kind,
      name: data.name,
      city: data.city,
      country: data.country,
      description: data.description,
      sports: data.sports,
      ...(data.imageId
        ? { image: { src: `/api/profile-images?id=${data.imageId}&preview=1`, alt: data.imageAlt } }
        : {}),
      ...(data.instagram ? { instagram: data.instagram as `https://${string}` } : {}),
      ...(data.website ? { website: data.website as `https://${string}` } : {}),
    }));
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-label="Pré-visualização privada da página Quem já faz parte"
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto border-0 bg-background p-0 text-foreground"
    >
      <div inert>
        <Header />
      </div>
      <MemberDirectory memberProfiles={members} preview />
      <Footer />
      <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-sm border border-primary bg-background/95 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-xs leading-relaxed sm:text-sm">
          <strong className="text-primary">Pré-visualização privada.</strong> Inclui rascunhos
          guardados. Nada foi publicado.
        </p>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Fechar pré-visualização"
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm"
        >
          <X size={16} aria-hidden="true" />
          Fechar<span className="hidden sm:inline">pré-visualização</span>
        </button>
      </div>
    </dialog>
  );
}
