import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useReveal, useCountUp, useStaggerReveal } from "@/hooks/use-animations";
import { useEffect, useState } from "react";
import pratyushImg from "@/assets/founder-pratyush.png";
import vishalImg from "@/assets/founder-vishal.png";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    createPageHead({
      title: "About RepCore — Gear Built for Work",
      description:
        "RepCore designs training tools with the athletes who use them. Heavy materials, honest engineering, and quality backing on every product.",
      path: "/about",
      keywords: "RepCore story, training gear brand, fitness equipment company, athlete-founded brand",
    }),
  component: AboutPage,
});

function AboutPage() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const pillarsReveal = useReveal(0.1);
  const { containerRef: pillarsGrid, visibleItems: pillarsVisible } = useStaggerReveal(3, 200);
  const statsReveal = useReveal(0.2);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 section-glow-divider particle-field">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>Our Story</div>
          <h1 className={`mt-4 max-w-4xl text-6xl sm:text-8xl anim-hero-text ${entered ? "visible" : ""}`}>
            Made by lifters. <span className="text-primary text-glow">For lifters.</span>
          </h1>
          <p className={`mt-8 max-w-2xl text-lg text-muted-foreground anim-reveal-up anim-delay-3 ${entered ? "visible" : ""}`}>
            RepCore started in a garage gym in 2019 with one mission: stop buying flimsy training tools.
            Today we design, test and ship seven essentials that survive real training, backed by our commitment to quality.
          </p>
        </div>
      </section>

      <section ref={pillarsReveal.ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div ref={pillarsGrid} className="grid gap-10 md:grid-cols-3 perspective-container">
          {[
            { n: "01", t: "Designed with athletes", d: "Every prototype lives in real gyms before it ships. If lifters break it, we redesign it." },
            { n: "02", t: "Heavy materials", d: "Layered latex, aluminum chassis, dense EVA foam, reinforced cotton. No compromise on the build." },
            { n: "03", t: "Quality backing", d: "Built to perform, inspected before dispatch, and supported with real customer care." },
          ].map((b, i) => (
            <div
              key={b.n}
              className={`rounded-2xl border border-border/60 bg-card p-8 card-3d gradient-border-hover ${i % 2 === 0 ? "" : "card-3d-alt"}`}
              style={{
                opacity: pillarsVisible[i] ? 1 : 0,
                animation: pillarsVisible[i] ? `card-flip-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s both` : "none",
              }}
            >
              <div className="display text-5xl text-primary text-glow">{b.n}</div>
              <div className="display mt-4 text-2xl">{b.t}</div>
              <p className="mt-3 text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MEET THE FOUNDERS SECTION */}
      <section className="border-t border-border/60 py-24 bg-background/20 relative overflow-hidden section-glow-divider">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold">The Visionaries</div>
            <h2 className="display mt-4 text-4xl sm:text-6xl">Meet the <span className="text-primary text-glow">Founders.</span></h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
              RepCore was forged through the shared grit of two lifters who believed training equipment shouldn't fail under load. Here's the team steering the barbell.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Founder 1: Pratyush Sharma */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left gap-6 group">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 w-64 h-64 shadow-lg transition-all duration-500 hover:border-primary/40 group-hover:scale-105">
                <img 
                  src={pratyushImg} 
                  alt="Pratyush Sharma" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">Co-Founder & CEO</span>
                </div>
              </div>
              <div>
                <h3 className="display text-2xl text-foreground group-hover:text-primary transition-colors">Pratyush Sharma</h3>
                <p className="text-xs uppercase tracking-wider text-primary mt-1 font-semibold">CO-FOUNDER & CEO / HEAD OF PRODUCT & TECHNOLOGY</p>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  Pratyush leads RepCore's product innovation, technology, and business strategy. As a full-stack web and app developer, he combines engineering expertise with a passion for fitness to build premium gear and seamless digital experiences for athletes.
                </p>
              </div>
            </div>

            {/* Founder 2: Vishal Dhillon */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left gap-6 group">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 w-64 h-64 shadow-lg transition-all duration-500 hover:border-primary/40 group-hover:scale-105">
                <img 
                  src={vishalImg} 
                  alt="Vishal Dhillon" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">Co-Founder & CMO</span>
                </div>
              </div>
              <div>
                <h3 className="display text-2xl text-foreground group-hover:text-primary transition-colors">Vishal Dhillon</h3>
                <p className="text-xs uppercase tracking-wider text-primary mt-1 font-semibold">CO-FOUNDER & CMO / HEAD OF BRAND & GROWTH</p>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  Vishal leads RepCore's marketing, branding, and growth initiatives. He focuses on building a strong fitness community, expanding brand reach, and creating meaningful connections between RepCore and athletes worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsReveal.ref} className="border-t border-border/60 bg-card/40 section-glow-divider">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-3">
          <AnimStat n={120} suffix="k+" l="Athletes equipped" visible={statsReveal.visible} delay={0} />
          <AnimStat n={98} suffix="%" l="5-star reviews" visible={statsReveal.visible} delay={1} />
          <AnimStat n={42} suffix="" l="Countries shipped" visible={statsReveal.visible} delay={2} />
        </div>
      </section>
    </SiteLayout>
  );
}

function AnimStat({ n, suffix, l, visible, delay }: { n: number; suffix: string; l: string; visible: boolean; delay: number }) {
  const { ref, value } = useCountUp(n, 1500);
  return (
    <div
      ref={ref}
      className={`anim-reveal-up ${visible ? "visible" : ""}`}
      style={{ animationDelay: `${delay * 0.15}s` }}
    >
      <div className="display text-6xl">{value}{suffix}</div>
      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}
