import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig, requireSupabase, supabase } from "./supabase";
import { saveCustomer } from "./customers";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive admin status - check email matches authorized admin configuration
  const isAdmin = user
    ? user.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "pratyush@tenimal.com").toLowerCase()
    : false;

  const loadProfile = useCallback(async (userId: string, email: string, defaultName?: string) => {
    const name = defaultName || email.split("@")[0];
    setProfile({
      id: userId,
      email,
      name,
      createdAt: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    const client = supabase;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();
        if (error) throw error;

        if (session?.user && active) {
          setUser(session.user);
          await loadProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
        }
      } catch (err) {
        console.warn("Supabase Auth session initialization failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = requireSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        setUser(data.user);
        await loadProfile(data.user.id, data.user.email!, data.user.user_metadata?.name);
        return { success: true };
      }
      return { success: false, error: "Failed to retrieve user session." };
    } catch (err: unknown) {
      return {
        success: false,
        error: getErrorMessage(err, "An unexpected sign-in error occurred."),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: "Name, email and password are required." };
    }

    try {
      const supabase = requireSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName } },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create matching public customer profile
        await saveCustomer({
          id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          createdAt: new Date().toISOString(),
        });

        setUser(data.user);
        await loadProfile(data.user.id, cleanEmail, cleanName);
        return { success: true };
      }
      return { success: false, error: "Failed to register user." };
    } catch (err: unknown) {
      return {
        success: false,
        error: getErrorMessage(err, "An unexpected registration error occurred."),
      };
    }
  };

  const logout = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (err) {
      console.warn("Supabase remote signout failed:", err);
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
