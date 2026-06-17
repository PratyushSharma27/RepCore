import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site-layout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";
import { saveOrder, getOrdersList, ORDERS_STORAGE_KEY, type Order } from "@/lib/orders";
import { toast } from "sonner";
import { useReveal, useTilt3D } from "@/hooks/use-animations";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — RepCore" },
      { name: "description", content: "Secure checkout for your RepCore order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, shipping, discount, total, appliedCoupon, applyCoupon, removeCoupon, clear } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  // Contact & Shipping Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Pre-populate if logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      if (profile?.name) {
        const parts = profile.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    }
  }, [user, profile]);

  const formReveal = useReveal(0.1);
  const sidebarTilt = useTilt3D(4);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    
    const id = "RC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const customerName = `${firstName} ${lastName}`.trim();
    
    const orderItems = lines.map((l) => ({
      slug: l.product.slug,
      name: l.product.name,
      price: l.product.price,
      qty: l.qty,
      image: l.product.image
    }));
    
    const newOrder: Order = {
      id,
      customerEmail: email,
      customerName,
      items: orderItems,
      total,
      status: "pending",
      shippingAddress: {
        address,
        city,
        postalCode: zip,
        phone: phone || "+91 00000 00000"
      },
      createdAt: new Date().toISOString()
    };
    
    // Save to local cache
    const localOrders = getOrdersList();
    localOrders.push(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localOrders));
    
    // Save to remote (non-blocking database call)
    toast.promise(saveOrder(newOrder), {
      loading: "Recording order in database...",
      success: (success) => {
        if (success) return "Order synchronized to Supabase.";
        return "Order placed (saved locally).";
      },
      error: "Error synchronizing order to Supabase."
    });

    setPlaced(id);
    clear();
  };

  if (placed) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 page-transition">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground anim-zoom-bounce visible glow-pulse">
            <Check className="h-9 w-9" />
          </div>
          <h1 className="display mt-6 text-5xl sm:text-7xl anim-reveal-up anim-delay-1 visible">Order confirmed.</h1>
          <p className="mt-4 text-muted-foreground anim-reveal-up anim-delay-2 visible">
            Your order <span className="text-primary text-glow font-bold">{placed}</span> is being prepped. We'll email tracking shortly.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 anim-reveal-up anim-delay-3 visible">
            <Button variant="hero" size="xl" onClick={() => navigate({ to: "/track", search: { id: placed } })} className="btn-lift glow-pulse">
              Track Order
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate({ to: "/products" })} className="btn-lift">
              Keep shopping
            </Button>
            <Button variant="pill" size="xl" onClick={() => navigate({ to: "/" })} className="btn-lift">
              Home
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60 particle-field">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}>
            Checkout
          </div>
          <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>
            Lock it <span className="text-primary text-glow">in.</span>
          </h1>
        </div>
      </section>

      <form
        onSubmit={submit}
        className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 perspective-container"
      >
        <div
          ref={formReveal.ref}
          className={`space-y-8 lg:col-span-2 anim-reveal-up ${formReveal.visible ? "visible" : ""}`}
        >
          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
            </div>
          </Section>

          <Section title="Shipping">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Last name">
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
            </div>
            <Field label="Address">
              <Input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City">
                <Input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="State">
                <Input
                  required
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="ZIP">
                <Input
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
            </div>
          </Section>

          <Section title="Payment" icon={<Lock className="h-3.5 w-3.5" />}>
            <Field label="Card number">
              <Input
                required
                placeholder="1234 5678 9012 3456"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.2)]"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Expiry">
                <Input
                  required
                  placeholder="MM / YY"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.2)]"
                />
              </Field>
              <Field label="CVC">
                <Input
                  required
                  placeholder="123"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.2)]"
                />
              </Field>
              <Field label="ZIP">
                <Input
                  required
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_20px_oklch(0.72_0.21_38/0.2)]"
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">Demo checkout — no real payment is processed.</p>
          </Section>
        </div>

        <aside
          ref={sidebarTilt}
          className="h-fit rounded-2xl border border-border/60 bg-card p-6 tilt-3d glow-pulse gradient-border-hover animate-pulse-glow"
        >
          <h3 className="display text-xl">Order</h3>
          <div className="mt-4 space-y-3">
            {lines.map((l) => (
              <div key={l.slug} className="flex items-center gap-3 text-sm">
                <img src={l.product.image} alt="" className="h-12 w-12 rounded-lg object-cover transition-transform duration-500 hover:scale-110" />
                <div className="flex-1">
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {l.qty}</div>
                </div>
                <div className="font-medium">₹{l.lineTotal.toLocaleString("en-IN")}</div>
              </div>
            ))}
            {lines.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
          </div>

          {/* Promo Code Fields */}
          <div className="mt-6 border-t border-border/60 pt-4">
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

          <dl className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>₹{subtotal.toLocaleString("en-IN")}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <dt>Discount {appliedCoupon && `(${appliedCoupon.code})`}</dt>
                <dd>-₹{discount.toLocaleString("en-IN")}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</dd>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="display text-xl text-primary text-glow">₹{total.toLocaleString("en-IN")}</dd>
            </div>
          </dl>
          <Button type="submit" variant="hero" size="xl" className="mt-6 w-full btn-lift glow-pulse">
            <CreditCard className="h-4 w-4" /> Place order
          </Button>
        </aside>
      </form>
    </SiteLayout>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
        {title} {icon}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
