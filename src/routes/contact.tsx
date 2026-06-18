import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/site-layout";
import { useReveal, useStaggerReveal } from "@/hooks/use-animations";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    createPageHead({
      title: "Contact RepCore",
      description:
        "Contact RepCore for product support, wholesale inquiries, and press requests. We respond within 24 hours.",
      path: "/contact",
      keywords: "RepCore support, wholesale training gear, fitness equipment contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const formReveal = useReveal(0.1);
  const { containerRef: infoRef, visibleItems: infoVisible } = useStaggerReveal(3, 150);

  return (
    <SiteLayout>
      <Toaster />
      <section className="border-b border-border/60 section-glow-divider particle-field">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>Get in touch</div>
          <h1 className={`mt-4 text-6xl sm:text-8xl anim-hero-text ${entered ? "visible" : ""}`}>
            Hit us <span className="text-primary text-glow">up.</span>
          </h1>
        </div>
      </section>

      <section ref={formReveal.ref} className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div ref={infoRef} className="space-y-6">
          {[
            { icon: <Mail className="h-5 w-5" />, title: "Email", value: "pratyush@tenimal.com" },
            { icon: <Phone className="h-5 w-5" />, title: "Phone", value: "+91 99586 91355" },
          ].map((info, i) => (
            <div
              key={info.title}
              className="flex items-start gap-4 transition-transform duration-300 hover:translate-x-2"
              style={{
                opacity: infoVisible[i] ? 1 : 0,
                animation: infoVisible[i] ? `reveal-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s both` : "none",
              }}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 hover:scale-110 hover:bg-primary/20 glow-pulse">{info.icon}</div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{info.title}</div>
                <div className="mt-1 font-medium">{info.value}</div>
              </div>
            </div>
          ))}
          <div
            className="rounded-2xl border border-border/60 bg-card p-6 card-3d"
            style={{
              opacity: infoVisible[2] ? 1 : 0,
              animation: infoVisible[2] ? `reveal-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both` : "none",
            }}
          >
            <div className="display text-lg">Support hours</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Mon – Fri · 8am – 6pm EST<br />
              We respond to every message within 24 hours.
            </p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            const form = e.currentTarget;
            const data = new FormData(form);
            try {
              const response = await fetch("https://formspree.io/f/mrevvwjn", {
                method: "POST",
                body: data,
                headers: {
                  Accept: "application/json",
                },
              });
              if (response.ok) {
                toast.success("Message sent successfully!");
                form.reset();
                navigate({ to: "/contact/thank-you" });
              } else {
                const responseData = await response.json();
                toast.error(responseData.error || "Failed to send message. Please try again.");
              }
            } catch (error) {
              toast.error("An error occurred. Please check your network connection and try again.");
            } finally {
              setSending(false);
            }
          }}
          className={`space-y-5 rounded-2xl border border-border/60 bg-card p-8 card-3d-alt gradient-border-hover anim-reveal-right ${formReveal.visible ? "visible" : ""}`}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label="Name">
              <Input
                id="name"
                name="name"
                required
                placeholder="Your name"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.15)]"
              />
            </Field>
            <Field id="email" label="Email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.15)]"
              />
            </Field>
          </div>
          <Field id="subject" label="Subject">
            <Input
              id="subject"
              name="subject"
              required
              placeholder="What's up?"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.15)]"
            />
          </Field>
          <Field id="msg" label="Message">
            <Textarea
              id="msg"
              name="message"
              required
              rows={5}
              placeholder="Tell us about it…"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.15)]"
            />
          </Field>
          <Button type="submit" variant="hero" size="xl" disabled={sending} className="w-full sm:w-auto btn-lift glow-pulse">
            <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}