import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProductsList, type Product } from "./products";
import { getCouponsList, type Coupon } from "./coupons";

export type CartItem = { slug: string; qty: number };

type Ctx = {
  items: CartItem[];
  lines: (CartItem & { product: Product; lineTotal: number })[];
  count: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "repcore_cart_v1";
const COUPON_KEY = "repcore_applied_coupon_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}

    try {
      const rawCoupon = localStorage.getItem(COUPON_KEY);
      if (rawCoupon) setAppliedCoupon(JSON.parse(rawCoupon));
    } catch {}
  }, []);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Sync applied coupon to localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    } catch {}
  }, [appliedCoupon]);

  const value = useMemo<Ctx>(() => {
    // Resolve products dynamically to support Admin updates
    const currentProductsList = getProductsList();
    
    const lines = items
      .map((i) => {
        const product = currentProductsList.find((p) => p.slug === i.slug);
        if (!product) return null;
        return { ...i, product, lineTotal: product.price * i.qty };
      })
      .filter(Boolean) as Ctx["lines"];

    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    
    // Correct INR shipping logic: Free over ₹500, else ₹99
    const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 99;

    // Validate coupon minimum order value and active status
    let activeCoupon = appliedCoupon;
    if (activeCoupon) {
      // Refresh coupon data from localStorage in case it was modified in Admin
      const freshCoupons = getCouponsList();
      const fresh = freshCoupons.find(c => c.code === activeCoupon?.code);
      if (!fresh || !fresh.active || subtotal < fresh.minOrder) {
        activeCoupon = null;
      } else {
        activeCoupon = fresh;
      }
    }

    // Calculate discount
    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.type === "percentage") {
        discount = Math.round(subtotal * (activeCoupon.value / 100));
      } else {
        discount = Math.min(subtotal, activeCoupon.value);
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    const applyCoupon = (code: string) => {
      const freshCoupons = getCouponsList();
      const coupon = freshCoupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
      
      if (!coupon) {
        return { success: false, message: "Invalid coupon code." };
      }
      if (!coupon.active) {
        return { success: false, message: "This coupon is no longer active." };
      }
      if (subtotal < coupon.minOrder) {
        return { 
          success: false, 
          message: `Minimum order of ₹${coupon.minOrder.toLocaleString("en-IN")} required for this coupon.` 
        };
      }
      
      setAppliedCoupon(coupon);
      return { success: true, message: `Coupon "${coupon.code}" applied successfully!` };
    };

    const removeCoupon = () => {
      setAppliedCoupon(null);
    };

    return {
      items,
      lines,
      count,
      subtotal,
      shipping,
      discount,
      total,
      appliedCoupon: activeCoupon,
      add: (slug, qty = 1) => setItems((prev) => {
        const i = prev.findIndex((x) => x.slug === slug);
        if (i === -1) return [...prev, { slug, qty }];
        const next = [...prev]; next[i] = { ...next[i], qty: next[i].qty + qty }; return next;
      }),
      setQty: (slug, qty) => setItems((prev) => qty <= 0
        ? prev.filter((x) => x.slug !== slug)
        : prev.map((x) => x.slug === slug ? { ...x, qty } : x)),
      remove: (slug) => setItems((prev) => prev.filter((x) => x.slug !== slug)),
      clear: () => {
        setItems([]);
        setAppliedCoupon(null);
      },
      applyCoupon,
      removeCoupon,
    };
  }, [items, appliedCoupon]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
