import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site-layout";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-animations";
import { toast } from "sonner";
import { createNoIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    createNoIndexHead(
      "Your Cart",
      "Review your RepCore training gear before checkout.",
      "/cart",
    ),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, discount, total, appliedCoupon, applyCoupon, removeCoupon, setQty, remove, count } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const summaryReveal = useReveal(0.1);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 section-glow-divider">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>Cart</div>
          <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>Your Gear.</h1>
          <p className={`mt-3 text-muted-foreground anim-reveal-up anim-delay-2 ${entered ? "visible" : ""}`}>{count} item{count === 1 ? "" : "s"} ready to ship.</p>
        </div>
      </section>

      {lines.length === 0 ? (
        <div className={`mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 anim-reveal-scale ${entered ? "visible" : ""}`}>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary float-anim">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="display mt-6 text-3xl">Empty bag.</h2>
          <p className="mt-2 text-muted-foreground">Add some gear and come back.</p>
          <Button variant="hero" size="lg" className="mt-8 btn-lift glow-pulse" asChild>
            <Link to="/products">Shop the lineup</Link>
          </Button>
        </div>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {lines.map((l, i) => (
              <div
                key={l.slug}
                className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 card-3d gradient-border-hover"
                style={{
                  animation: entered ? `reveal-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s both` : "none",
                }}
              >
                <Link to="/products/$slug" params={{ slug: l.slug }} className="shrink-0">
                  <img src={l.product.image} alt={l.product.name} className="h-24 w-24 rounded-xl object-cover transition-transform duration-500 hover:scale-110" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to="/products/$slug" params={{ slug: l.slug }} className="display text-lg hover:text-primary hover-underline-anim transition-colors duration-300">
                        {l.product.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{l.product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">₹{l.lineTotal.toLocaleString("en-IN")}</div>
                      <div className="text-xs text-muted-foreground">₹{l.product.price.toLocaleString("en-IN")} ea</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border/60 transition-all duration-300 hover:border-primary/40">
                      <button onClick={() => setQty(l.slug, l.qty - 1)} className="grid h-8 w-8 place-items-center hover:text-primary transition-all duration-200 active:scale-90" aria-label="Decrease">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.qty + 1)} className="grid h-8 w-8 place-items-center hover:text-primary transition-all duration-200 active:scale-90" aria-label="Increase">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => remove(l.slug)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-all duration-300 hover:scale-105 active:scale-95">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside
            ref={summaryReveal.ref}
            className={`h-fit rounded-2xl border border-border/60 bg-card p-6 card-3d-alt gradient-border-hover anim-reveal-right ${summaryReveal.visible ? "visible" : ""}`}
          >
            <h3 className="display text-xl">Order summary</h3>
            
            {/* Promo Code Section */}
            <div className="mt-4 border-t border-border/60 pt-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Promo Code</div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{appliedCoupon.code}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{appliedCoupon.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="ml-2 rounded-xl border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code (e.g. REPCORE15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-9 text-xs transition-all duration-300 focus:ring-2 focus:ring-primary/30 uppercase"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="hero"
                    onClick={() => {
                      if (!couponCode.trim()) return;
                      const res = applyCoupon(couponCode);
                      if (res.success) {
                        toast.success(res.message);
                        setCouponCode("");
                      } else {
                        toast.error(res.message);
                      }
                    }}
                    className="h-9 px-3 btn-lift text-xs"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-3 text-sm border-t border-border/60 pt-4">
              <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
              {discount > 0 && (
                <div className="flex items-center justify-between text-primary font-medium">
                  <dt>Discount {appliedCoupon && `(${appliedCoupon.code})`}</dt>
                  <dd>-₹{discount.toLocaleString("en-IN")}</dd>
                </div>
              )}
              <Row label="Shipping" value={shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`} />
              <div className="border-t border-border/60 pt-3">
                <Row label="Total" value={`₹${total.toLocaleString("en-IN")}`} bold />
              </div>
            </dl>
            
            {subtotal < 500 && (
              <p className="mt-4 text-xs text-muted-foreground">
                Add ₹{Math.round(500 - subtotal).toLocaleString("en-IN")} more for free shipping.
              </p>
            )}
            
            <Button variant="hero" size="lg" className="mt-6 w-full btn-lift glow-pulse" asChild>
              <Link to="/checkout">Checkout <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Link to="/products" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground hover-underline-anim transition-colors duration-300">
              Continue shopping
            </Link>
          </aside>        </section>
      )}
    </SiteLayout>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "display text-xl text-primary text-glow" : "font-medium"}>{value}</dd>
    </div>
  );
}
