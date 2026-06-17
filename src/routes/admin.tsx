import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Ticket,
  Percent,
  LogIn,
  LogOut,
  KeyRound,
  Layers,
  ShoppingBag,
  Eye,
  ShieldAlert,
  Loader2,
  Download,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { useAuth } from "@/lib/auth-context";
import {
  getProductsList,
  PRODUCTS_STORAGE_KEY,
  fetchProducts,
  saveProduct,
  deleteProduct,
  type Product,
} from "@/lib/products";
import {
  getCouponsList,
  saveCouponsList,
  fetchCoupons,
  saveCoupon as saveCouponRemote,
  deleteCoupon as deleteCouponRemote,
  type Coupon,
} from "@/lib/coupons";
import {
  exportOrdersCsv,
  fetchOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  getOrdersList,
  ORDERS_STORAGE_KEY,
  deleteOrder,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getOrderStatusClass,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  mapOrderStatusToLegacy,
} from "@/lib/orders";
import {
  fetchCustomers,
  getCustomersList,
  deleteCustomer,
  CUSTOMERS_STORAGE_KEY,
  type Customer,
} from "@/lib/customers";
import {
  fetchCategories,
  saveCategory,
  deleteCategory,
  getCategoriesList,
  type Category,
} from "@/lib/categories";
import { useReveal, useTilt3D, useStaggerReveal } from "@/hooks/use-animations";
import { createNoIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    createNoIndexHead(
      "Admin Dashboard",
      "Internal admin dashboard for managing the RepCore catalog and coupons.",
      "/admin",
    ),
  component: AdminPage,
});

function AdminPage() {
  // Tabs management
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "categories" | "customers" | "coupons"
  >("dashboard");

  // Auth values
  const { user, isAdmin, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Products state
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditingExistingProduct, setIsEditingExistingProduct] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [isEditingExistingCoupon, setIsEditingExistingCoupon] = useState(false);

  // Orders, Customers, Categories states
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | PaymentStatus>("all");

  // Detailed Modal states
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatId, setNewCatId] = useState("");

  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // 1. Initial synchronous loads from cache
    setItems(getProductsList());
    setCoupons(getCouponsList());
    setOrders(getOrdersList());
    setCustomers(getCustomersList());
    setCategories(getCategoriesList());

    // 2. Asynchronous remote load from Supabase database
    const loadData = async () => {
      const dbProducts = await fetchProducts();
      setItems(dbProducts);
      const dbCoupons = await fetchCoupons();
      setCoupons(dbCoupons);
      const dbOrders = await fetchOrders();
      setOrders(dbOrders);
      const dbCustomers = await fetchCustomers();
      setCustomers(dbCustomers);
      const dbCategories = await fetchCategories();
      setCategories(dbCategories);
    };
    loadData();

    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const [tabAnimate, setTabAnimate] = useState(false);
  useEffect(() => {
    setTabAnimate(false);
    const t = setTimeout(() => setTabAnimate(true), 50);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Computed Dashboard Metrics
  const activeOrders = orders.filter((o) => o.orderStatus !== "Cancelled");
  const totalSales = activeOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = activeOrders.length > 0 ? Math.round(totalSales / activeOrders.length) : 0;
  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [
        o.id,
        o.customerName,
        o.customerEmail,
        o.shippingAddress.phone,
        o.trackingNumber || "",
        o.utrNumber || "",
      ].some((value) => value.toLowerCase().includes(q));
    const matchesOrder = orderStatusFilter === "all" || o.orderStatus === orderStatusFilter;
    const matchesPayment = paymentStatusFilter === "all" || o.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesOrder && matchesPayment;
  });

  // Products average pricing
  const totalProductValue = items.reduce((s, p) => s + p.price, 0);
  const avgProductPrice = items.length > 0 ? Math.round(totalProductValue / items.length) : 0;

  // Coupons stats
  const activeCouponsCount = coupons.filter((c) => c.active).length;
  const maxDiscountLabel = coupons.reduce(
    (max, c) => {
      const label = c.type === "percentage" ? `${c.value}%` : `₹${c.value}`;
      return c.value > max.val ? { val: c.value, label } : max;
    },
    { val: 0, label: "0" },
  ).label;

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await login(email, password);
    setLoginLoading(false);
    if (res.success) {
      if (email.toLowerCase() === "pratyush@tenimal.com") {
        toast.success("Welcome, Administrator.");
      } else {
        toast.error("Access Denied: Only pratyush@tenimal.com is authorized.");
      }
    } else {
      toast.error(res.error || "Login failed.");
    }
  };

  // Product Actions
  const openNew = () => {
    setIsEditingExistingProduct(false);
    setEditing({
      slug: "",
      name: "",
      tagline: "",
      price: 0,
      category: categories[0]?.name || "",
      image: "",
      description: "",
      features: [],
      specs: [],
    });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setIsEditingExistingProduct(true);
    setEditing(p);
    setOpen(true);
  };

  const save = async (p: Product) => {
    const updated = [...items];
    const i = updated.findIndex((x) => x.slug === p.slug);
    if (i === -1) {
      updated.push(p);
    } else {
      updated[i] = p;
    }
    setItems(updated);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    setOpen(false);

    toast.promise(saveProduct(p), {
      loading: "Saving to database...",
      success: (success) => {
        if (success) return "Saved to Supabase database.";
        return "Saved locally (Supabase table missing or offline).";
      },
      error: "Error saving to Supabase database.",
    });
  };

  const remove = async (slug: string) => {
    const updated = items.filter((p) => p.slug !== slug);
    setItems(updated);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));

    toast.promise(deleteProduct(slug), {
      loading: "Removing from database...",
      success: (success) => {
        if (success) return "Removed from Supabase database.";
        return "Removed locally.";
      },
      error: "Error removing from Supabase database.",
    });
  };

  // Coupon Actions
  const openNewCoupon = () => {
    setIsEditingExistingCoupon(false);
    setEditingCoupon({
      code: "",
      type: "percentage",
      value: 10,
      minOrder: 0,
      active: true,
      description: "",
    });
    setCouponOpen(true);
  };

  const openEditCoupon = (c: Coupon) => {
    setIsEditingExistingCoupon(true);
    setEditingCoupon(c);
    setCouponOpen(true);
  };

  const saveCoupon = async (c: Coupon) => {
    const codeUpper = c.code.toUpperCase().trim();
    if (!codeUpper) {
      toast.error("Coupon code is required.");
      return;
    }
    const updated = [...coupons];
    const idx = updated.findIndex((x) => x.code === codeUpper);
    const couponToSave = { ...c, code: codeUpper };
    if (idx === -1) {
      if (coupons.some((x) => x.code === codeUpper)) {
        toast.error("A coupon with this code already exists.");
        return;
      }
      updated.push(couponToSave);
    } else {
      updated[idx] = couponToSave;
    }
    setCoupons(updated);
    saveCouponsList(updated);
    setCouponOpen(false);

    toast.promise(saveCouponRemote(couponToSave), {
      loading: "Saving coupon to database...",
      success: (success) => {
        if (success) return "Coupon saved to Supabase successfully.";
        return "Coupon saved locally.";
      },
      error: "Error saving coupon to Supabase.",
    });
  };

  const removeCoupon = async (code: string) => {
    const updated = coupons.filter((c) => c.code !== code);
    setCoupons(updated);
    saveCouponsList(updated);

    toast.promise(deleteCouponRemote(code), {
      loading: "Removing coupon from database...",
      success: (success) => {
        if (success) return "Coupon removed from Supabase.";
        return "Coupon removed locally.";
      },
      error: "Error removing coupon from Supabase.",
    });
  };

  // Order Actions
  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, orderStatus: status, status: mapOrderStatusToLegacy(status) } : o,
    );
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    toast.success(`Order status updated to ${status}.`);

    toast.promise(updateOrderStatus(id, status), {
      loading: "Updating status in remote database...",
      success: (success) => {
        if (success) return "Remote order status synced.";
        return "Local status updated (table missing/offline).";
      },
      error: "Error syncing status to Supabase.",
    });
  };

  const handleUpdatePaymentStatus = async (id: string, paymentStatus: PaymentStatus) => {
    const updated = orders.map((o) => {
      if (o.id !== id) return o;
      const nextOrderStatus =
        paymentStatus === "Verified"
          ? "Confirmed"
          : paymentStatus === "Rejected"
            ? "Cancelled"
            : o.orderStatus;
      return {
        ...o,
        paymentStatus,
        orderStatus: nextOrderStatus,
        status: mapOrderStatusToLegacy(nextOrderStatus),
      };
    });
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    toast.promise(updatePaymentStatus(id, paymentStatus), {
      loading: "Syncing payment decision...",
      success: (success) => (success ? "Payment status synced." : "Payment updated locally."),
      error: "Error syncing payment status.",
    });
  };

  const handleTrackingChange = async (id: string, trackingNumber: string) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, trackingNumber } : o));
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    toast.promise(updateTrackingNumber(id, trackingNumber), {
      loading: "Saving tracking number...",
      success: (success) => (success ? "Tracking number synced." : "Tracking saved locally."),
      error: "Error syncing tracking number.",
    });
  };

  const handleExportOrders = () => {
    const csv = exportOrdersCsv(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repcore-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoveOrder = async (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    toast.promise(deleteOrder(id), {
      loading: "Removing order from database...",
      success: (success) => {
        if (success) return "Order removed from Supabase.";
        return "Order removed locally.";
      },
      error: "Error removing order from Supabase.",
    });
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newCatId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const name = newCatName.trim();
    if (!slug || !name) {
      toast.error("Category name and slug ID are required.");
      return;
    }
    if (categories.some((c) => c.id === slug)) {
      toast.error("A category with this ID slug already exists.");
      return;
    }
    const newCat = { id: slug, name };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("repcore_categories", JSON.stringify(updated));
    setCategoryOpen(false);
    setNewCatName("");
    setNewCatId("");

    toast.promise(saveCategory(newCat), {
      loading: "Saving category to remote...",
      success: (success) => {
        if (success) return "Category synced to Supabase.";
        return "Category saved locally.";
      },
      error: "Error syncing category to Supabase.",
    });
  };

  const handleRemoveCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem("repcore_categories", JSON.stringify(updated));
    toast.success("Category deleted.");

    toast.promise(deleteCategory(id), {
      loading: "Deleting category from remote...",
      success: (success) => {
        if (success) return "Category removed from Supabase.";
        return "Category removed locally.";
      },
      error: "Error deleting category from Supabase.",
    });
  };

  const handleRemoveCustomer = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer? This action cannot be undone.",
      )
    ) {
      return;
    }
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));

    toast.promise(deleteCustomer(id), {
      loading: "Removing customer from database...",
      success: (success) => {
        if (success) return "Customer removed from Supabase.";
        return "Customer removed locally.";
      },
      error: "Error removing customer from Supabase.",
    });
  };

  // loading check screen
  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary glow-pulse" />
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Hydrating Session...
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // Access Denied / Custom Admin Login Page
  if (!user || !isAdmin) {
    return (
      <SiteLayout>
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none opacity-20 blur-3xl -z-10"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.21 38 / 0.3), transparent 75%)",
          }}
        />
        <section className="mx-auto max-w-md px-4 py-24 sm:px-6">
          {user ? (
            // Logged in as non-admin customer
            <div className="group overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-8 shadow-xl text-center relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-destructive/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive mx-auto glow-pulse mb-4">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h2 className="display text-2xl font-bold tracking-tight">Access Restricted</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                You are currently signed in as{" "}
                <span className="font-semibold text-foreground">{user.email}</span>. Only{" "}
                <strong className="text-primary font-bold">pratyush@tenimal.com</strong> can access
                the administrator control dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  variant="hero"
                  onClick={() => navigate({ to: "/" })}
                  className="btn-lift w-full"
                >
                  Back to Storefront
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="btn-lift w-full border-destructive/20 hover:bg-destructive/5 text-destructive"
                >
                  Sign Out & Switch Account
                </Button>
              </div>
            </div>
          ) : (
            // Not logged in gate
            <div className="group overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-8 shadow-xl relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5 transition-transform duration-500 hover:scale-110 hover:rotate-12 glow-pulse mb-4">
                  <KeyRound />
                </div>
                <h2 className="display text-2xl font-bold tracking-tight">Admin Gate</h2>
                <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                  Access is restricted to authorized administrators only.
                </p>
              </div>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <Field label="Admin Email">
                  <Input
                    type="email"
                    required
                    placeholder="pratyush@tenimal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Button
                  type="submit"
                  disabled={loginLoading}
                  variant="hero"
                  className="w-full mt-6 btn-lift glow-pulse flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Log In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-border/40 pt-4 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Administrator Username:
                </span>
                <div className="mt-1 text-xs font-mono text-primary font-bold">
                  pratyush@tenimal.com
                </div>
              </div>
            </div>
          )}
        </section>
      </SiteLayout>
    );
  }

  // Render Full Admin Control Panel
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60 particle-field">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-16 sm:px-6">
          <div>
            <div
              className={`text-xs uppercase tracking-[0.3em] text-primary anim-reveal-left ${entered ? "visible" : ""}`}
            >
              Admin Control
            </div>
            <h1 className={`mt-3 text-5xl sm:text-7xl anim-hero-text ${entered ? "visible" : ""}`}>
              System <span className="text-primary text-glow">Panel.</span>
            </h1>
            <p
              className={`mt-3 text-muted-foreground anim-reveal-up anim-delay-2 ${entered ? "visible" : ""}`}
            >
              Managing catalog, active orders, coupons, customer roster, and inventory categories.
            </p>
          </div>

          <div className={`flex gap-3 anim-reveal-up anim-delay-3 ${entered ? "visible" : ""}`}>
            {activeTab === "products" && (
              <Button variant="hero" size="lg" onClick={openNew} className="btn-lift glow-pulse">
                <Plus className="h-4 w-4" /> New product
              </Button>
            )}
            {activeTab === "coupons" && (
              <Button
                variant="hero"
                size="lg"
                onClick={openNewCoupon}
                className="btn-lift glow-pulse"
              >
                <Plus className="h-4 w-4" /> New coupon
              </Button>
            )}
            {activeTab === "categories" && (
              <Button
                variant="hero"
                size="lg"
                onClick={() => setCategoryOpen(true)}
                className="btn-lift glow-pulse"
              >
                <Plus className="h-4 w-4" /> New category
              </Button>
            )}
            {activeTab === "orders" && (
              <Button
                variant="hero"
                size="lg"
                onClick={handleExportOrders}
                className="btn-lift glow-pulse"
              >
                <Download className="h-4 w-4" /> Export orders
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={logout}
              className="btn-lift border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5 text-destructive/90 cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLLABLE TABS */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex border-b border-border/40 gap-6 overflow-x-auto pb-1 scrollbar-thin">
          {(
            [
              { id: "dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
              { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
              { id: "products", label: "Products", icon: <Package className="h-4 w-4" /> },
              { id: "categories", label: "Categories", icon: <Layers className="h-4 w-4" /> },
              { id: "customers", label: "Customers", icon: <Users className="h-4 w-4" /> },
              { id: "coupons", label: "Coupons", icon: <Ticket className="h-4 w-4" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm uppercase tracking-widest transition-all duration-300 relative font-bold flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full glow-pulse" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* DASHBOARD TAB METRICS & VIEWS */}
      {activeTab === "dashboard" && (
        <>
          <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 perspective-container">
            <StatCard
              icon={<TrendingUp />}
              label="Total Sales"
              value={`₹${totalSales.toLocaleString("en-IN")}`}
              visible={tabAnimate}
              index={0}
            />
            <StatCard
              icon={<ShoppingBag />}
              label="Orders Count"
              value={String(orders.length)}
              visible={tabAnimate}
              index={1}
              onClick={() => setActiveTab("orders")}
            />
            <StatCard
              icon={<Users />}
              label="Registered Customers"
              value={String(customers.length)}
              visible={tabAnimate}
              index={2}
            />
            <StatCard
              icon={<DollarSign />}
              label="Avg Order Value"
              value={`₹${avgOrderValue.toLocaleString("en-IN")}`}
              visible={tabAnimate}
              index={3}
            />
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 grid gap-6 md:grid-cols-3">
            {/* Recent Orders block */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/20">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="display text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Recent Orders
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("orders")}
                  className="btn-lift text-xs"
                >
                  Open Orders
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Total</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setActiveTab("orders")}
                        className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-3 px-2 font-mono text-xs">{o.id}</td>
                        <td className="py-3 px-2 font-medium">
                          {o.customerName || o.customerEmail}
                        </td>
                        <td className="py-3 px-2 text-primary font-bold">
                          ₹{o.total.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getOrderStatusClass(o.orderStatus)}`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No orders received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catalog Info block */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/20 space-y-6">
              <div>
                <h3 className="display text-lg mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Inventory Summary
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <dt className="text-muted-foreground">Total Products</dt>
                    <dd className="font-bold text-foreground">{items.length}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <dt className="text-muted-foreground">Avg Product Price</dt>
                    <dd className="font-bold text-foreground">
                      ₹{avgProductPrice.toLocaleString("en-IN")}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <dt className="text-muted-foreground">Active Categories</dt>
                    <dd className="font-bold text-foreground">{categories.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Active Coupons</dt>
                    <dd className="font-bold text-foreground">{activeCouponsCount}</dd>
                  </div>
                </dl>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-2">
                <Button
                  className="w-full btn-lift glow-pulse text-xs"
                  onClick={() => setActiveTab("products")}
                >
                  Manage Products
                </Button>
                <Button
                  variant="outline"
                  className="w-full btn-lift text-xs border-primary/20"
                  onClick={() => setActiveTab("orders")}
                >
                  Review Orders
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ORDERS QUEUE TAB */}
      {activeTab === "orders" && (
        <section
          className={`mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 anim-reveal-up ${tabAnimate ? "visible" : ""}`}
        >
          <div className="mb-4 grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order, customer, UTR, tracking..."
                className="pl-9"
              />
            </div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as "all" | OrderStatus)}
              className="h-10 rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold uppercase tracking-widest"
            >
              <option value="all">All order statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as "all" | PaymentStatus)}
              className="h-10 rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold uppercase tracking-widest"
            >
              <option value="all">All payments</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            {filteredOrders.map((o) => {
              const safeItems = Array.isArray(o.items) ? o.items : [];
              const itemCount = safeItems.reduce((s, i) => s + Number(i.qty || 0), 0);
              const itemSummary =
                safeItems.map((item) => `${item.name || "Item"} x${item.qty || 1}`).join(", ") ||
                "No items";

              return (
                <article
                  key={o.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/30 sm:p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-start">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-black text-primary">{o.id}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${getOrderStatusClass(o.orderStatus)}`}
                        >
                          {o.orderStatus}
                        </span>
                        <span className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {o.paymentStatus}
                        </span>
                      </div>

                      <div>
                        <div className="font-semibold text-foreground">
                          {o.customerName || "Unnamed customer"}
                        </div>
                        <div className="mt-1 break-all text-xs text-muted-foreground">
                          {o.customerEmail}
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                        <div>
                          <span className="block uppercase tracking-widest text-muted-foreground/70">
                            Date
                          </span>
                          <span className="font-medium text-foreground">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="block uppercase tracking-widest text-muted-foreground/70">
                            Items
                          </span>
                          <span className="font-medium text-foreground">{itemCount}</span>
                        </div>
                        <div>
                          <span className="block uppercase tracking-widest text-muted-foreground/70">
                            Total
                          </span>
                          <span className="font-bold text-primary">
                            ₹{o.total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <p className="line-clamp-2 text-xs text-muted-foreground">{itemSummary}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Order Status
                        </span>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                          className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Payment
                        </span>
                        <select
                          value={o.paymentStatus}
                          onChange={(e) =>
                            handleUpdatePaymentStatus(o.id, e.target.value as PaymentStatus)
                          }
                          className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Tracking Number
                        </span>
                        <Input
                          defaultValue={o.trackingNumber || ""}
                          onBlur={(e) => {
                            if (e.target.value !== (o.trackingNumber || "")) {
                              handleTrackingChange(o.id, e.target.value);
                            }
                          }}
                          placeholder="Add after dispatch"
                          className="h-10 font-mono text-xs"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 lg:flex-col lg:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderDetail(o)}
                        className="btn-lift flex-1 lg:flex-none"
                      >
                        <Eye className="h-4 w-4" /> Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOrder(o.id)}
                        className="flex-1 text-destructive hover:text-destructive lg:flex-none"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="rounded-2xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                No orders match the current view.
              </div>
            )}
          </div>
        </section>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <section
          className={`mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 anim-reveal-up ${tabAnimate ? "visible" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/30">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.slug}
                    className="border-b border-border/40 last:border-0 transition-all duration-300 hover:bg-primary/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-secondary" />
                        )}
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.category}</td>
                    <td className="p-4 font-medium text-primary">
                      ₹{p.price.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        className="hover:scale-110 hover:text-primary transition-all duration-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(p.slug)}
                        className="hover:scale-110 hover:text-destructive transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No products found. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && (
        <section
          className={`mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 anim-reveal-up ${tabAnimate ? "visible" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/30">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4">Slug ID</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Products count</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const pCount = items.filter(
                    (p) =>
                      p.category.toLowerCase() === c.name.toLowerCase() ||
                      p.category.toLowerCase() === c.id.toLowerCase(),
                  ).length;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4 font-mono font-semibold">{c.id}</td>
                      <td className="p-4 font-medium text-foreground">{c.name}</td>
                      <td className="p-4 text-muted-foreground">{pCount} products</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCategory(c.id)}
                          className="hover:scale-110 hover:text-destructive transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No categories setup. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CUSTOMERS ROSTER TAB */}
      {activeTab === "customers" && (
        <section
          className={`mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 anim-reveal-up ${tabAnimate ? "visible" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/30">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4">Total Orders Placed</th>
                  <th className="p-4 font-medium text-right text-primary">Lifetime Spend</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const custOrders = orders.filter(
                    (o) => o.customerEmail.toLowerCase() === c.email.toLowerCase(),
                  );
                  const activeCustOrders = custOrders.filter((o) => o.orderStatus !== "Cancelled");
                  const totalSpent = activeCustOrders.reduce((sum, o) => sum + o.total, 0);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground">{c.name || "—"}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{c.email}</td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-muted-foreground">{custOrders.length} orders</td>
                      <td className="p-4 font-bold text-primary text-right">
                        ₹{totalSpent.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCustomer(c.id)}
                          className="hover:scale-110 hover:text-destructive transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No customers in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* PROMO COUPONS TAB */}
      {activeTab === "coupons" && (
        <section
          className={`mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 anim-reveal-up ${tabAnimate ? "visible" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/30">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr
                    key={c.code}
                    className="border-b border-border/40 last:border-0 transition-all duration-300 hover:bg-primary/5"
                  >
                    <td className="p-4 font-bold text-primary tracking-wider uppercase">
                      {c.code}
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {c.type === "percentage"
                        ? `${c.value}% Off`
                        : `₹${c.value.toLocaleString("en-IN")} Off`}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      ₹{c.minOrder.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-muted-foreground truncate max-w-xs">
                      {c.description || "—"}
                    </td>
                    <td className="p-4">
                      {c.active ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-500/10 border border-zinc-500/30 px-2 py-0.5 text-xs text-zinc-400 font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditCoupon(c)}
                        className="hover:scale-110 hover:text-primary transition-all duration-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCoupon(c.code)}
                        className="hover:scale-110 hover:text-destructive transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No active coupons found. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Product Edit / Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditingExistingProduct ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save(editing);
              }}
              className="space-y-4"
            >
              <Field label="Slug">
                <Input
                  value={editing.slug}
                  required
                  disabled={isEditingExistingProduct}
                  placeholder="e.g. wrist-support"
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Name">
                <Input
                  value={editing.name}
                  required
                  placeholder="e.g. Wrist Support"
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Tagline">
                <Input
                  value={editing.tagline}
                  placeholder="e.g. Lock in. Press heavier."
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Price (₹)">
                  <Input
                    type="number"
                    step="1"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })
                    }
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
              </div>
              <Field label="Image Path / URL">
                <Input
                  value={editing.image}
                  placeholder="e.g. /src/assets/p-wrist.jpg"
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={4}
                  value={editing.description}
                  placeholder="Pro-grade wraps designed to stabilize wrist joints under heavy loads..."
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <DialogFooter>
                <Button type="button" variant="pill" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="btn-lift glow-pulse">
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Coupon Edit / Add Dialog */}
      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditingExistingCoupon ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCoupon(editingCoupon);
              }}
              className="space-y-4"
            >
              <Field label="Coupon Code">
                <Input
                  value={editingCoupon.code}
                  required
                  disabled={isEditingExistingCoupon}
                  placeholder="e.g. SUMMER20"
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 uppercase"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Discount Type">
                  <select
                    value={editingCoupon.type}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </Field>
                <Field label="Discount Value">
                  <Input
                    type="number"
                    required
                    value={editingCoupon.value}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })
                    }
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Minimum Order (₹)">
                  <Input
                    type="number"
                    required
                    value={editingCoupon.minOrder}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        minOrder: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={editingCoupon.active ? "true" : "false"}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, active: e.target.value === "true" })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  rows={3}
                  value={editingCoupon.description}
                  placeholder="e.g. 15% off your entire purchase"
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, description: e.target.value })
                  }
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <DialogFooter>
                <Button type="button" variant="pill" onClick={() => setCouponOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="btn-lift glow-pulse">
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Add Dialog */}
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Field label="Category Name">
              <Input
                value={newCatName}
                required
                placeholder="e.g. Strength Training"
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  // Dynamic Slug generation
                  setNewCatId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                }}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Category Slug ID">
              <Input
                value={newCatId}
                required
                placeholder="e.g. strength-training"
                onChange={(e) => setNewCatId(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="pill" onClick={() => setCategoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="btn-lift glow-pulse">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!orderDetail} onOpenChange={(open) => !open && setOrderDetail(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh]">
          {orderDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center text-xl font-black">
                  <span>Order Invoice {orderDetail.id}</span>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border mr-4 ${getOrderStatusClass(orderDetail.orderStatus)}`}
                  >
                    {orderDetail.orderStatus}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Customer Details */}
                <div className="grid gap-4 sm:grid-cols-2 text-sm border-b border-border/40 pb-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Customer Details
                    </h4>
                    <p className="font-semibold">{orderDetail.customerName || "—"}</p>
                    <p className="text-muted-foreground">{orderDetail.customerEmail}</p>
                    <p className="text-muted-foreground">{orderDetail.shippingAddress?.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Shipping Address
                    </h4>
                    <p className="text-muted-foreground">{orderDetail.shippingAddress?.address}</p>
                    <p className="text-muted-foreground">
                      {orderDetail.shippingAddress?.city}, {orderDetail.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>

                {/* Items details table */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Order Items
                  </h4>
                  <div className="rounded-xl border border-border/60 overflow-hidden bg-card/20 text-sm">
                    <table className="w-full text-left">
                      <thead className="border-b border-border/60 bg-secondary/40 text-xs text-muted-foreground uppercase">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail.items.map((item) => (
                          <tr key={item.slug} className="border-b border-border/40 last:border-0">
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3 text-center text-muted-foreground">x{item.qty}</td>
                            <td className="p-3 text-right text-muted-foreground">
                              ₹{item.price.toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              ₹{(item.price * item.qty).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">
                        ₹
                        {orderDetail.items
                          .reduce((s, i) => s + i.price * i.qty, 0)
                          .toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2 text-lg">
                      <span className="font-bold">Total Paid:</span>
                      <span className="font-black text-primary">
                        ₹{orderDetail.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="pill"
                  onClick={() => setOrderDetail(null)}
                  className="btn-lift w-full sm:w-auto"
                >
                  Close Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  visible,
  index,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  visible: boolean;
  index: number;
  onClick?: () => void;
}) {
  const tiltRef = useTilt3D(8);
  return (
    <div
      ref={tiltRef}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`tilt-3d gradient-border-hover ${onClick ? "cursor-pointer" : ""}`}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible
          ? `card-flip-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.12}s both`
          : "none",
      }}
    >
      <div className="rounded-2xl border border-border/60 bg-card p-6 transition-all duration-500 hover:border-primary/50">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5 transition-transform duration-500 hover:scale-110 hover:rotate-12 glow-pulse">
          {icon}
        </div>
        <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="display mt-1 text-3xl text-glow">{value}</div>
      </div>
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
