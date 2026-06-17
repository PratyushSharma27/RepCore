import { requireSupabase } from "./supabase";

export type PaymentStatus = "Pending Verification" | "Verified" | "Rejected";
export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type LegacyOrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  slug: string;
  productId?: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type ShippingAddress = {
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  phone: string;
};

export type Order = {
  id: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: LegacyOrderStatus;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  screenshotUrl?: string;
  utrNumber?: string;
  notes?: string;
  trackingNumber?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
};

export type CreateOrderInput = {
  id: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  screenshotUrl?: string;
  utrNumber?: string;
  notes?: string;
};

const PAYMENT_SCREENSHOTS_BUCKET = "payment-screenshots";

export const defaultOrders: Order[] = [
  {
    id: "RC-109384",
    customerEmail: "pratyush@tenimal.com",
    customerName: "Pratyush Sharma",
    items: [
      {
        slug: "premium-shaker-bottle",
        name: "Steel Shaker",
        price: 599,
        qty: 2,
        image: "/src/assets/p-shaker.jpg",
      },
      {
        slug: "wrist-support",
        name: "Wrist Support",
        price: 399,
        qty: 1,
        image: "/src/assets/p-wrist.jpg",
      },
    ],
    total: 1597,
    status: "delivered",
    orderStatus: "Delivered",
    paymentStatus: "Verified",
    trackingNumber: "RCDEL109384",
    shippingAddress: {
      address: "Flat 405, Sector 15",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201301",
      phone: "+91 98765 43210",
    },
    createdAt: "2026-06-15T11:30:00.000Z",
  },
  {
    id: "RC-482019",
    customerEmail: "pratyush@tenimal.com",
    customerName: "Pratyush Sharma",
    items: [
      {
        slug: "mini-massage-gun",
        name: "Mini Massage Gun",
        price: 1199,
        qty: 1,
        image: "/src/assets/p-gun.jpg",
      },
    ],
    total: 1199,
    status: "shipped",
    orderStatus: "Shipped",
    paymentStatus: "Verified",
    trackingNumber: "RCSHP482019",
    shippingAddress: {
      address: "Flat 405, Sector 15",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201301",
      phone: "+91 98765 43210",
    },
    createdAt: "2026-06-16T14:20:00.000Z",
  },
  {
    id: "RC-720194",
    customerEmail: "arnav@tenimal.com",
    customerName: "Arnav Kapoor",
    items: [
      {
        slug: "lifting-straps",
        name: "Lifting Straps",
        price: 399,
        qty: 2,
        image: "/src/assets/p-straps.jpg",
      },
      {
        slug: "hand-grip-strengthener",
        name: "Hand Gripper",
        price: 349,
        qty: 1,
        image: "/src/assets/p-grip.jpg",
      },
    ],
    total: 1147,
    status: "pending",
    orderStatus: "Pending",
    paymentStatus: "Pending Verification",
    shippingAddress: {
      address: "Flat 12, Park Street",
      city: "Kolkata",
      state: "West Bengal",
      postalCode: "700016",
      phone: "+91 98300 12345",
    },
    createdAt: "2026-06-17T09:30:00.000Z",
  },
  {
    id: "RC-392018",
    customerEmail: "neha@gmail.com",
    customerName: "Neha Roy",
    items: [
      {
        slug: "foam-roller",
        name: "Foam Roller",
        price: 799,
        qty: 1,
        image: "/src/assets/p-foam.jpg",
      },
    ],
    total: 799,
    status: "delivered",
    orderStatus: "Delivered",
    paymentStatus: "Verified",
    trackingNumber: "RCDEL392018",
    shippingAddress: {
      address: "Sector 4, Rohini",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110085",
      phone: "+91 99100 54321",
    },
    createdAt: "2026-06-17T15:45:00.000Z",
  },
  {
    id: "RC-902183",
    customerEmail: "kabir@yahoo.com",
    customerName: "Kabir Singh",
    items: [
      {
        slug: "mini-resistance-band",
        name: "Resistance Bands",
        price: 399,
        qty: 3,
        image: "/src/assets/p-bands.jpg",
      },
    ],
    total: 1197,
    status: "cancelled",
    orderStatus: "Cancelled",
    paymentStatus: "Rejected",
    shippingAddress: {
      address: "Phase 7, Mohali",
      city: "Chandigarh",
      state: "Chandigarh",
      postalCode: "160062",
      phone: "+91 98150 98765",
    },
    createdAt: "2026-06-18T08:15:00.000Z",
  },
];

export const ORDERS_STORAGE_KEY = "repcore_orders_v3";

export const mapOrderStatusToLegacy = (status: OrderStatus): LegacyOrderStatus => {
  switch (status) {
    case "Shipped":
      return "shipped";
    case "Delivered":
      return "delivered";
    case "Cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

export const normalizeOrderStatus = (status?: string): OrderStatus => {
  switch ((status || "").toLowerCase()) {
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    default:
      return "Pending";
  }
};

export const normalizePaymentStatus = (status?: string): PaymentStatus => {
  switch ((status || "").toLowerCase()) {
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return "Pending Verification";
  }
};

const normalizeOrder = (raw: Partial<Order>): Order => {
  const orderStatus = normalizeOrderStatus(raw.orderStatus || raw.status);
  return {
    id: raw.id || `RC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customerEmail: raw.customerEmail || "",
    customerName: raw.customerName || "",
    items: Array.isArray(raw.items) ? raw.items : [],
    total: Number(raw.total || 0),
    status: mapOrderStatusToLegacy(orderStatus),
    orderStatus,
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    screenshotUrl: raw.screenshotUrl,
    utrNumber: raw.utrNumber,
    notes: raw.notes,
    trackingNumber: raw.trackingNumber,
    shippingAddress: {
      address: raw.shippingAddress?.address || "",
      city: raw.shippingAddress?.city || "",
      state: raw.shippingAddress?.state || "",
      postalCode: raw.shippingAddress?.postalCode || "",
      phone: raw.shippingAddress?.phone || "",
    },
    createdAt: raw.createdAt || new Date().toISOString(),
  };
};

export const getOrdersList = (): Order[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored).map(normalizeOrder);
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
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const parsed: Order[] = data.map((item) => ({
        id: item.id,
        customerEmail: item.customer_email,
        customerName: item.customer_name || "",
        items: Array.isArray(item.order_items) && item.order_items.length > 0
          ? item.order_items.map((orderItem: Record<string, unknown>) => ({
              slug: String(orderItem.product_id || ""),
              productId: String(orderItem.product_id || ""),
              name: String(orderItem.product_name || ""),
              price: Number(orderItem.price || 0),
              qty: Number(orderItem.quantity || 1),
            }))
          : Array.isArray(item.items) ? item.items : [],
        total: Number(item.total_amount ?? item.total ?? 0),
        status: mapOrderStatusToLegacy(normalizeOrderStatus(item.order_status || item.status)),
        orderStatus: normalizeOrderStatus(item.order_status || item.status),
        paymentStatus: normalizePaymentStatus(item.payment_status),
        screenshotUrl: item.screenshot_url || undefined,
        utrNumber: item.utr_number || undefined,
        notes: item.notes || undefined,
        trackingNumber: item.tracking_number || undefined,
        shippingAddress: {
          address: item.address || item.shipping_address?.address || "",
          city: item.city || item.shipping_address?.city || "",
          state: item.state || item.shipping_address?.state || "",
          postalCode: item.pincode || item.shipping_address?.postalCode || "",
          phone: item.phone || item.shipping_address?.phone || "",
        },
        createdAt: item.created_at || new Date().toISOString(),
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
    const supabase = requireSupabase();
    const { error } = await supabase.from("orders").upsert({
      id: o.id,
      customer_email: o.customerEmail,
      customer_name: o.customerName,
      phone: o.shippingAddress.phone,
      email: o.customerEmail,
      address: o.shippingAddress.address,
      city: o.shippingAddress.city,
      state: o.shippingAddress.state || "",
      pincode: o.shippingAddress.postalCode,
      total_amount: o.total,
      payment_status: o.paymentStatus,
      order_status: o.orderStatus,
      screenshot_url: o.screenshotUrl || null,
      utr_number: o.utrNumber || null,
      notes: o.notes || null,
      tracking_number: o.trackingNumber || null,
      status: o.status,
      shipping_address: o.shippingAddress,
      created_at: o.createdAt,
    });
    if (error) throw error;
    await supabase.from("order_items").delete().eq("order_id", o.id);
    const orderItems = o.items.map((item) => ({
      order_id: o.id,
      product_id: item.productId || item.slug,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
    }));
    if (orderItems.length > 0) {
      const { error: itemError } = await supabase.from("order_items").insert(orderItems);
      if (itemError) throw itemError;
    }
    return true;
  } catch (err) {
    console.error("Error saving order to Supabase:", err);
    return false;
  }
};

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const order = normalizeOrder({
    id: input.id,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    items: input.items,
    total: input.total,
    status: "pending",
    orderStatus: "Pending",
    paymentStatus: "Pending Verification",
    screenshotUrl: input.screenshotUrl,
    utrNumber: input.utrNumber,
    notes: input.notes,
    shippingAddress: {
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.pincode,
      phone: input.phone,
    },
    createdAt: new Date().toISOString(),
  });

  if (typeof window !== "undefined") {
    const localOrders = getOrdersList();
    const next = [order, ...localOrders.filter((o) => o.id !== order.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
  }

  await saveOrder(order);
  return order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status, status: mapOrderStatusToLegacy(status) })
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating order status in Supabase:", err);
    return false;
  }
};

export const updatePaymentStatus = async (id: string, paymentStatus: PaymentStatus): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const nextOrderStatus: OrderStatus | undefined =
      paymentStatus === "Verified" ? "Confirmed" : paymentStatus === "Rejected" ? "Cancelled" : undefined;
    const patch: Record<string, string> = { payment_status: paymentStatus };
    if (nextOrderStatus) {
      patch.order_status = nextOrderStatus;
      patch.status = mapOrderStatusToLegacy(nextOrderStatus);
    }
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating payment status in Supabase:", err);
    return false;
  }
};

export const updateTrackingNumber = async (id: string, trackingNumber: string): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("orders").update({ tracking_number: trackingNumber }).eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating tracking number in Supabase:", err);
    return false;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting order from Supabase:", err);
    return false;
  }
};

const compressImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not prepare payment screenshot."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) reject(new Error("Could not compress payment screenshot."));
          else resolve(blob);
        },
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file."));
    };
    img.src = url;
  });

export const uploadPaymentScreenshot = async (orderId: string, file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Upload a JPG, PNG, or WEBP payment screenshot.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Payment screenshot must be under 8 MB.");
  }

  const supabase = requireSupabase();
  const compressed = await compressImage(file);
  const path = `${orderId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}.jpg`;
  const { error } = await supabase.storage
    .from(PAYMENT_SCREENSHOTS_BUCKET)
    .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(PAYMENT_SCREENSHOTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const exportOrdersCsv = (orders: Order[]) => {
  const rows = [
    [
      "Order ID",
      "Customer",
      "Phone",
      "Email",
      "City",
      "State",
      "Pincode",
      "Total",
      "Payment Status",
      "Order Status",
      "Tracking Number",
      "UTR",
      "Created At",
    ],
    ...orders.map((o) => [
      o.id,
      o.customerName,
      o.shippingAddress.phone,
      o.customerEmail,
      o.shippingAddress.city,
      o.shippingAddress.state || "",
      o.shippingAddress.postalCode,
      String(o.total),
      o.paymentStatus,
      o.orderStatus,
      o.trackingNumber || "",
      o.utrNumber || "",
      o.createdAt,
    ]),
  ];
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
};
