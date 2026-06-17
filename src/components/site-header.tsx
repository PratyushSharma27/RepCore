import { Link } from "@tanstack/react-router";
import { ShoppingBag, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Gear" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, profile, isAdmin, login, signUp, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        const res = await login(email, password);
        if (res.success) {
          toast.success("Welcome back!");
          setAuthOpen(false);
          setEmail("");
          setPassword("");
        } else {
          toast.error(res.error || "Login failed");
        }
      } else {
        const res = await signUp(email, password, name);
        if (res.success) {
          toast.success("Account created successfully!");
          setAuthOpen(false);
          setEmail("");
          setPassword("");
          setName("");
        } else {
          toast.error(res.error || "Registration failed");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-500 ${
        scrolled
          ? "border-border/60 bg-background/90 shadow-[0_4px_30px_oklch(0_0_0/0.3)]"
          : "border-border/30 bg-background/60"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[image:var(--gradient-fire)] text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_oklch(0.72_0.21_38/0.5)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M6 4h3v6h6V4h3v16h-3v-6H9v6H6V4z" />
            </svg>
          </span>
          <span className="display text-lg tracking-wider">RepCore</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover-underline-anim nav-magnetic"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-primary/5 text-sm font-bold text-foreground transition-all duration-300 hover:border-primary/60 hover:scale-105 cursor-pointer">
                  {profile?.name ? profile.name.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border border-border/40 backdrop-blur-md">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground leading-none">{profile?.name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingBag className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="pill"
              size="sm"
              onClick={() => {
                setAuthMode("login");
                setAuthOpen(true);
              }}
              className="btn-lift"
            >
              Sign In
            </Button>
          )}

          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60 text-foreground transition-all duration-300 hover:border-primary/60 hover:text-primary hover:scale-110 hover:shadow-[0_0_15px_oklch(0.72_0.21_38/0.3)] active:scale-95"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                style={{ animation: "zoom-in-bounce 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                {count}
              </span>
            )}
          </Link>
          <Button variant="hero" size="sm" asChild className="hidden sm:inline-flex btn-lift">
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>
      </div>

      {/* AUTHENTICATION DIALOG */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-[420px] glass-card border border-border/40 backdrop-blur-xl shadow-[0_20px_50px_oklch(0_0_0/0.4)]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-black text-center tracking-tight">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <p className="text-center text-xs text-muted-foreground">
              {authMode === "login"
                ? "Sign in to your RepCore athletic account"
                : "Register to track orders and manage workouts"}
            </p>
          </DialogHeader>
          <form onSubmit={handleAuthSubmit} className="space-y-4 py-4">
            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <Button type="submit" disabled={authLoading} className="w-full btn-lift glow-pulse mt-2">
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : authMode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="text-center text-xs text-muted-foreground border-t border-border/40 pt-4">
            {authMode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
