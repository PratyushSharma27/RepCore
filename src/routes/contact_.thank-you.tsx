import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { createNoIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/contact_/thank-you")({
  head: () =>
    createNoIndexHead(
      "Thank You — RepCore Support",
      "Your message has been received successfully.",
      "/contact/thank-you"
    ),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <SiteLayout>
      {/* Background ambient glowing blobbies */}
      <div
        className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none opacity-20 blur-3xl -z-10 animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.21 38 / 0.3), transparent 75%)",
        }}
      />

      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 page-transition">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground anim-zoom-bounce visible glow-pulse">
          <Check className="h-9 w-9" />
        </div>
        
        <h1 className="display mt-6 text-5xl sm:text-7xl anim-reveal-up anim-delay-1 visible">
          Message sent.
        </h1>
        
        <p className="mt-4 text-muted-foreground leading-relaxed max-w-md mx-auto anim-reveal-up anim-delay-2 visible text-base">
          Thanks for reaching out! We've received your inquiry and our team is already reviewing it. 
          We'll get back to you within 24 hours.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3 anim-reveal-up anim-delay-3 visible">
          <Button variant="hero" size="xl" asChild className="btn-lift glow-pulse">
            <Link to="/products">
              Explore the Gear <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="xl" asChild className="btn-lift">
            <Link to="/">Back Home</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
