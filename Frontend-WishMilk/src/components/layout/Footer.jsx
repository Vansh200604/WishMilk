import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

export default function Footer() {
  return (
    <footer className="hidden border-t border-ink/8 bg-cream-soft md:block">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-butter text-ink-fixed">
                <Milk size={16} />
              </span>
              WishMilk
            </div>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              Fresh milk and dairy from trusted local dairies, delivered before breakfast.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink">Shop</span>
              <Link to="/dairies" className="text-ink-soft hover:text-ink">Browse dairies</Link>
              <Link to="/cart" className="text-ink-soft hover:text-ink">Your cart</Link>
              <Link to="/orders" className="text-ink-soft hover:text-ink">Track orders</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink">Account</span>
              <Link to="/profile" className="text-ink-soft hover:text-ink">Profile</Link>
              <Link to="/wallet" className="text-ink-soft hover:text-ink">Wallet</Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-faint">© {new Date().getFullYear()} WishMilk.</p>
      </div>
    </footer>
  );
}