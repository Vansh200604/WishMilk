import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Milk, ShoppingBasket, User, LogOut, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import Button from "../ui/Button.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { cx } from "../../lib/utils.js";
import Logout from "../../pages/Logout.jsx";

const links = [
  { to: "/dairies", label: "Browse dairies" },
  { to: "/orders", label: "My orders", private: true },
  { to: "/wallet", label: "Wallet", private: true },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const logoutRef = useRef(null);
  const handleLogoutClick = () => {
    setShowLogoutConfirmation((prev) => !prev);
  };

  

  useEffect(() => {
    const handleScroll = () => {
      setShowLogoutConfirmation(false);
    };
    
    const handleClickOutside = (event) => {
      if(logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogoutConfirmation(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 hidden border-ink/8 bg-cream/90 backdrop-blur md:block transition-all duration-300 ease-in-out">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          {/* <span className="flex h-8 w-8 items-center justify-center rounded-full bg-butter text-ink-fixed">
            <Milk size={18} strokeWidth={2} />
          </span> */}
          <img src="/src/assets/wishmilk_64x64_icon.png" alt="WishMilk Logo" className="h-10 w-10" />
          WishMilk
        </Link>

        <nav className="flex items-center gap-1">
          {links
            .filter((l) => !l.private || isAuthenticated)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-ink/8 text-ink" : "text-ink-soft hover:bg-ink/5"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBasket size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              {user?.role === "dairyOwner" && (
                <a
                  href={
                    import.meta.env.VITE_OWNER_PORTAL_URL ||
                    "http://localhost:5174"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-dawn-light/50 px-3 py-2 text-sm font-medium text-dawn-dark hover:bg-dawn-light/70"
                >
                  <Store size={16} />
                  Owner portal
                </a>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5"
              >
                <User size={17} />
                {user?.username?.firstName || "Account"}
              </Link>
              
                <div className="relative" ref={logoutRef}>
                  <button
                    onClick={handleLogoutClick}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-all duration-200 hover:bg-red-100 hover:text-red-600 active:scale-95"
                    aria-label="Log out"
                    title="Log out" 
                  >
                    <LogOut size={18} />
                  </button>

                  <Logout
                    isOpen={showLogoutConfirmation}
                    onClose={() => setShowLogoutConfirmation(false)}
                    onConfirm={() => {
                      setShowLogoutConfirmation(false);
                      logout();
                      navigate("/");
                    }}
                  />
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" size="sm">
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>

      
      
    </>
  );
}