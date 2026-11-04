import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { Logo } from "./Logo";
import wordmark from "@/assets/hybrid-hub-wordmark.png.asset.json";

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
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <img src={wordmark.url} alt="Hybrid Hub" className="h-7 w-auto" />
          </div>
          <p className="mt-4 text-sm tracking-[0.3em] text-primary">TRAIN • CONNECT • COMPETE</p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <span className="eyebrow mb-2">Legal</span>
          <Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
          <Link to="/termos" className="hover:text-foreground">Termos e Condições</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/contactos" className="hover:text-foreground">Contacto</Link>
        </div>
        <div>
          <span className="eyebrow">Instagram</span>
          <div className="mt-4 flex gap-3">
            {socials.map(({ label, icon: Icon, href }) =>
              href ? (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary">
                  <Icon size={18} />
                </a>
              ) : (
                <span key={label} aria-label={`${label} (em breve)`} title="Em breve" className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground">
                  <Icon size={18} />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Hybrid Hub. Todos os direitos reservados.
      </div>
    </footer>
  );
}
