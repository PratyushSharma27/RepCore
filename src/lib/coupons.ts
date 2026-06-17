import { requireSupabase } from "./supabase";

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
  description: string;
};

export const defaultCoupons: Coupon[] = [
  {
    code: "REPCORE15",
    type: "percentage",
    value: 15,
    minOrder: 0,
    active: true,
    description: "15% off all pro-grade training gear",
  },
  {
    code: "FIT100",
    type: "fixed",
    value: 100,
    minOrder: 500,
    active: true,
    description: "₹100 off on orders of ₹500 or more",
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 99,
    minOrder: 300,
    active: true,
    description: "Free shipping on orders over ₹300",
  },
];

export const getCouponsList = (): Coupon[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("repcore_coupons");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCoupons;
      }
    } else {
      localStorage.setItem("repcore_coupons", JSON.stringify(defaultCoupons));
    }
  }
  return defaultCoupons;
};

export const saveCouponsList = (coupons: Coupon[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("repcore_coupons", JSON.stringify(coupons));
  }
};

export const fetchCoupons = async (): Promise<Coupon[]> => {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase.from("coupons").select("*");

    if (error) {
      throw error;
    }

    // Auto-seed if database returns exactly 0 records (table created but empty)
    if (data && data.length === 0) {
      console.log("Supabase coupons table is empty. Seeding defaults...");
      const dbCoupons = defaultCoupons.map((c) => ({
        code: c.code,
        type: c.type,
        value: c.value,
        min_order: c.minOrder,
        active: c.active,
        description: c.description,
      }));
      const { error: seedErr } = await supabase.from("coupons").insert(dbCoupons);
      if (seedErr) {
        console.error("Error seeding default coupons to Supabase:", seedErr);
      } else {
        console.log("Successfully seeded default coupons to Supabase.");
      }
      return defaultCoupons;
    }

    if (data && data.length > 0) {
      const parsed: Coupon[] = data.map((item) => ({
        code: item.code,
        type: item.type as "percentage" | "fixed",
        value: Number(item.value),
        minOrder: Number(item.min_order),
        active: Boolean(item.active),
        description: item.description || "",
      }));
      localStorage.setItem("repcore_coupons", JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load coupons from Supabase (falling back to client cache):", err);
  }
  return getCouponsList();
};

export const saveCoupon = async (c: Coupon): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("coupons").upsert({
      code: c.code,
      type: c.type,
      value: c.value,
      min_order: c.minOrder,
      active: c.active,
      description: c.description,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving coupon to Supabase:", err);
    return false;
  }
};

export const deleteCoupon = async (code: string): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("coupons").delete().eq("code", code);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting coupon from Supabase:", err);
    return false;
  }
};
