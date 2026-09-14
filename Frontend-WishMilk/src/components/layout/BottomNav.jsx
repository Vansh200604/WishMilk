import { NavLink } from "react-router-dom";
import { Home, Store, ShoppingBasket, Package, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { cx } from "../../lib/utils.js";

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { count } = useCart();

  const items = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/dairies", label: "Dairies", icon: Store },
    { to: "/cart", label: "Cart", icon: ShoppingBasket, badge: count },
    { to: "/orders", label: "Orders", icon: Package },
    { to: isAuthenticated ? "/profile" : "/login", label: "Account", icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-cream-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                isActive ? "text-butter-dark" : "text-ink-faint"
              )
            }
          >
            <span className="relative">
              <Icon size={20} strokeWidth={2} />
              {!!badge && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}