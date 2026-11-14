import { languageAlternates } from "@/i18n/language";
import { createFileRoute } from "@tanstack/react-router";
import { Hero, About, Features, HowItWorks, Community, AppShowcase, Shop, FinalCta } from "@/components/site/Sections";
import logo from "@/assets/hybrid-hub-logo.png";

const siteUrl = "https://hybridhub.pt/";
const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "Hybrid Hub",
      url: siteUrl,
      inLanguage: "pt-PT",
      publisher: { "@id": `${siteUrl}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "Hybrid Hub",
      url: siteUrl,
      logo: new URL(logo, siteUrl).toString(),
      sameAs: ["https://www.instagram.com/hybridhub.app/"],
    },
  ],
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hybrid Hub | Corrida, HYROX e treino híbrido em Portugal" },
      { name: "description", content: "Encontra pessoas para correr, fazer treino híbrido e preparar provas como HYROX. Descobre parceiros, treinos e comunidades desportivas em Portugal." },
      { property: "og:title", content: "Hybrid Hub | Corrida, HYROX e treino híbrido em Portugal" },
      { property: "og:description", content: "O desporto aproxima pessoas. A Hybrid Hub ajuda-as a encontrar-se." },
    ],
    links: [...languageAlternates("/"), { rel: "canonical", href: "https://hybridhub.pt/" }],
    scripts: [{ type: "application/ld+json", children: structuredData }],
  }),
  component: () => (
    <>
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Community />
      <AppShowcase />
      <Shop />
      <FinalCta />
    </>
  ),
});
