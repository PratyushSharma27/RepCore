import { supabase } from "./supabase";

export type Customer = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export const defaultCustomers: Customer[] = [
  { id: "CUST-PRATYUSH", email: "pratyush@tenimal.com", name: "Pratyush Sharma", createdAt: "2026-06-15T10:00:00.000Z" },
  { id: "CUST-ARNAV", email: "arnav@tenimal.com", name: "Arnav Kapoor", createdAt: "2026-06-16T12:00:00.000Z" },
  { id: "CUST-NEHA", email: "neha@gmail.com", name: "Neha Roy", createdAt: "2026-06-17T09:30:00.000Z" },
  { id: "CUST-KABIR", email: "kabir@yahoo.com", name: "Kabir Singh", createdAt: "2026-06-17T15:45:00.000Z" },
  { id: "CUST-RIYA", email: "riya@outlook.com", name: "Riya Sen", createdAt: "2026-06-18T08:15:00.000Z" }
];

export const CUSTOMERS_STORAGE_KEY = "repcore_customers_v3";

export const getCustomersList = (): Customer[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCustomers;
      }
    } else {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(defaultCustomers));
    }
  }
  return defaultCustomers;
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (data && data.length === 0) {
      console.log("Supabase customers table is empty. Seeding defaults...");
      const dbCusts = defaultCustomers.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        created_at: c.createdAt
      }));
      const { error: seedErr } = await supabase
        .from("customers")
        .insert(dbCusts);
      if (seedErr) {
        console.error("Error seeding default customers to Supabase:", seedErr);
      }
      return defaultCustomers;
    }
    
    if (data && data.length > 0) {
      const parsed: Customer[] = data.map((item: any) => ({
        id: item.id,
        email: item.email,
        name: item.name || "",
        createdAt: item.created_at || new Date().toISOString()
      }));
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load customers from Supabase (falling back to client cache):", err);
  }
  return getCustomersList();
};

export const saveCustomer = async (c: Customer): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("customers")
      .upsert({
        id: c.id,
        email: c.email,
        name: c.name,
        created_at: c.createdAt
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving customer to Supabase:", err);
    return false;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting customer from Supabase:", err);
    return false;
  }
};

