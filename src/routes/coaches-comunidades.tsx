import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Dumbbell, Users, ArrowRight } from "lucide-react";
import { Link, useLanguage } from "@/i18n";
import { languageAlternates, localizedPath, type Language } from "@/i18n/language";
import { partnerCopy } from "@/i18n/partners";
import { FormProtection, useWebsiteForm } from "@/components/site/WebsiteForm";

export function participationHead(language: Language) {
  const copy = partnerCopy(language);
  const url = `https://hybridhub.pt${localizedPath("/coaches-comunidades", language)}`;
  return {
    meta: [
      { title: copy.title },
      { name: "description", content: copy.description },
      { property: "og:title", content: copy.title },
      { property: "og:description", content: copy.description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: url }, ...languageAlternates("/coaches-comunidades")],
  };
}
export const Route = createFileRoute("/coaches-comunidades")({
  head: () => participationHead("pt"),
  component: ParticipationPage,
});
const field =
  "mt-2 w-full rounded-sm border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none";

export function ParticipationPage() {
  const language = useLanguage();
  const c = partnerCopy(language);
  const form = useWebsiteForm();
  const [type, setType] = useState<"coach" | "community">("coach");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  function choose(value: typeof type) {
    setType(value);
    document.getElementById("participar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !form.ready) return;
    const data = new FormData(event.currentTarget);
    if (data.get("_gotcha")) return;
    const value = (name: string) => String(data.get(name) ?? "").trim();
    setStatus("sending");
    try {
      await form.submit({
        kind: "partner",
        idioma: language,
        nome: value("name"),
        email: value("email"),
        consent: data.get("consent") === "on",
        partner: {
          type,
          city: value("city"),
          country: value("country"),
          sports: value("sports"),
          description: value("description"),
          activities: value("activities"),
          website: value("website"),
        },
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }
  return (
    <div className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-10 md:pb-20 md:pt-36">
      <section className="max-w-3xl">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl">
          {c.heading} <span className="text-primary">{c.highlight}</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">{c.intro}</p>
        <p className="mt-5 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
          {c.preparing}
        </p>
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2" aria-label={c.type}>
        {(["coach", "community"] as const).map((kind) => {
          const Icon = kind === "coach" ? Dumbbell : Users;
          return (
            <article key={kind} className="flex flex-col border border-border bg-card p-6 md:p-8">
              <Icon className="text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-2xl">{kind === "coach" ? c.coach : c.community}</h2>
              <p className="mt-3 flex-1 text-muted-foreground">
                {kind === "coach" ? c.coachBody : c.communityBody}
              </p>
              <button
                onClick={() => choose(kind)}
                className="mt-6 flex min-h-11 items-center gap-3 self-start text-sm font-semibold text-primary underline underline-offset-4"
              >
                {c.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </section>
      <section className="py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl">{c.next}</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [c.step1, c.step1Body],
            [c.step2, c.step2Body],
            [c.step3, c.step3Body],
          ].map(([title, body], index) => (
            <li key={title} className="border-t border-border pt-4">
              <p className="text-sm text-primary">0{index + 1}</p>
              <h3 className="mt-2 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section id="participar" className="scroll-mt-24 border-t border-border pt-8 md:pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl">{c.formTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{c.formHint}</p>
          {status === "success" ? (
            <div role="status" className="mt-6 border border-primary p-6">
              <h3 className="text-2xl text-primary">{c.sent}</h3>
              <p className="mt-3 text-muted-foreground">{c.thanks}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-5">
              <input
                name="_gotcha"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <fieldset disabled={status === "sending"} className="space-y-5 disabled:opacity-60">
                <fieldset>
                  <legend className="text-sm font-semibold">{c.type} *</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(["coach", "community"] as const).map((kind) => (
                      <label
                        key={kind}
                        className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${type === kind ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={kind}
                          checked={type === kind}
                          onChange={() => setType(kind)}
                          className="h-4 w-4 accent-primary"
                        />
                        {kind === "coach" ? c.coach : c.community}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      ["name", c.name, "text", 100],
                      ["email", c.email, "email", 254],
                      ["city", c.city, "text", 100],
                      ["country", c.country, "text", 100],
                    ] as const
                  ).map(([name, label, inputType, max]) => (
                    <label
                      key={name}
                      className="block text-sm font-semibold"
                      htmlFor={`partner-${name}`}
                    >
                      {label} *
                      <input
                        id={`partner-${name}`}
                        name={name}
                        type={inputType}
                        autoComplete={
                          name === "email"
                            ? "email"
                            : name === "city"
                              ? "address-level2"
                              : name === "country"
                                ? "country-name"
                                : "organization"
                        }
                        required
                        maxLength={max}
                        pattern={inputType === "text" ? ".*\\S.*" : undefined}
                        className={field}
                      />
                    </label>
                  ))}
                </div>
                <label className="block text-sm font-semibold" htmlFor="partner-sports">
                  {c.sports} *
                  <input
                    id="partner-sports"
                    name="sports"
                    required
                    maxLength={200}
                    pattern=".*\S.*"
                    className={field}
                    aria-describedby="sports-hint"
                  />
                  <span
                    id="sports-hint"
                    className="mt-2 block text-xs font-normal text-muted-foreground"
                  >
                    {c.sportsHint}
                  </span>
                </label>
                <label className="block text-sm font-semibold" htmlFor="partner-description">
                  {c.bio} *
                  <textarea
                    id="partner-description"
                    name="description"
                    required
                    maxLength={800}
                    rows={3}
                    className={field}
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="partner-activities">
                  {type === "coach" ? c.coachActivity : c.communityActivity} *
                  <textarea
                    key={type}
                    id="partner-activities"
                    name="activities"
                    required
                    maxLength={300}
                    rows={2}
                    className={field}
                    aria-describedby="activities-hint"
                  />
                  <span
                    id="activities-hint"
                    className="mt-2 block text-xs font-normal text-muted-foreground"
                  >
                    {type === "coach" ? c.coachHint : c.communityHint}
                  </span>
                </label>
                <label className="block text-sm font-semibold" htmlFor="partner-website">
                  {c.website}
                  <input
                    id="partner-website"
                    name="website"
                    type="text"
                    maxLength={200}
                    className={field}
                  />
                </label>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span>{c.consent} *</span>
                </label>
                <Link to="/privacidade" className="block text-sm text-primary underline">
                  {c.privacy}
                </Link>
              </fieldset>
              <FormProtection {...form.protection} language={language} />
              {status === "error" && (
                <p role="alert" className="border border-destructive p-4 text-sm">
                  {c.error}
                </p>
              )}
              <button
                type="submit"
                disabled={!form.ready || status === "sending"}
                className="btn-primary w-full disabled:opacity-50 sm:w-auto"
              >
                {status === "sending" ? c.sending : c.cta}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
