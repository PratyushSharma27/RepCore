import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Flame,
  Headphones,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { getProductsList, fetchProducts, type Product } from "@/lib/products";
import { createPageHead, websiteJsonLd } from "@/lib/seo";
import founderPratyush from "@/assets/founder-pratyush.png";
import founderVishal from "@/assets/founder-vishal.png";

import { useReveal, useStaggerReveal, useTilt3D } from "@/hooks/use-animations";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () =>
    createPageHead({
      title: "Pro Training Gear for Serious Athletes",
      description:
        "RepCore builds pro-grade training gear — resistance bands, lifting straps, wrist wraps, grip strengtheners, shakers, foam rollers and massage guns for athletes who train hard.",
      path: "/",
      keywords:
        "training gear, gym equipment, resistance bands, lifting straps, wrist wraps, grip strengthener, protein shaker, foam roller, massage gun, RepCore",
      jsonLd: websiteJsonLd(),
    }),
  component: Index,
});

function Index() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    setItems(getProductsList());
    const load = async () => {
      const dbProducts = await fetchProducts();
      setItems(dbProducts);
    };
    load();
  }, []);

  const featured = items.slice(0, 6);

  // Hero animations
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Section reveals
  const valueProps = useReveal(0.2);
  const productSection = useReveal(0.1);
  const founderSection = useReveal(0.15);
  const reviewsSection = useReveal(0.15);
  const { containerRef: gridRef, visibleItems: gridVisible } = useStaggerReveal(
    featured.length,
    120,
  );
  const statBand = useReveal(0.2);
  const ctaSection = useReveal(0.15);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 particle-field">
        {/* Animated background blobs centered */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] opacity-40 morph-blob"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.21 38 / 0.3), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] opacity-35 morph-blob"
          style={{
            background: "radial-gradient(circle, oklch(0.55 0.22 25 / 0.2), transparent 70%)",
            animationDelay: "-3s",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-glow)" }}
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-16 sm:px-6 lg:pt-24 text-center">
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary shimmer-bg anim-reveal-left ${heroReady ? "visible" : ""}`}
            >
              <span className="h-2 w-2 rounded-full bg-primary glow-pulse" /> 2026 Collection Drop
            </div>

            <h1
              className={`mt-8 text-[12vw] leading-[0.9] sm:text-[90px] lg:text-[110px] tracking-tight anim-hero-text ${heroReady ? "visible" : ""}`}
            >
              TRAIN. LIFT.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-orange-400 text-glow">
                RECOVER.
              </span>
            </h1>

            <p
              className={`mt-8 max-w-xl text-base sm:text-lg text-muted-foreground/90 leading-relaxed anim-reveal-up anim-delay-3 ${heroReady ? "visible" : ""}`}
            >
              RepCore builds the small, vital tools that survive heavy training — engineered with
              the athletes who treat the gym like a job site.
            </p>

            <div
              className={`mt-8 flex flex-wrap justify-center items-center gap-4 anim-reveal-up anim-delay-5 ${heroReady ? "visible" : ""}`}
            >
              <Button variant="hero" size="xl" asChild className="btn-lift glow-pulse">
                <Link to="/products">
                  Shop the Gear <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="pill" size="xl" asChild className="btn-lift">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>

            <div
              className={`mt-16 w-full max-w-2xl rounded-2xl border border-border/40 bg-card/25 p-8 backdrop-blur-md grid grid-cols-3 gap-6 anim-reveal-up anim-delay-7 ${heroReady ? "visible" : ""}`}
            >
              <AnimStat value="7+" label="Premium Products" />
              <AnimStat value="100%" label="Performance Focused" />
              <AnimStat value="24/7" label="Customer Support" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-4 sm:px-6 md:grid-cols-4">
          <TrustItem icon={<CreditCard className="h-4 w-4" />} label="Secure Payments" />
          <TrustItem icon={<Truck className="h-4 w-4" />} label="Fast Shipping" />
          <TrustItem icon={<ShieldCheck className="h-4 w-4" />} label="Premium Quality" />
          <TrustItem icon={<Headphones className="h-4 w-4" />} label="Customer Support" />
        </div>
      </section>

      {/* VALUE PROPS */}
      <section
        ref={valueProps.ref}
        className="border-b border-border/60 bg-card/30 section-glow-divider"
      >
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden md:grid-cols-3">
          <ValueProp
            icon={<Flame className="h-5 w-5" />}
            title="Built Heavy"
            desc="Reinforced stitching, dense foam, aluminum chassis. Made to outlast you."
            visible={valueProps.visible}
            delay={0}
          />
          <ValueProp
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Quality Guaranteed"
            desc="Built to perform. Backed by our commitment to quality."
            visible={valueProps.visible}
            delay={1}
          />
          <ValueProp
            icon={<Zap className="h-5 w-5" />}
            title="Fast Pan India Shipping"
            desc="Ships within 1-3 business days. Free shipping on orders above ₹500."
            visible={valueProps.visible}
            delay={2}
          />
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section ref={productSection.ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div
          className={`flex items-end justify-between gap-4 anim-reveal-up ${productSection.visible ? "visible" : ""}`}
        >
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary shimmer-bg inline-block px-2 py-1 rounded-full">
              The Lineup
            </div>
            <h2 className="mt-3 text-5xl sm:text-7xl">Seven tools. Zero filler.</h2>
          </div>
          <Link
            to="/products"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-flex hover-underline-anim"
          >
            View all →
          </Link>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 perspective-container"
        >
          {featured.map((p, i) => (
            <ProductCard key={p.slug} product={p} visible={gridVisible[i]} index={i} />
          ))}
        </div>
      </section>

      {/* BIG STAT BAND */}
      <section
        ref={statBand.ref}
        className="border-y border-border/60 bg-card/40 section-glow-divider"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div className={`anim-reveal-left ${statBand.visible ? "visible" : ""}`}>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Why RepCore</div>
            <h2 className="mt-4 text-5xl sm:text-6xl">
              We make gear <span className="text-primary text-glow">for the set</span>, not the
              shelf.
            </h2>
          </div>
          <p
            className={`self-end text-lg text-muted-foreground anim-reveal-right anim-delay-2 ${statBand.visible ? "visible" : ""}`}
          >
            Every product in our line is tested with real lifters, in real gyms, under real load —
            then tested again. We ship the version that survives.
          </p>
        </div>
      </section>

      {/* FOUNDERS */}
      <section ref={founderSection.ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`anim-reveal-left ${founderSection.visible ? "visible" : ""}`}>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Built by Lifters</div>
            <h2 className="mt-3 text-5xl sm:text-7xl">Premium gear without the premium markup.</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Founded by Pratyush Sharma and Vishal Dhillon, RepCore was created to deliver
              premium fitness accessories without the premium price tag.
            </p>
          </div>
          <div
            className={`grid gap-5 sm:grid-cols-2 anim-reveal-right anim-delay-2 ${founderSection.visible ? "visible" : ""}`}
          >
            <FounderCard image={founderPratyush} name="Pratyush Sharma" />
            <FounderCard image={founderVishal} name="Vishal Dhillon" />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        ref={reviewsSection.ref}
        className="border-y border-border/60 bg-card/30 section-glow-divider"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className={`anim-reveal-up ${reviewsSection.visible ? "visible" : ""}`}>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Customer Reviews</div>
            <h2 className="mt-3 text-5xl sm:text-7xl">Lift-tested. Customer-backed.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <TestimonialCard
                key={t.name}
                quote={t.quote}
                name={t.name}
                visible={reviewsSection.visible}
                delay={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaSection.ref} className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div
          className={`relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 sm:p-16 particle-field card-3d anim-reveal-scale ${ctaSection.visible ? "visible" : ""}`}
        >
          {/* Animated glow orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-50 morph-blob"
            style={{ background: "var(--gradient-glow)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full opacity-30 morph-blob"
            style={{
              background: "radial-gradient(circle, oklch(0.55 0.22 25 / 0.4), transparent 70%)",
              animationDelay: "-3s",
            }}
          />
          <div className="relative">
            <h2 className="text-5xl sm:text-7xl">Ready to train heavy?</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Free shipping over ₹500. 60-day return window. Quality gear built for hard training.
            </p>
            <div className="mt-8">
              <Button variant="hero" size="xl" asChild className="btn-lift glow-pulse">
                <Link to="/products">
                  Browse the Lineup <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ─── Animated counter stat ─────────────────────────────── */
function AnimStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="display text-4xl text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="mr-1 inline-block h-1 w-1 rounded-full bg-primary align-middle" />
        {label}
      </div>
    </div>
  );
}

/* ─── 3D product card ───────────────────────────────────── */
function ProductCard({
  product: p,
  visible,
  index,
}: {
  product: Product;
  visible: boolean;
  index: number;
}) {
  const tiltRef = useTilt3D(8);
  return (
    <div
      ref={tiltRef}
      className={`tilt-3d gradient-border-hover ${visible ? "" : "opacity-0"}`}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible
          ? `tilt-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.12}s forwards`
          : "none",
      }}
    >
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/50"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-contain bg-black transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur glass-card">
            {p.category}
          </div>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="display text-lg leading-tight">{p.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{p.tagline}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              ₹{p.price.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground transition-transform duration-300 group-hover:translate-x-1">
              Shop →
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

const testimonials = [
  {
    quote: "Great quality straps and wrist wraps. Exactly what I needed for heavy lifts.",
    name: "Rahul S.",
  },
  {
    quote: "The shaker feels solid, the bands have clean tension, and delivery was quick.",
    name: "Ankit M.",
  },
  {
    quote: "RepCore nails the basics. No flashy nonsense, just gym gear that feels reliable.",
    name: "Karan P.",
  },
];

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-foreground">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      {label}
    </div>
  );
}

function FounderCard({ image, name }: { image: string; name: string }) {
  return (
    <figure className="group overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          loading="lazy"
          width={720}
          height={900}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <figcaption className="border-t border-border/60 p-5">
        <div className="display text-xl">{name}</div>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Co-founder
        </div>
      </figcaption>
    </figure>
  );
}

function TestimonialCard({
  quote,
  name,
  visible,
  delay,
}: {
  quote: string;
  name: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <figure
      className={`rounded-2xl border border-border/60 bg-background p-6 anim-reveal-up ${visible ? "visible" : ""}`}
      style={{ animationDelay: `${delay * 0.12}s` }}
    >
      <div className="flex gap-1 text-primary" aria-label="5 star review">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-base leading-relaxed text-foreground">
        "{quote}"
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        {name}
      </figcaption>
    </figure>
  );
}

/* ─── Value prop with animation ─────────────────────────── */
function ValueProp({
  icon,
  title,
  desc,
  visible,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`bg-background p-8 anim-reveal-rotate ${visible ? "visible" : ""}`}
      style={{ animationDelay: `${delay * 0.15}s` }}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-500 hover:scale-110 hover:rotate-12 glow-pulse">
        {icon}
      </div>
      <div className="display mt-4 text-xl">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
