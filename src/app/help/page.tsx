import type { Metadata } from "next";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ContactForm } from "@/components/help/contact-form";
import { FAQ_GROUPS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Help Centre",
  description: "Answers for renters, buyers, students and listers using Nyoomba.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Help Centre
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Answers grouped by who you are. Can&apos;t find it? Message us below.
      </p>

      <div className="mt-10 space-y-10">
        {FAQ_GROUPS.map((group) => (
          <div key={group.audience}>
            <h2 className="mb-2 text-sm font-semibold text-foreground">{group.audience}</h2>
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
              {group.faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div id="contact" className="mt-14 scroll-mt-20">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Still need help?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Send us a message and we&apos;ll respond as soon as we can.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
