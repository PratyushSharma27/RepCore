import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShoppingBag, Calendar, ArrowRight, Lock, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-layout";
import { useAuth } from "@/lib/auth-context";
import { fetchOrders, getOrdersList, getOrderStatusClass, type Order } from "@/lib/orders";
import { useReveal } from "@/hooks/use-animations";
import { createNoIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/orders")({
  head: () =>
    createNoIndexHead(
      "My Orders",
      "Review your RepCore training gear purchase history and tracking details.",
      "/orders",
    ),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [entered, setEntered] = useState(false);

  const tableReveal = useReveal(0.1);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      // Load local cache first for instant feedback
      const cached = getOrdersList();
      const userCached = cached.filter(
        (o) => o.customerEmail.toLowerCase() === user.email?.toLowerCase(),
      );
      setOrders(userCached);

      try {
        const dbOrders = await fetchOrders();
        const userDbOrders = dbOrders.filter(
          (o) => o.customerEmail.toLowerCase() === user.email?.toLowerCase(),
        );
        setOrders(userDbOrders);
      } catch (err) {
        console.warn("Failed to fetch orders from database, using cached local copy:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();

    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, [user]);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60 particle-field">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div
            className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}
          >
            Customer Space
          </div>
          <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>
            Your <span className="text-primary text-glow">orders.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Hydrating Session...
            </p>
          </div>
        ) : !user ? (
          /* Login prompt guard screen */
          <div className="mx-auto max-w-md py-12 text-center space-y-6 anim-reveal-up visible">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20 glow-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="display text-2xl font-bold">Access Protected</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please log in or register a new account to review your order history, invoice details,
              and shipment progress tracker.
            </p>
            <div className="pt-2 text-xs text-muted-foreground">
              Click the Profile icon in the top right header navigation bar to log in.
            </div>
          </div>
        ) : (
          /* Orders list */
          <div
            ref={tableReveal.ref}
            className={`space-y-6 anim-reveal-up ${tableReveal.visible || entered ? "visible" : ""}`}
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md transition-all duration-500 hover:border-primary/20">
              {loadingOrders && orders.length === 0 ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-primary">{o.id}</td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-foreground/90 font-medium">
                            <div className="max-w-xs truncate">
                              {o.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            ₹{o.total.toLocaleString("en-IN")}
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getOrderStatusClass(o.orderStatus)}`}
                            >
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={() => navigate({ to: "/track", search: { id: o.id } })}
                              className="btn-lift glow-pulse text-xs group"
                            >
                              Track Order
                              <ArrowRight className="h-3 w-3 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-16 text-center text-muted-foreground">
                            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            No orders found under your account.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
