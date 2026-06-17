import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { useLocation } from "@tanstack/react-router";

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main key={location.pathname} className="flex-1 page-transition">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}