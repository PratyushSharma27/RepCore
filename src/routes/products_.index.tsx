import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { getProductsList, fetchProducts, type Product } from "@/lib/products";

import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useReveal, useTilt3D } from "@/hooks/use-animations";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/products_/")({
  head: () =>
    createPageHead({
      title: "Shop All Training Gear",
      description:
        "Browse all RepCore training equipment: resistance bands, lifting straps, wrist wraps, grip strengtheners, protein shakers, foam rollers and massage guns.",
      path: "/products",
      keywords:
        "buy training gear, gym accessories, resistance bands, lifting straps, wrist wraps, massage gun, foam roller",
    }),
  component: ProductsPage,
});

function ProductsPage() {
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(getProductsList());
    const load = async () => {
      const dbProducts = await fetchProducts();
      setItems(dbProducts);
    };
    load();
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((p) => p.category)))], [items]);

  const filtered = useMemo(() => {
    let list = items.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (query && !`${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, query, cat, sort]);

  // Page entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const filterReveal = useReveal(0.1);
  const gridReveal = useReveal(0.05);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 section-glow-divider particle-field">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>The Lineup</div>
          <h1 className={`mt-4 text-6xl sm:text-8xl anim-hero-text ${entered ? "visible" : ""}`}>
            All <span className="text-primary text-glow">Gear.</span>
          </h1>
          <p className={`mt-6 max-w-xl text-muted-foreground anim-reveal-up anim-delay-3 ${entered ? "visible" : ""}`}>
            Seven essential tools. Built for the people who actually train.
          </p>
        </div>
      </section>

      <section ref={filterReveal.ref} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between anim-reveal-up ${filterReveal.visible ? "visible" : ""}`}>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear…"
              className="pl-9 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.2)]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-widest transition-all duration-300 ${
                  cat === c
                    ? "border-primary bg-primary/10 text-primary glow-pulse scale-105"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:scale-105"
                }`}
              >
                {c}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:border-primary/40"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>
      </section>

      <section ref={gridReveal.ref} className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground anim-reveal-scale visible">No gear matches your filters.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 perspective-container">
            {filtered.map((p, i) => (
              <ProductCard3D
                key={p.slug}
                product={p}
                index={i}
                visible={gridReveal.visible}
                onAdd={() => { add(p.slug); toast.success(`${p.name} added`); }}
              />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ProductCard3D({
  product: p,
  index,
  visible,
  onAdd,
}: {
  product: Product;
  index: number;
  visible: boolean;
  onAdd: () => void;
}) {
  const tiltRef = useTilt3D(10);

  return (
    <div
      ref={tiltRef}
      className="tilt-3d gradient-border-hover"
      style={{
        opacity: visible ? 1 : 0,
        animation: visible
          ? `tilt-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`
          : "none",
      }}
    >
      <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/50">
        <Link to="/products/$slug" params={{ slug: p.slug }} className="block">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              width={800}
              height={800}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur glass-card">
              {p.category}
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between gap-3 p-5">
          <Link to="/products/$slug" params={{ slug: p.slug }} className="min-w-0">
            <div className="display truncate text-lg leading-tight">{p.name}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{p.tagline}</div>
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="text-lg font-semibold text-primary">₹{p.price.toLocaleString("en-IN")}</div>
            <Button
              size="sm"
              variant="hero"
              onClick={onAdd}
              className="btn-lift"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
