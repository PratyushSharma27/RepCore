import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, ShoppingBag, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { getProduct, getProductsList, fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useReveal, useTilt3D, useStaggerReveal } from "@/hooks/use-animations";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  createPageHead,
  createNoIndexHead,
  productJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/products_/$slug")({
  loader: ({ params }): { product: Product | null } => {
    const product = getProduct(params.slug);
    return { product };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    if (!p) {
      return createNoIndexHead("Product Not Found", "The requested RepCore product could not be found.", `/products/${params.slug}`);
    }

    const description = `${p.tagline} ${p.description}`.slice(0, 160);

    return createPageHead({
      title: `${p.name} — ${p.category} Training Gear`,
      description,
      path: `/products/${p.slug}`,
      ogType: "product",
      ogImage: absoluteUrl(p.image),
      keywords: `${p.name}, ${p.category}, RepCore, buy ${p.name.toLowerCase()}, training gear India`,
      jsonLd: [
        productJsonLd(p),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/products" },
          { name: p.name, path: `/products/${p.slug}` },
        ]),
      ],
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: initialProduct } = Route.useLoaderData();
  const params = Route.useParams();
  const [product, setProduct] = useState<Product | null>(initialProduct);

  useEffect(() => {
    const fresh = getProduct(params.slug);
    if (fresh) {
      setProduct(fresh);
    }
    const load = async () => {
      const dbProducts = await fetchProducts();
      const freshDb = dbProducts.find((p) => p.slug === params.slug);
      if (freshDb) {
        setProduct(freshDb);
      }
    };
    load();
  }, [params.slug]);

  const { add } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "warranty">("specs");

  const related = useMemo(() => {
    const list = getProductsList();
    if (!product) return list.slice(0, 3);
    return list.filter((p) => p.slug !== product.slug).slice(0, 3);
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    add(product.slug, qty);
    toast.success(`${product.name} added to cart`);
  };
  const handleBuy = () => {
    if (!product) return;
    add(product.slug, qty);
    navigate({ to: "/checkout" });
  };

  // Entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const specsReveal = useReveal(0.2);
  const relatedReveal = useReveal(0.1);
  const { containerRef: relatedGridRef, visibleItems: relatedVisible } = useStaggerReveal(related.length, 150);

  // 3D image tilt
  const imageTilt = useTilt3D(8);

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-32 text-center sm:px-6">
          <h1 className="text-6xl font-black text-primary">Not found.</h1>
          <p className="mt-4 text-muted-foreground">This product isn't in our lineup.</p>
          <Button variant="hero" className="mt-8 btn-lift" asChild>
            <Link to="/products">Back to shop</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Background ambient glowing blobbies */}
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] pointer-events-none opacity-25 blur-3xl -z-10"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.21 38 / 0.3), transparent 75%)" }}
      />

      <div className={`mx-auto max-w-7xl px-4 pt-8 sm:px-6 anim-reveal-left ${entered ? "visible" : ""}`}>
        <Link to="/products" className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover-underline-anim transition-colors duration-300">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> All gear
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        {/* Product image with 3D tilt */}
        <div className={`perspective-container anim-tilt-in ${entered ? "visible" : ""}`}>
          <div ref={imageTilt} className="relative overflow-hidden rounded-3xl border border-border/60 bg-card tilt-3d glow-pulse gradient-border-hover">
            <img
              src={product.image}
              alt={product.name}
              width={1200}
              height={1200}
              className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1.5 text-[10px] uppercase tracking-widest backdrop-blur glass-card font-semibold">
              {product.category}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-700 hover:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-right ${entered ? "visible" : ""}`}>RepCore Series</div>
          <h1 className={`mt-3 text-5xl sm:text-6xl anim-hero-text anim-delay-1 ${entered ? "visible" : ""}`}>{product.name}</h1>
          <p className={`mt-3 text-lg text-muted-foreground anim-reveal-up anim-delay-2 ${entered ? "visible" : ""}`}>{product.tagline}</p>

          <div className={`mt-6 flex items-baseline gap-3 anim-reveal-up anim-delay-3 ${entered ? "visible" : ""}`}>
            <span className="display text-4xl text-primary text-glow font-black">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-sm text-muted-foreground line-through">₹{Math.round(product.price * 1.3).toLocaleString("en-IN")}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary glow-pulse font-semibold">In stock</span>
          </div>

          <p className={`mt-8 leading-relaxed text-foreground/85 anim-reveal-up anim-delay-4 ${entered ? "visible" : ""}`}>{product.description}</p>

          <ul className={`mt-6 grid gap-2 sm:grid-cols-2 anim-reveal-up anim-delay-5 ${entered ? "visible" : ""}`}>
            {product.features.map((f: string, i: number) => (
              <li key={f} className="flex items-start gap-2 text-sm transition-transform duration-300 hover:translate-x-1" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> <span className="text-foreground/90">{f}</span>
              </li>
            ))}
          </ul>

          <div className={`mt-8 flex flex-wrap items-center gap-3 anim-reveal-up anim-delay-6 ${entered ? "visible" : ""}`}>
            <div className="inline-flex items-center rounded-full border border-border/60 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center hover:text-primary transition-all duration-200 active:scale-75 text-lg font-bold" aria-label="Decrease">−</button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center hover:text-primary transition-all duration-200 active:scale-75 text-lg font-bold" aria-label="Increase">+</button>
            </div>
            <Button variant="hero" size="xl" onClick={handleAdd} className="btn-lift glow-pulse">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
            <Button variant="pill" size="xl" onClick={handleBuy} className="btn-lift">Buy Now</Button>
          </div>

          <div className={`mt-10 grid grid-cols-3 gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground anim-reveal-up anim-delay-7 ${entered ? "visible" : ""}`}>
            <Perk icon={<Truck className="h-4 w-4" />} label="Free over ₹500" />
            <Perk icon={<RotateCcw className="h-4 w-4" />} label="60-day returns" />
            <Perk icon={<ShieldCheck className="h-4 w-4" />} label="Lifetime warranty" />
          </div>

          {/* Interactive Specification Tabs */}
          <div ref={specsReveal.ref} className={`mt-12 anim-reveal-rotate ${specsReveal.visible ? "visible" : ""}`}>
            <div className="flex border-b border-border/40 gap-6 mb-4">
              {(["specs", "shipping", "warranty"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs uppercase tracking-widest transition-all duration-300 relative font-semibold ${
                    activeTab === tab
                       ? "text-primary"
                       : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "specs" ? "Specs" : tab === "shipping" ? "Shipping" : "Warranty"}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 transition-all duration-300">
              {activeTab === "specs" && (
                <dl className="divide-y divide-border/40 rounded-2xl border border-border/60 overflow-hidden bg-card/25 backdrop-blur-md">
                  {product.specs.map((s: { label: string; value: string }, i: number) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between px-4 py-3.5 text-sm transition-all duration-300 hover:bg-primary/5 hover:pl-6"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="font-semibold text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {activeTab === "shipping" && (
                <div className="p-5 rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md text-sm text-muted-foreground/90 space-y-3 leading-relaxed">
                  <p>🚀 Orders are processed within 24 hours and ship via tracked express courier.</p>
                  <p>📦 Free shipping on all orders over ₹500. Flat rate of ₹99 worldwide below ₹500.</p>
                  <p>⏱️ Estimated delivery: 2-4 business days (US/EU) or 5-9 business days (International).</p>
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="p-5 rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md text-sm text-muted-foreground/90 space-y-3 leading-relaxed">
                  <p>🛡️ We stand behind our gear. Every tool features our legendary **RepCore Lifetime Backing**.</p>
                  <p>💪 If your gear fails, breaks, or tears during training under honest use, we replace it. No registration required.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section ref={relatedReveal.ref} className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <h3 className={`text-3xl sm:text-4xl anim-reveal-up ${relatedReveal.visible ? "visible" : ""}`}>More from the lineup</h3>
        <div ref={relatedGridRef} className="mt-8 grid gap-6 sm:grid-cols-3 perspective-container">
          {related.map((p, i) => (
            <RelatedCard key={p.slug} product={p} visible={relatedVisible[i]} index={i} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function RelatedCard({ product: p, visible, index }: { product: typeof products[0]; visible: boolean; index: number }) {
  const tiltRef = useTilt3D(8);
  return (
    <div
      ref={tiltRef}
      className="tilt-3d gradient-border-hover"
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `card-flip-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.15}s both` : "none",
      }}
    >
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/50"
      >
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="display text-base">{p.name}</div>
          <div className="text-sm text-primary font-bold">₹{p.price.toLocaleString("en-IN")}</div>
        </div>
      </Link>
    </div>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
      <span className="text-primary">{icon}</span> <span className="font-semibold text-foreground/80">{label}</span>
    </div>
  );
}
