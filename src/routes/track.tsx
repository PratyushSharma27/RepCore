import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site-layout";
import { useAuth } from "@/lib/auth-context";
import {
  fetchOrders,
  getOrdersList,
  getOrderStatusClass,
  getOrderStatusStep,
  type Order,
} from "@/lib/orders";
import { useReveal } from "@/hooks/use-animations";
import { z } from "zod";
import { createNoIndexHead } from "@/lib/seo";

const trackSearchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/track")({
  validateSearch: (search) => trackSearchSchema.parse(search),
  head: () =>
    createNoIndexHead(
      "Track Your Order",
      "Track your RepCore training gear order status in real time.",
      "/track",
    ),
  component: TrackPage,
});

function TrackPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderIdInput, setOrderIdInput] = useState(search.id || "");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  // Entrance animations
  const [entered, setEntered] = useState(false);
  const resultsReveal = useReveal(0.1);

  useEffect(() => {
    const loadAllOrders = async () => {
      setLoadingOrders(true);
      // Synchronous local load first
      const cached = getOrdersList();
      setAllOrders(cached);

      try {
        const dbOrders = await fetchOrders();
        setAllOrders(dbOrders);
      } catch (err) {
        console.warn("Failed to retrieve database orders, running on local cache:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadAllOrders();

    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sync found order when query ID or all orders load changes
  useEffect(() => {
    if (search.id && allOrders.length > 0) {
      const target = allOrders.find(
        (o) => o.id.trim().toUpperCase() === search.id!.trim().toUpperCase(),
      );
      setFoundOrder(target || null);
      setSearched(true);
      setOrderIdInput(search.id);
    } else if (!search.id) {
      setFoundOrder(null);
      setSearched(false);
    }
  }, [search.id, allOrders]);

  // Auto-select most recent order if logged in and no order is tracked in query search
  useEffect(() => {
    if (!search.id && user && allOrders.length > 0) {
      const userOrders = allOrders.filter(
        (o) => o.customerEmail.toLowerCase() === user.email?.toLowerCase(),
      );
      if (userOrders.length > 0) {
        navigate({
          to: "/track",
          search: { id: userOrders[0].id },
        });
      }
    }
  }, [search.id, user, allOrders, navigate]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim().toUpperCase();
    if (!cleanId) return;

    navigate({
      to: "/track",
      search: { id: cleanId },
    });
  };

  // Filter orders placed by current logged in customer
  const customerOrders = allOrders.filter(
    (o) => user && o.customerEmail.toLowerCase() === user.email?.toLowerCase(),
  );

  // Calculate dynamic shipping estimate (e.g. 3 days after creation)
  const getDeliveryEstimate = (dateStr: string) => {
    const orderDate = new Date(dateStr);
    const estimate = new Date(orderDate.setDate(orderDate.getDate() + 3));
    return estimate.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const currentStep = foundOrder ? getOrderStatusStep(foundOrder.orderStatus) : 0;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60 particle-field">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div
            className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}
          >
            Real-time Status
          </div>
          <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>
            Track your <span className="text-primary text-glow">package.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 grid gap-10 lg:grid-cols-3">
        {/* LEFT COLUMN: LOOKUP PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/20">
            <h3 className="display text-lg mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" /> Track Order Code
            </h3>
            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="order-id"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Invoice ID
                </Label>
                <Input
                  id="order-id"
                  required
                  placeholder="e.g. RC-A1B2C3"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-primary/30 uppercase font-mono"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full btn-lift glow-pulse">
                Track Package
              </Button>
            </form>
          </div>

          {/* CUSTOMER RECENT ORDERS */}
          {user && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/20">
              <h3 className="display text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Your Orders
              </h3>
              {loadingOrders ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : customerOrders.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {customerOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => navigate({ to: "/track", search: { id: o.id } })}
                      className={`group w-full text-left p-3 rounded-xl border transition-all duration-300 hover:bg-primary/5 flex justify-between items-start cursor-pointer ${
                        search.id === o.id
                          ? "border-primary bg-primary/5"
                          : "border-border/40 bg-card/45"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-bold text-foreground truncate">
                          {o.id}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-primary mt-2.5 font-semibold flex items-center gap-1 group-hover:text-primary/90 transition-colors">
                          Track Order{" "}
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getOrderStatusClass(
                            o.orderStatus,
                          )}`}
                        >
                          {o.orderStatus}
                        </span>
                        <div className="text-xs font-bold mt-2 text-primary">₹{o.total}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No orders placed under your account yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PROGRESS TIMELINE & DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {searched ? (
            foundOrder ? (
              <div
                ref={resultsReveal.ref}
                className={`space-y-6 anim-reveal-up ${resultsReveal.visible || entered ? "visible" : ""}`}
              >
                {/* Visual Timeline Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/20">
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-border/40 pb-4 mb-6">
                    <div>
                      <h2 className="display text-2xl text-primary font-black">{foundOrder.id}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ordered on{" "}
                        {new Date(foundOrder.createdAt).toLocaleDateString("en-IN", {
                          dateStyle: "long",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getOrderStatusClass(foundOrder.orderStatus)}`}
                      >
                        {foundOrder.orderStatus}
                      </span>
                      <span className="rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {foundOrder.paymentStatus}
                      </span>
                    </div>
                    {foundOrder.orderStatus !== "Cancelled" && (
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">
                          Est. Delivery
                        </span>
                        <span className="text-sm font-bold text-foreground mt-1 block">
                          {getDeliveryEstimate(foundOrder.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {foundOrder.orderStatus === "Cancelled" ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400">
                      <AlertCircle className="h-5 w-5 shrink-0 animate-pulse" />
                      <div className="text-sm">
                        <p className="font-semibold">This order has been cancelled.</p>
                        <p className="text-xs mt-1 text-red-300/80">
                          If you believe this is an error or need refund details, contact
                          support@repcore.com.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Dynamic Progress Line */
                    <div className="relative py-8">
                      {/* Grey Connector Line */}
                      <div
                        aria-hidden
                        className="absolute left-6 top-1/2 -translate-y-1/2 right-6 h-0.5 bg-border/60 rounded-full"
                      />
                      {/* Active Glow connector Line */}
                      <div
                        aria-hidden
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_oklch(0.72_0.21_38/0.5)]"
                        style={{
                          width:
                            currentStep === 1
                              ? "0%"
                              : currentStep === 2
                                ? "33%"
                                : currentStep === 3
                                  ? "66%"
                                  : currentStep === 4
                                    ? "100%"
                                    : "0%",
                        }}
                      />

                      <div className="relative flex justify-between">
                        {/* Stage 1: Order Placed */}
                        <TimelineNode
                          icon={<Package />}
                          label="Ordered"
                          done={currentStep >= 1}
                          active={currentStep === 1}
                        />
                        {/* Stage 2: Processing */}
                        <TimelineNode
                          icon={<Loader2 className={currentStep === 2 ? "animate-spin" : ""} />}
                          label="Processing"
                          done={currentStep >= 2}
                          active={currentStep === 2}
                        />
                        {/* Stage 3: Shipped */}
                        <TimelineNode
                          icon={<Truck />}
                          label="Shipped"
                          done={currentStep >= 3}
                          active={currentStep === 3}
                        />
                        {/* Stage 4: Delivered */}
                        <TimelineNode
                          icon={<CheckCircle2 />}
                          label="Delivered"
                          done={currentStep === 4}
                          active={currentStep === 4}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 rounded-xl border border-border/50 bg-secondary/20 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Tracking Number
                      </div>
                      <div className="mt-1 font-mono font-bold text-foreground">
                        {foundOrder.trackingNumber || "Assigned after dispatch"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Payment Review
                      </div>
                      <div className="mt-1 font-bold text-foreground">
                        {foundOrder.paymentStatus}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address & Order Summary */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/20">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary" /> Shipping Destination
                    </h4>
                    <div className="text-sm space-y-1 text-foreground/80 leading-relaxed">
                      <p className="font-semibold text-foreground">{foundOrder.customerName}</p>
                      <p>{foundOrder.shippingAddress?.address}</p>
                      <p>
                        {foundOrder.shippingAddress?.city}, {foundOrder.shippingAddress?.postalCode}
                      </p>
                      <p className="text-xs text-muted-foreground pt-1">
                        {foundOrder.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/20">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-primary" /> Order Items
                    </h4>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 text-sm scrollbar-thin">
                      {foundOrder.items.map((i) => (
                        <div
                          key={i.slug}
                          className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{i.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty {i.qty} • ₹{i.price}
                            </p>
                          </div>
                          <span className="font-bold shrink-0">₹{i.price * i.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/40 pt-3 mt-3 flex justify-between items-center text-sm">
                      <span className="font-semibold">Total Invoice:</span>
                      <span className="display font-black text-primary text-base">
                        ₹{foundOrder.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto animate-bounce" />
                <h3 className="display text-xl font-bold text-foreground">Invoice Not Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  We couldn't locate any package matching code{" "}
                  <strong className="text-primary font-mono">{search.id}</strong>. Double check the
                  ID on your invoice sheet or confirmation screen.
                </p>
                <Button
                  variant="pill"
                  onClick={() => setOrderIdInput("")}
                  className="btn-lift border-primary/20 text-primary"
                >
                  Try another code
                </Button>
              </div>
            )
          ) : (
            /* Blank state help prompt */
            <div className="rounded-2xl border border-border/60 bg-card/30 p-12 text-center space-y-4">
              <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <h3 className="display text-xl">Package Tracker</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Enter your Order Code in the lookup panel to track packaging stages, dynamic
                delivery estimates, and routing information.
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function TimelineNode({
  icon,
  label,
  done,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div
        className={`grid h-12 w-12 place-items-center rounded-full border transition-all duration-700 ${
          done
            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_oklch(0.72_0.21_38/0.4)] scale-105"
            : active
              ? "bg-card border-primary text-primary glow-pulse scale-105"
              : "bg-card border-border/60 text-muted-foreground/60"
        }`}
      >
        <span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      </div>
      <span
        className={`mt-3 text-xs uppercase tracking-widest transition-colors duration-500 font-semibold ${
          done ? "text-foreground" : active ? "text-primary" : "text-muted-foreground/60"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
