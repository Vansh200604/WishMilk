import { NavLink, useNavigate, Link } from "react-router-dom";
import { Milk, LayoutDashboard, Store, PackageSearch, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ui/ThemeToggle.jsx";
import { cx } from "../lib/utils.js";
import wishmilkIcon from "../assets/wishmilk_64x64_icon.png";
import { useEffect, useState, useRef } from "react";
import Logout from "./ui/Logout.jsx";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dairy", label: "My dairy", icon: Store },
  { to: "/milk", label: "Milk products", icon: PackageSearch },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Layout({ children }) {
  const {user, logout } = useAuth();
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

    const handleClickOutside = (e) => {
      if (logoutRef.current && !logoutRef.current.contains(e.target)) {
        setShowLogoutConfirmation(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/8 bg-cream-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-butter text-ink-fixed">
              <Milk size={16} />
              <img src={wishmilkIcon} alt="WishMilk Icon" />
            </span>
            WishMilk
            <span className="ml-1 rounded-full bg-dawn-light/50 px-2.5 py-0.5 text-xs font-semibold text-dawn-dark">
              Owner portal
            </span>
          </div>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            {/* <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button> */}

            {/* <div className="flex items-center gap-1"> */}
              {user?.role === "dairyOwner" && (
                <Link
                  to="/dairy"
                  className="flex items-center gap-1.5 rounded-xl bg-dawn-light/50 px-3 py-2 text-sm font-medium text-dawn-dark hover:bg-dawn-light/70"
                >
                  <Store size={16} />
                  Owner portal
                </Link>
              )}
            {/* </div> */}
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
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 pb-3 no-scrollbar">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  "flex flex-none items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-ink/8 text-ink" : "text-ink-soft hover:bg-ink/5"
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}







// import { useNavigate, Link } from "react-router-dom";
// import { Truck, Bell, LogOut } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";
// import ThemeToggle from "./ui/ThemeToggle.jsx";

// export default function Layout({ children }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-cream">
//       <header className="border-b border-ink/8 bg-cream-card">
//         <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
//           <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
//             <span className="flex h-8 w-8 items-center justify-center rounded-full bg-butter text-ink-fixed">
//               <Truck size={16} />
//             </span>
//             WishMilk
//             <span className="ml-1 rounded-full bg-dawn-light/50 px-2.5 py-0.5 text-xs font-semibold text-dawn-dark">
//               Rider portal
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <ThemeToggle />
//             <Link
//               to="/notifications"
//               className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5"
//               aria-label="Notifications"
//               title="Notifications"
//             >
//               <Bell size={17} />
//             </Link>
//             <button
//               onClick={() => {
//                 logout();
//                 navigate("/login");
//               }}
//               className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5"
//               aria-label="Log out"
//               title="Log out"
//             >
//               <LogOut size={17} />
//             </button>
//           </div>
//         </div>
//         {user && (
//           <p className="mx-auto max-w-2xl px-6 pb-3 text-xs text-ink-faint">
//             Signed in as {user.username?.firstName} {user.username?.lastName || ""}
//           </p>
//         )}
//       </header>
//       <main className="mx-auto max-w-2xl px-6 py-8">{children}</main>
//     </div>
//   );
// }