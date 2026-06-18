import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Headphones,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Truck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site-layout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";
import { getProduct } from "@/lib/products";
import { createOrder, type OrderItem, uploadPaymentScreenshot } from "@/lib/orders";
import { getCouponsList, fetchCoupons, type Coupon } from "@/lib/coupons";
import {
  buildUpiPaymentLink,
  createOrderId,
  formatInr,
  generateUpiQrDataUrl,
  REPCORE_MERCHANT_NAME,
  REPCORE_UPI_ID,
} from "@/lib/upi";
import { toast } from "sonner";
import { useReveal, useTilt3D } from "@/hooks/use-animations";
import { createNoIndexHead } from "@/lib/seo";

const checkoutSearchSchema = z.object({
  product: z.string().optional(),
  qty: z.coerce.number().int().min(1).max(99).optional(),
});

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  email: z.string().trim().email("Enter a valid email address."),
  address: z.string().trim().min(8, "Enter a complete street address."),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().min(2, "Enter your state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
});

type CustomerForm = z.infer<typeof customerSchema>;
type CheckoutStep = "details" | "payment" | "complete";

const initialForm: CustomerForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export const Route = createFileRoute("/checkout")({
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  head: () =>
    createNoIndexHead(
      "Secure UPI Checkout",
      "Complete your RepCore order with secure UPI payment.",
      "/checkout",
    ),
  component: CheckoutPage,
});

function CheckoutPage() {
  const search = Route.useSearch();
  const cart = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const directProduct = search.product ? getProduct(search.product) : null;
  const initialDirectQty = search.qty || 1;
  const [directQty, setDirectQty] = useState(initialDirectQty);
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [touched, setTouched] = useState<Record<keyof CustomerForm, boolean>>({
    fullName: false,
    phone: false,
    email: false,
    address: false,
    city: false,
    state: false,
    pincode: false,
  });
  const [step, setStep] = useState<CheckoutStep>("details");
  const [entered, setEntered] = useState(false);
  const [orderId] = useState(createOrderId);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placedId, setPlacedId] = useState("");

  // Coupon states
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    setCouponsList(getCouponsList());
    const loadCoupons = async () => {
      try {
        const dbCoupons = await fetchCoupons();
        setCouponsList(dbCoupons);
      } catch (err) {
        console.warn("Could not load coupons for checkout validation:", err);
      }
    };
    loadCoupons();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: prev.email || user?.email || "",
      fullName: prev.fullName || profile?.name || "",
    }));
  }, [user, profile]);

  const checkoutLines = useMemo(() => {
    if (directProduct) {
      return [
        {
          slug: directProduct.slug,
          qty: directQty,
          product: directProduct,
          lineTotal: directProduct.price * directQty,
        },
      ];
    }
    return cart.lines;
  }, [cart.lines, directProduct, directQty]);

  const subtotal = checkoutLines.reduce((sum, line) => sum + line.lineTotal, 0);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      return Math.min(appliedCoupon.value, subtotal);
    }
  }, [appliedCoupon, subtotal]);

  const shipping = subtotal === 0 || (subtotal - discountAmount) >= 500 ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + shipping);
  const deliveryEstimate = "3-7 business days after dispatch";
  const upiLink = useMemo(() => buildUpiPaymentLink({ amount: total, orderId }), [orderId, total]);

  useEffect(() => {
    let active = true;
    if (total <= 0) {
      setQrDataUrl("");
      return;
    }
    generateUpiQrDataUrl(upiLink)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => toast.error("Could not generate UPI QR code."));
    return () => {
      active = false;
    };
  }, [total, upiLink]);

  const formResult = customerSchema.safeParse(form);
  const errors = formResult.success
    ? {}
    : Object.fromEntries(
        formResult.error.issues.map((issue) => [issue.path[0] as keyof CustomerForm, issue.message]),
      ) as Partial<Record<keyof CustomerForm, string>>;

  const formReveal = useReveal(0.1);
  const sidebarTilt = useTilt3D(4);

  const updateField = (field: keyof CustomerForm, value: string) => {
    const nextValue = field === "phone" || field === "pincode" ? value.replace(/\D/g, "") : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const continueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
    });
    if (checkoutLines.length === 0) {
      toast.error("Your checkout is empty.");
      return;
    }
    if (!formResult.success) {
      toast.error("Fix the highlighted fields before payment.");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.toUpperCase().trim();
    if (!code) return;
    const match = couponsList.find((c) => c.code === code);
    if (!match) {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }
    if (!match.active) {
      setCouponError("This coupon is no longer active.");
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < match.minOrder) {
      setCouponError(`Min order value for this coupon is ₹${match.minOrder}.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(match);
    toast.success(`Coupon "${code}" applied successfully!`);
  };

  const completePayment = async () => {
    if (!formResult.success) {
      setStep("details");
      toast.error("Complete customer details first.");
      return;
    }
    if (!screenshot) {
      toast.error("Upload your UPI payment screenshot for verification.");
      return;
    }

    setSubmitting(true);
    try {
      const screenshotUrl = await uploadPaymentScreenshot(orderId, screenshot);
      const items: OrderItem[] = checkoutLines.map((line) => ({
        slug: line.product.slug,
        productId: line.product.slug,
        name: line.product.name,
        price: line.product.price,
        qty: line.qty,
        image: line.product.image,
      }));

      const order = await createOrder({
        id: orderId,
        customerName: formResult.data.fullName,
        customerEmail: formResult.data.email,
        phone: formResult.data.phone,
        address: formResult.data.address,
        city: formResult.data.city,
        state: formResult.data.state,
        pincode: formResult.data.pincode,
        total,
        items,
        screenshotUrl,
        utrNumber: utrNumber.trim() || undefined,
        notes: notes.trim()
          ? `${notes.trim()}${appliedCoupon ? ` (Applied Coupon: ${appliedCoupon.code})` : ""}`
          : appliedCoupon
            ? `Applied Coupon: ${appliedCoupon.code}`
            : undefined,
      });

      if (!directProduct) cart.clear();
      setPlacedId(order.id);
      setStep("complete");
      toast.success("Order submitted for payment verification.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your payment proof.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "complete") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 page-transition">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground anim-zoom-bounce visible glow-pulse">
            <Check className="h-9 w-9" />
          </div>
          <h1 className="display mt-6 text-5xl sm:text-7xl anim-reveal-up anim-delay-1 visible">
            Payment submitted.
          </h1>
          <p className="mt-4 text-muted-foreground anim-reveal-up anim-delay-2 visible">
            Your order <span className="text-primary text-glow font-bold">{placedId}</span> is
            pending verification. We will confirm it after checking your UPI payment proof.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 anim-reveal-up anim-delay-3 visible">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate({ to: "/track", search: { id: placedId } })}
              className="btn-lift glow-pulse"
            >
              Track Order
            </Button>
            <Button variant="outline" size="xl" asChild className="btn-lift">
              <Link to="/products">Keep shopping</Link>
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
            Secure UPI Checkout
          </div>
          <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>
            Pay direct. <span className="text-primary text-glow">Lift sooner.</span>
          </h1>
          <div className={`mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground anim-reveal-up anim-delay-2 ${entered ? "visible" : ""}`}>
            <TrustBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="UPI Verified Payment" />
            <TrustBadge icon={<Lock className="h-3.5 w-3.5" />} label="SSL Secure Checkout" />
            <TrustBadge icon={<BadgeCheck className="h-3.5 w-3.5" />} label="Secure Checkout Badge" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 perspective-container">
        <main
          ref={formReveal.ref}
          className={`space-y-8 lg:col-span-2 anim-reveal-up ${formReveal.visible || entered ? "visible" : ""}`}
        >
          {step === "details" ? (
            <form onSubmit={continueToPayment} className="space-y-8">
              <Section title="Customer Details" icon={<Lock className="h-3.5 w-3.5" />}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" error={touched.fullName ? errors.fullName : undefined}>
                    <Input
                      autoComplete="name"
                      required
                      value={form.fullName}
                      onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone Number" error={touched.phone ? errors.phone : undefined}>
                    <Input
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={form.phone}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Email Address" error={touched.email ? errors.email : undefined}>
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </Field>
              </Section>

              <Section title="Shipping Address" icon={<Truck className="h-3.5 w-3.5" />}>
                <Field label="Street Address" error={touched.address ? errors.address : undefined}>
                  <Input
                    autoComplete="street-address"
                    required
                    value={form.address}
                    onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City" error={touched.city ? errors.city : undefined}>
                    <Input
                      autoComplete="address-level2"
                      required
                      value={form.city}
                      onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </Field>
                  <Field label="State" error={touched.state ? errors.state : undefined}>
                    <Input
                      autoComplete="address-level1"
                      required
                      value={form.state}
                      onBlur={() => setTouched((prev) => ({ ...prev, state: true }))}
                      onChange={(e) => updateField("state", e.target.value)}
                    />
                  </Field>
                  <Field label="Pincode" error={touched.pincode ? errors.pincode : undefined}>
                    <Input
                      inputMode="numeric"
                      autoComplete="postal-code"
                      required
                      maxLength={6}
                      value={form.pincode}
                      onBlur={() => setTouched((prev) => ({ ...prev, pincode: true }))}
                      onChange={(e) => updateField("pincode", e.target.value)}
                    />
                  </Field>
                </div>
              </Section>

              <Button type="submit" variant="hero" size="xl" className="w-full btn-lift glow-pulse">
                Continue to UPI Payment <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-8">
              <Section title="UPI Payment" icon={<QrCode className="h-3.5 w-3.5" />}>
                <div className="grid gap-6 md:grid-cols-[320px_1fr]">
                  <div className="rounded-2xl border border-primary/30 bg-background p-4 shadow-[0_0_30px_oklch(0.72_0.21_38/0.12)]">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="RepCore UPI payment QR code" className="aspect-square w-full rounded-xl" />
                    ) : (
                      <div className="grid aspect-square place-items-center rounded-xl bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <PaymentLine label="Merchant" value={REPCORE_MERCHANT_NAME} />
                    <PaymentLine label="UPI ID" value={REPCORE_UPI_ID} />
                    <PaymentLine label="Exact Amount" value={formatInr(total)} highlight />
                    <PaymentLine label="Order Reference" value={orderId} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button type="button" variant="outline" onClick={() => copy(REPCORE_UPI_ID, "UPI ID")} className="btn-lift">
                        <Copy className="h-4 w-4" /> Copy UPI ID
                      </Button>
                      <Button type="button" variant="outline" onClick={() => copy(total.toFixed(2), "Payment amount")} className="btn-lift">
                        <Copy className="h-4 w-4" /> Copy Amount
                      </Button>
                      <Button type="button" variant="hero" asChild className="btn-lift glow-pulse sm:col-span-2">
                        <a href={upiLink}>
                          <Smartphone className="h-4 w-4" /> Open UPI App
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Payment Confirmation" icon={<Upload className="h-3.5 w-3.5" />}>
                <Field label="Upload Payment Screenshot" error={!screenshot ? "Required for verification." : undefined}>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transaction Reference Number / UTR (Optional)">
                    <Input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="e.g. 412345678901" />
                  </Field>
                  <Field label="Notes (Optional)">
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any payment note for the team" className="min-h-11" />
                  </Field>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setStep("details")} className="btn-lift">
                    Edit Details
                  </Button>
                  <Button
                    type="button"
                    variant="hero"
                    size="xl"
                    disabled={submitting}
                    onClick={completePayment}
                    className="flex-1 btn-lift glow-pulse"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    I've Completed Payment
                  </Button>
                </div>
              </Section>
            </div>
          )}
        </main>

        <aside
          ref={sidebarTilt}
          className="h-fit rounded-2xl border border-border/60 bg-card p-6 tilt-3d gradient-border-hover"
        >
          <h3 className="display text-xl">Order Summary</h3>
          <div className="mt-4 space-y-4">
            {checkoutLines.map((line) => (
              <div key={line.slug} className="flex gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
                <img src={line.product.image} alt={line.product.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{line.product.name}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{line.product.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <div className="inline-flex items-center rounded-full border border-border/60 bg-card/40">
                      <button
                        type="button"
                        disabled={!directProduct}
                        onClick={() => setDirectQty(Math.max(1, directQty - 1))}
                        className="grid h-8 w-8 place-items-center disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{line.qty}</span>
                      <button
                        type="button"
                        disabled={!directProduct}
                        onClick={() => setDirectQty(directQty + 1)}
                        className="grid h-8 w-8 place-items-center disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-primary">{formatInr(line.product.price)}</div>
                  </div>
                </div>
              </div>
            ))}
            {checkoutLines.length === 0 && (
              <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                Your checkout is empty. Add gear from the product lineup first.
              </div>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-border/60 pt-4">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError("");
                }}
                placeholder="PROMO CODE"
                className="h-10 text-xs font-mono uppercase focus:ring-1 focus:ring-primary"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="h-10 text-xs border-red-500/20 text-red-400 hover:bg-red-500/5 hover:text-red-300"
                >
                  Remove
                </Button>
              ) : (
                <Button type="submit" variant="outline" className="h-10 text-xs border-primary/20">
                  Apply
                </Button>
              )}
            </form>
            {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
            {appliedCoupon && (
              <p className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Code "{appliedCoupon.code}" applied!
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
            <SummaryRow label="Unit Price" value={checkoutLines.length === 1 ? formatInr(checkoutLines[0].product.price) : "Multiple"} />
            <SummaryRow label="Subtotal" value={formatInr(subtotal)} />
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary font-medium text-xs">
                <dt>Discount ({appliedCoupon?.code}):</dt>
                <dd>-{formatInr(discountAmount)}</dd>
              </div>
            )}
            <SummaryRow label="Shipping Cost" value={shipping === 0 ? "Free" : formatInr(shipping)} />
            <SummaryRow label="Estimated Delivery" value={deliveryEstimate} />
            <div className="flex justify-between border-t border-border/60 pt-3">
              <dt className="font-semibold">Total Amount</dt>
              <dd className="display text-xl text-primary text-glow">{formatInr(total)}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
            <TrustRow icon={<ShieldCheck className="h-4 w-4" />} label="Secure Payments" />
            <TrustRow icon={<Truck className="h-4 w-4" />} label="Fast Shipping" />
            <TrustRow icon={<BadgeCheck className="h-4 w-4" />} label="Premium Quality" />
            <TrustRow icon={<Headphones className="h-4 w-4" />} label="Customer Support" />
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
        {title} {icon}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function PaymentLine({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 break-all font-semibold ${highlight ? "display text-3xl text-primary text-glow" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
      {icon}
      {label}
    </span>
  );
}

function TrustRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/35 px-3 py-2">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}
