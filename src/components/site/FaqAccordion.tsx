import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { faqGroups } from "./faq-data";

export function FaqAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="space-y-12">
      {faqGroups.map(({ category, items }) => (
        <section key={category} aria-label={category}>
          <h2 className="mb-5 text-sm font-semibold leading-relaxed tracking-normal text-primary">{category}</h2>
          <div className="border-t border-border">
            {items.map(({ id, question, paragraphs }) => (
              <Accordion.Item key={id} value={id} className="border-b border-border">
                <Accordion.Header className="font-sans font-semibold leading-relaxed tracking-normal">
                  <Accordion.Trigger asChild>
                    <Button variant="ghost" className="group h-auto min-h-16 w-full justify-between gap-5 rounded-none px-0 py-5 text-left text-sm font-semibold whitespace-normal transition-colors hover:bg-transparent hover:text-primary data-[state=open]:text-primary focus-visible:ring-primary motion-reduce:transition-none md:text-base">
                      <span>{question}</span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
                        <Plus className="group-data-[state=open]:hidden" />
                        <Minus className="hidden group-data-[state=open]:block" />
                      </span>
                    </Button>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content forceMount className="overflow-hidden data-[state=closed]:hidden data-[state=open]:animate-in data-[state=open]:fade-in duration-200 motion-reduce:animate-none">
                  <div className="space-y-4 pb-6 pr-4 text-sm leading-7 text-muted-foreground md:pr-12 md:text-base">
                    {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {id === "faq-6-5" && (
                      <Link to="/contactos" className="inline-block text-primary underline underline-offset-4">Contactos</Link>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </div>
        </section>
      ))}
    </Accordion.Root>
  );
}