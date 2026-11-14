import { Link, Localized, T } from "@/i18n";

import { Instagram } from "lucide-react";
import { Logo } from "./Logo";
import wordmark from "@/assets/hybrid-hub-wordmark.webp";

// Redes sociais: o ícone só fica clicável quando `href` está preenchido.
const socials = [
  {
    label: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/hybridhub.app?utm_source=qr&exln=MWI5MTZwZTRjeTZtbA==",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-9 px-5 py-10 md:grid-cols-3 md:gap-12 md:px-10 md:py-16">
        <div className="col-span-2 flex flex-col items-center md:col-span-1 md:items-start">
          <div className="flex items-center gap-3">
            <Logo />
            <Localized as="img" src={wordmark} alt="Hybrid Hub" className="h-7 w-auto" />
          </div>
          <p className="mt-3 text-center text-xs tracking-[0.16em] text-foreground sm:text-sm sm:tracking-[0.3em] md:mt-4"><T>{"TRAIN • CONNECT • COMPETE"}</T></p>
        </div>
        <div className="flex min-w-0 flex-col gap-2.5 text-sm text-muted-foreground md:gap-3">
          <span className="eyebrow mb-1 md:mb-2"><T>{"Legal"}</T></span>
          <Link to="/privacidade" className="hover:text-foreground"><T>{"Política de Privacidade"}</T></Link>
          <Link to="/termos" className="hover:text-foreground"><T>{"Termos e Condições"}</T></Link>
          <Link to="/cookies" className="hover:text-foreground"><T>{"Cookies"}</T></Link>
          <Link to="/faq" className="hover:text-foreground"><T>{"FAQ"}</T></Link>
          <Link to="/contactos" className="hover:text-foreground"><T>{"Contacto"}</T></Link>
        </div>
        <div className="justify-self-end md:justify-self-start">
          <span className="eyebrow"><T>{"Instagram"}</T></span>
          <div className="mt-3 flex gap-3 md:mt-4">
            <T>{socials.map(({ label, icon: Icon, href }) =>
              href ? (
                <Localized as="a" key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary">
                  <Icon size={18} />
                </Localized>
              ) : (
                <Localized as="span" key={label} aria-label={`${label} (em breve)`} title="Em breve" className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground">
                  <Icon size={18} />
                </Localized>
              ),
            )}</T>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground md:py-6"><T>{"© "}</T><T>{new Date().getFullYear()}</T><T>{" Hybrid Hub. Todos os direitos reservados."}</T></div>
    </footer>
  );
}
