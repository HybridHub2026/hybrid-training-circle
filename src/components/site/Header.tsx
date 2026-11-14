import { Link, Localized, T, LanguageSelector } from "@/i18n";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import wordmark from "@/assets/hybrid-hub-wordmark.webp";

const nav = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/app", label: "A app" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/loja", label: "Loja" },
  { to: "/contactos", label: "Contactos" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 min-[360px]:px-4 md:px-10">
        <Link to="/" className="flex min-w-0 shrink items-center gap-1 md:gap-3" onClick={() => setOpen(false)}>
          <Logo />
          <Localized as="img" src={wordmark} alt="Hybrid Hub" className="h-auto w-[84px] min-[360px]:w-[104px] sm:w-[160px] lg:w-[138px] xl:w-[160px]" width={1920} height={500} />
        </Link>
        <nav className="hidden items-center gap-4 xl:gap-7 lg:flex">
          <T>{nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              <T>{n.label}</T>
            </Link>
          ))}</T>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <LanguageSelector onChange={() => setOpen(false)} />
        <Localized as="button" className="flex min-h-10 min-w-8 items-center justify-center sm:min-w-10 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <T>{open ? <X /> : <Menu />}</T>
        </Localized>
        </div>
      </div>
      <T>{open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-4 lg:hidden">
          <T>{nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-2xl font-extrabold uppercase">
              <T>{n.label}</T>
            </Link>
          ))}</T>
        </nav>
      )}</T>
    </header>
  );
}
