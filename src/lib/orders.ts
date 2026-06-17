import { supabase } from "./supabase";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type ShippingAddress = {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
};

export type Order = {
  id: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  createdAt: string;
};

export const defaultOrders: Order[] = [
  {
    id: "RC-109384",
    customerEmail: "pratyush@tenimal.com",
    customerName: "Pratyush Sharma",
    items: [
      { slug: "premium-shaker-bottle", name: "Steel Shaker", price: 599, qty: 2, image: "/src/assets/p-shaker.jpg" },
      { slug: "wrist-support", name: "Wrist Support", price: 399, qty: 1, image: "/src/assets/p-wrist.jpg" }
    ],
    total: 1597,
    status: "delivered",
    shippingAddress: { address: "Flat 405, Sector 15", city: "Noida", postalCode: "201301", phone: "+91 98765 43210" },
    createdAt: "2026-06-15T11:30:00.000Z"
  },
  {
    id: "RC-482019",
    customerEmail: "pratyush@tenimal.com",
    customerName: "Pratyush Sharma",
    items: [
      { slug: "mini-massage-gun", name: "Mini Massage Gun", price: 1199, qty: 1, image: "/src/assets/p-gun.jpg" }
    ],
    total: 1199,
    status: "shipped",
    shippingAddress: { address: "Flat 405, Sector 15", city: "Noida", postalCode: "201301", phone: "+91 98765 43210" },
    createdAt: "2026-06-16T14:20:00.000Z"
  },
  {
    id: "RC-720194",
    customerEmail: "arnav@tenimal.com",
    customerName: "Arnav Kapoor",
    items: [
      { slug: "lifting-straps", name: "Lifting Straps", price: 399, qty: 2, image: "/src/assets/p-straps.jpg" },
      { slug: "hand-grip-strengthener", name: "Hand Gripper", price: 349, qty: 1, image: "/src/assets/p-grip.jpg" }
    ],
    total: 1147,
    status: "pending",
    shippingAddress: { address: "Flat 12, Park Street", city: "Kolkata", postalCode: "700016", phone: "+91 98300 12345" },
    createdAt: "2026-06-17T09:30:00.000Z"
  },
  {
    id: "RC-392018",
    customerEmail: "neha@gmail.com",
    customerName: "Neha Roy",
    items: [
      { slug: "foam-roller", name: "Foam Roller", price: 799, qty: 1, image: "/src/assets/p-foam.jpg" }
    ],
    total: 799,
    status: "delivered",
    shippingAddress: { address: "Sector 4, Rohini", city: "Delhi", postalCode: "110085", phone: "+91 99100 54321" },
    createdAt: "2026-06-17T15:45:00.000Z"
  },
  {
    id: "RC-902183",
    customerEmail: "kabir@yahoo.com",
    customerName: "Kabir Singh",
    items: [
      { slug: "mini-resistance-band", name: "Resistance Bands", price: 399, qty: 3, image: "/src/assets/p-bands.jpg" }
    ],
    total: 1197,
    status: "cancelled",
    shippingAddress: { address: "Phase 7, Mohali", city: "Chandigarh", postalCode: "160062", phone: "+91 98150 98765" },
    createdAt: "2026-06-18T08:15:00.000Z"
  }
];

export const ORDERS_STORAGE_KEY = "repcore_orders_v3";

export const getOrdersList = (): Order[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultOrders;
      }
    } else {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(defaultOrders));
    }
  }
  return defaultOrders;
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (data && data.length === 0) {
      console.log("Supabase orders table is empty. Seeding defaults...");
      const dbOrders = defaultOrders.map(o => ({
        id: o.id,
        customer_email: o.customerEmail,
        customer_name: o.customerName,
        items: o.items,
        total: o.total,
        status: o.status,
        shipping_address: o.shippingAddress,
        created_at: o.createdAt
      }));
      const { error: seedErr } = await supabase
        .from("orders")
        .insert(dbOrders);
      if (seedErr) {
        console.error("Error seeding default orders to Supabase:", seedErr);
      }
      return defaultOrders;
    }
    
    if (data && data.length > 0) {
      const parsed: Order[] = data.map((item: any) => ({
        id: item.id,
        customerEmail: item.customer_email,
        customerName: item.customer_name || "",
        items: Array.isArray(item.items) ? item.items : [],
        total: Number(item.total),
        status: item.status || "pending",
        shippingAddress: item.shipping_address || {},
        createdAt: item.created_at || new Date().toISOString()
      }));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load orders from Supabase (falling back to client cache):", err);
  }
  return getOrdersList();
};

export const saveOrder = async (o: Order): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .upsert({
        id: o.id,
        customer_email: o.customerEmail,
        customer_name: o.customerName,
        items: o.items,
        total: o.total,
        status: o.status,
        shipping_address: o.shippingAddress,
        created_at: o.createdAt
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving order to Supabase:", err);
    return false;
  }
};

export const updateOrderStatus = async (id: string, status: Order["status"]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating order status in Supabase:", err);
    return false;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting order from Supabase:", err);
    return false;
  }
};
