

import bands from "@/assets/p-bands.jpg";
import straps from "@/assets/p-straps.jpg";
import wrist from "@/assets/p-wrist.jpg";
import grip from "@/assets/p-grip.jpg";
import shaker from "@/assets/p-shaker.jpg";
import foam from "@/assets/p-foam.jpg";
import gun from "@/assets/p-gun.jpg";
import { supabase } from "./supabase";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  category: string;
  image: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "mini-resistance-band",
    name: "Resistance Bands",
    tagline: "Activate every fiber.",
    price: 399,
    category: "Resistance",
    image: bands,
    description:
      "A pro-grade looped resistance band engineered for hip activation, glute training, and rehab. Snap-resistant latex layered for consistent tension from rep one to rep one hundred.",
    features: [
      "Heavy-duty layered latex construction",
      "Five tension levels color-coded",
      "Anti-roll edge for clean activation",
      "Carry pouch included",
    ],
    specs: [
      { label: "Material", value: "Natural latex" },
      { label: "Resistance", value: "5 – 50 lbs" },
      { label: "Length", value: "12 in loop" },
    ],
  },
  {
    slug: "lifting-straps",
    name: "Lifting Straps",
    tagline: "Pull more. Drop nothing.",
    price: 399,
    category: "Strength",
    image: straps,
    description:
      "Heavy-cotton lifting straps built for deadlifts, rows and shrugs. Padded neoprene wrist cuff to absorb load on max-effort sets.",
    features: [
      "Heavy 100% cotton weave",
      "Neoprene wrist padding",
      "Reinforced stitching at stress points",
      "23-inch length for double wraps",
    ],
    specs: [
      { label: "Material", value: "Cotton + Neoprene" },
      { label: "Length", value: "23 in" },
      { label: "Rated", value: "Up to 700 lbs" },
    ],
  },
  {
    slug: "wrist-support",
    name: "Wrist Support",
    tagline: "Lock in. Press heavier.",
    price: 399,
    category: "Support",
    image: wrist,
    description:
      "Pro-grade wrist wraps with stiff support panel and thumb loop. Stabilizes the joint under heavy pressing and overhead work.",
    features: [
      "18-inch elastic wrap",
      "Reinforced thumb loop",
      "Heavy velcro closure",
      "Breathable mesh lining",
    ],
    specs: [
      { label: "Length", value: "18 in" },
      { label: "Use", value: "Pressing / Overhead" },
      { label: "Pack", value: "Pair" },
    ],
  },
  {
    slug: "hand-grip-strengthener",
    name: "Hand Gripper",
    tagline: "Crush every lift.",
    price: 349,
    category: "Grip",
    image: grip,
    description:
      "Adjustable from 22 to 132 lbs of resistance. Engineered for forearm hypertrophy, grip endurance and recovery work.",
    features: [
      "Adjustable 22 – 132 lbs",
      "Aluminum chassis",
      "Anti-slip silicone handle",
      "Compact carry size",
    ],
    specs: [
      { label: "Resistance", value: "22 – 132 lbs" },
      { label: "Body", value: "Aluminum" },
      { label: "Weight", value: "180 g" },
    ],
  },
  {
    slug: "premium-shaker-bottle",
    name: "Steel Shaker",
    tagline: "Mix clean. Drink clean.",
    price: 599,
    category: "Hydration",
    image: shaker,
    description:
      "Leakproof 24oz shaker with stainless mixer and threaded supplement compartment. BPA-free and built for the gym bag.",
    features: [
      "24 oz / 700 ml capacity",
      "Stainless steel mixer",
      "Leakproof flip cap",
      "Storage compartment",
    ],
    specs: [
      { label: "Volume", value: "700 ml" },
      { label: "Material", value: "BPA-free Tritan" },
      { label: "Dishwasher", value: "Top rack safe" },
    ],
  },
  {
    slug: "foam-roller",
    name: "Foam Roller",
    tagline: "Roll out. Recover faster.",
    price: 799,
    category: "Recovery",
    image: foam,
    description:
      "High-density textured foam roller with multi-zone trigger pattern for deep tissue release on quads, IT band, and back.",
    features: [
      "High-density EVA foam",
      "Multi-zone trigger pattern",
      "Hollow core PVC frame",
      "13 in travel length",
    ],
    specs: [
      { label: "Length", value: "13 in" },
      { label: "Diameter", value: "5.5 in" },
      { label: "Density", value: "High" },
    ],
  },
  {
    slug: "mini-massage-gun",
    name: "Mini Massage Gun",
    tagline: "Pocket-sized percussion.",
    price: 1199,
    category: "Recovery",
    image: gun,
    description:
      "Four-speed percussion device with brushless motor. Fits in a backpack, hits harder than tools twice its size.",
    features: [
      "4 percussion speeds",
      "Brushless quiet motor",
      "6-hour battery life",
      "USB-C fast charge",
    ],
    specs: [
      { label: "Speeds", value: "1800 – 3200 rpm" },
      { label: "Battery", value: "2000 mAh" },
      { label: "Weight", value: "480 g" },
    ],
  },

];

export const PRODUCTS_STORAGE_KEY = "repcore_products_v2";

export const getProductsList = (): Product[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return products;
      }
    } else {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }
  return products;
};

export const getProduct = (slug: string) => {
  return getProductsList().find((p) => p.slug === slug);
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*");
      
    if (error) {
      // If table doesn't exist, we fall back to localStorage/static list
      throw error;
    }
    
    // Auto-seed if database returns exactly 0 records (table created but empty)
    if (data && data.length === 0) {
      console.log("Supabase products table is empty. Seeding defaults...");
      const { error: seedErr } = await supabase
        .from("products")
        .insert(products);
      if (seedErr) {
        console.error("Error seeding default products to Supabase:", seedErr);
      } else {
        console.log("Successfully seeded default products to Supabase.");
      }
      return products;
    }
    
    if (data && data.length > 0) {
      const parsed: Product[] = data.map((item: any) => ({
        slug: item.slug,
        name: item.name,
        tagline: item.tagline || "",
        price: Number(item.price),
        category: item.category || "",
        image: item.image || "",
        description: item.description || "",
        features: Array.isArray(item.features) ? item.features : [],
        specs: Array.isArray(item.specs) ? item.specs : [],
      }));
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load products from Supabase (falling back to client cache):", err);
  }
  return getProductsList();
};

export const saveProduct = async (p: Product): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("products")
      .upsert({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        price: p.price,
        category: p.category,
        image: p.image,
        description: p.description,
        features: p.features,
        specs: p.specs
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving product to Supabase:", err);
    return false;
  }
};

export const deleteProduct = async (slug: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("slug", slug);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting product from Supabase:", err);
    return false;
  }
};
