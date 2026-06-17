import { Link } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-animations";

export function SiteFooter() {
  const footerReveal = useReveal(0.1);

  return (
    <footer ref={footerReveal.ref} className="border-t border-border/60 bg-background section-glow-divider">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className={`grid gap-12 md:grid-cols-4 anim-reveal-up ${footerReveal.visible ? "visible" : ""}`}>
          <div className="md:col-span-2">
            <div className="display text-4xl tracking-tight">
              BUILT FOR <span className="text-primary text-glow">WORK.</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              RepCore engineers training tools for people who treat the gym like a job site.
              No fluff, no filler — just gear that survives the set.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary hover-underline-anim transition-colors duration-300">All Gear</Link></li>
              <li><Link to="/cart" className="hover:text-primary hover-underline-anim transition-colors duration-300">Cart</Link></li>
              <li><Link to="/track" className="hover:text-primary hover-underline-anim transition-colors duration-300">Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-primary hover-underline-anim transition-colors duration-300">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary hover-underline-anim transition-colors duration-300">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary hover-underline-anim transition-colors duration-300">Our Story</Link></li>
              <li><Link to="/admin" className="hover:text-primary hover-underline-anim transition-colors duration-300">Admin</Link></li>
              <li><a href="#" className="hover:text-primary hover-underline-anim transition-colors duration-300">Wholesale</a></li>
            </ul>
          </div>
        </div>
        <div className={`mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground anim-reveal-up anim-delay-2 ${footerReveal.visible ? "visible" : ""}`}>
          <span>© {new Date().getFullYear()} RepCore Co. All rights reserved.</span>
          <span>Made for athletes. Built like equipment.</span>
        </div>
      </div>
    </footer>
  );
}