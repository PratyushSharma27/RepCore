import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site-layout";
import { useReveal, useStaggerReveal } from "@/hooks/use-animations";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — RepCore" },
      { name: "description", content: "Shipping, returns, warranty and product questions for RepCore training gear." },
      { property: "og:title", content: "FAQ — RepCore" },
      { property: "og:description", content: "Answers about shipping, returns, warranty and product care." },
    ],
  }),
  component: FaqPage,
});

const groups = [
  {
    title: "Shipping",
    items: [
      { q: "How fast do you ship?", a: "Orders placed before 2pm ET ship same day. Standard delivery lands in 2–5 business days." },
      { q: "Do you ship internationally?", a: "Yes — we ship to 38 countries. Duties and taxes are calculated at checkout." },
      { q: "Is shipping free?", a: "Free standard shipping on all US orders over $50." },
    ],
  },
  {
    title: "Returns & Warranty",
    items: [
      { q: "What's your return policy?", a: "60-day no-questions returns on unused gear. Start a return from your order email." },
      { q: "Do products have a warranty?", a: "Every RepCore tool ships with a lifetime defect warranty. If it breaks under normal training, we replace it." },
      { q: "What if my item arrives damaged?", a: "Email support@repcore.co with a photo within 7 days and we'll overnight a replacement." },
    ],
  },
  {
    title: "Product",
    items: [
      { q: "Are resistance bands latex-free?", a: "Our standard bands use natural latex. A latex-free TPE version is in development." },
      { q: "Is the shaker dishwasher safe?", a: "Yes — top rack only. Hand-wash the mixer ball for longest life." },
      { q: "How loud is the mini massage gun?", a: "Below 45 dB on speed 1 — about the volume of a quiet conversation." },
    ],
  },
];

function FaqPage() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const { containerRef: groupsRef, visibleItems: groupsVisible } = useStaggerReveal(groups.length, 200);
  const ctaReveal = useReveal(0.2);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 section-glow-divider particle-field">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>Support</div>
          <h1 className={`mt-4 text-6xl sm:text-8xl anim-hero-text ${entered ? "visible" : ""}`}>FAQ.</h1>
          <p className={`mt-6 max-w-xl text-muted-foreground anim-reveal-up anim-delay-3 ${entered ? "visible" : ""}`}>
            Straight answers. If you can't find what you need, ping us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div ref={groupsRef}>
          {groups.map((g, gi) => (
            <div
              key={g.title}
              className="mb-10"
              style={{
                opacity: groupsVisible[gi] ? 1 : 0,
                animation: groupsVisible[gi] ? `reveal-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${gi * 0.15}s both` : "none",
              }}
            >
              <h2 className="display mb-4 text-2xl text-primary">{g.title}</h2>
              <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {g.items.map((it, i) => (
                  <AccordionItem key={it.q} value={`${g.title}-${i}`} className="border-border/60 px-5 transition-colors duration-300 hover:bg-primary/5">
                    <AccordionTrigger className="text-left text-base transition-colors duration-300">{it.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div
          ref={ctaReveal.ref}
          className={`mt-10 rounded-2xl border border-border/60 bg-[image:var(--gradient-fire)]/10 p-8 text-center card-3d gradient-border-hover anim-reveal-scale ${ctaReveal.visible ? "visible" : ""}`}
        >
          <h3 className="display text-2xl">Still have questions?</h3>
          <p className="mt-2 text-muted-foreground">We answer every message within 24 hours.</p>
          <Button variant="hero" size="lg" className="mt-6 btn-lift glow-pulse" asChild>
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
