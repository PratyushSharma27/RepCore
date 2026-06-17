import { requireSupabase } from "./supabase";

export type Category = {
  id: string;
  name: string;
};

export const defaultCategories: Category[] = [
  { id: "strength", name: "Strength" },
  { id: "recovery", name: "Recovery" },
  { id: "support", name: "Support" },
  { id: "hydration", name: "Hydration" },
  { id: "resistance", name: "Resistance" },
  { id: "grip", name: "Grip" },
];

export const CATEGORIES_STORAGE_KEY = "repcore_categories";

export const getCategoriesList = (): Category[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCategories;
      }
    } else {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCategories));
    }
  }
  return defaultCategories;
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase.from("categories").select("*").order("name");

    if (error) {
      throw error;
    }

    if (data && data.length === 0) {
      console.log("Supabase categories table is empty. Seeding defaults...");
      const { error: seedErr } = await supabase.from("categories").insert(defaultCategories);
      if (seedErr) {
        console.error("Error seeding default categories to Supabase:", seedErr);
      }
      return defaultCategories;
    }

    if (data && data.length > 0) {
      const parsed: Category[] = data.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load categories from Supabase (falling back to client cache):", err);
  }
  return getCategoriesList();
};

export const saveCategory = async (cat: Category): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("categories").upsert({
      id: cat.id,
      name: cat.name,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving category to Supabase:", err);
    return false;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting category from Supabase:", err);
    return false;
  }
};
