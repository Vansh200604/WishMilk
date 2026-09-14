import { NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck, LayoutDashboard, Users, Store, ClipboardList, Repeat, Tag, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ui/ThemeToggle.jsx";
import { cx } from "../lib/utils.js";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/dairies", label: "Dairies", icon: Store },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/coupons", label: "Coupons", icon: Tag },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 border-b border-ink/8 bg-cream-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-butter text-ink-fixed">
              <ShieldCheck size={16} />
            </span>
            WishMilk
            <span className="ml-1 rounded-full bg-clay-light px-2.5 py-0.5 text-xs font-semibold text-clay">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-ink/5"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-3 no-scrollbar">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  "flex flex-none items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                  isActive ? "bg-ink/8 text-ink" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 animate-fade-in-up">{children}</main>
    </div>
  );
}