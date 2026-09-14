
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { User, MapPin, Bell, Wallet as WalletIcon, LogOut, ChevronRight, KeyRound, Heart, Store, Repeat } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { authApi } from "../api/auth.js";
// import Card from "../components/ui/Card.jsx";
// import Input from "../components/ui/Input.jsx";
// import Button from "../components/ui/Button.jsx";
// import ThemeToggle from "../components/ui/ThemeToggle.jsx";
// import { MILK_TYPE_LABEL, cx } from "../lib/utils.js";

// const links = [
//   { to: "/addresses", label: "Delivery addresses", icon: MapPin },
//   { to: "/subscriptions", label: "Subscriptions", icon: Repeat },
//   { to: "/wallet", label: "Wallet & loyalty points", icon: WalletIcon },
//   { to: "/notifications", label: "Notifications", icon: Bell },
// ];

// export default function Profile() {
//   const { user, logout, refreshProfile } = useAuth();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     firstName: user?.username?.firstName || "",
//     lastName: user?.username?.lastName || "",
//     phone: user?.phone || "",
//     preferredMilk: user?.preferredMilk || "",
//   });
//   const [saving, setSaving] = useState(false);

//   // Favorites toggle immediately on click rather than waiting for a save
//   // button — matches the pattern used for dark mode and notifications.
//   const [favorites, setFavorites] = useState(user?.favorites || []);
//   const [savingFavorite, setSavingFavorite] = useState("");

//   const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
//   const [changingPassword, setChangingPassword] = useState(false);

//   const [becomingOwner, setBecomingOwner] = useState(false);

//   const handleBecomeDairyOwner = async () => {
//     if (!window.confirm("Register a dairy business on WishMilk? This upgrades your account to a dairy owner.")) {
//       return;
//     }
//     setBecomingOwner(true);
//     try {
//       await authApi.becomeDairyOwner();
//       await refreshProfile();
//       toast.success("You're now a dairy owner!");
//       navigate("/owner/dairy");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setBecomingOwner(false);
//     }
//   };

//   const toggleFavorite = async (type) => {
//     const next = favorites.includes(type)
//       ? favorites.filter((t) => t !== type)
//       : [...favorites, type];

//     setSavingFavorite(type);
//     const previous = favorites;
//     setFavorites(next); // optimistic
//     try {
//       await authApi.updateProfile({ favorites: next });
//     } catch (err) {
//       setFavorites(previous); // revert on failure
//       toast.error(err.message);
//     } finally {
//       setSavingFavorite("");
//     }
//   };

//   const handleSaveProfile = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await authApi.updateProfile({
//         username: { firstName: form.firstName, lastName: form.lastName },
//         phone: form.phone,
//         preferredMilk: form.preferredMilk || undefined,
//       });
//       await refreshProfile();
//       toast.success("Profile updated");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     setChangingPassword(true);
//     try {
//       await authApi.changePassword(passwords);
//       toast.success("Password changed");
//       setPasswords({ currentPassword: "", newPassword: "" });
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setChangingPassword(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-2xl px-6 py-10">
//       <div className="flex items-center gap-4">
//         <span className="flex h-14 w-14 items-center justify-center rounded-full bg-butter text-ink-fixed">
//           <User size={24} />
//         </span>
//         <div>
//           <h1 className="font-display text-2xl font-semibold text-ink">
//             {user?.username?.firstName} {user?.username?.lastName}
//           </h1>
//           <p className="text-sm text-ink-soft">{user?.email}</p>
//         </div>
//       </div>

//       {user?.role === "dairyOwner" && (
//         <Link to="/owner" className="mt-6 block">
//           <Card className="flex items-center gap-3 border-dawn/30 bg-dawn-light/30 p-4">
//             <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dawn text-white">
//               <Store size={17} />
//             </span>
//             <span className="flex-1 text-sm font-medium text-dawn-dark">Go to owner portal</span>
//             <ChevronRight size={16} className="text-dawn-dark" />
//           </Card>
//         </Link>
//       )}

//       {user?.role === "user" && (
//         <Card className="mt-6 p-4">
//           <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
//             <Store size={15} /> Run a dairy?
//           </p>
//           <p className="mt-0.5 text-xs text-ink-faint">
//             Register your business to list milk products and start taking orders.
//           </p>
//           <Button
//             variant="outline"
//             size="sm"
//             className="mt-3"
//             onClick={handleBecomeDairyOwner}
//             loading={becomingOwner}
//           >
//             Become a dairy owner
//           </Button>
//         </Card>
//       )}

//       <div className="mt-6 flex flex-col gap-2">
//         {links.map(({ to, label, icon: Icon }) => (
//           <Link key={to} to={to}>
//             <Card className="flex items-center gap-3 p-4 transition-colors hover:border-butter/40">
//               <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
//                 <Icon size={17} />
//               </span>
//               <span className="flex-1 text-sm font-medium text-ink">{label}</span>
//               <ChevronRight size={16} className="text-ink-faint" />
//             </Card>
//           </Link>
//         ))}
//       </div>

//       <Card className="mt-2 flex items-center justify-between gap-3 p-4">
//         <div>
//           <p className="text-sm font-medium text-ink">Appearance</p>
//           <p className="text-xs text-ink-faint">Light, dark, or match your device</p>
//         </div>
//         <ThemeToggle />
//       </Card>

//       <Card className="mt-2 p-4">
//         <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
//           <Heart size={15} /> Favorite milk types
//         </p>
//         <p className="mt-0.5 text-xs text-ink-faint">Used to personalize what you see first</p>
//         <div className="mt-3 flex flex-wrap gap-2">
//           {Object.entries(MILK_TYPE_LABEL).map(([type, label]) => {
//             const active = favorites.includes(type);
//             return (
//               <button
//                 key={type}
//                 onClick={() => toggleFavorite(type)}
//                 disabled={savingFavorite === type}
//                 className={cx(
//                   "rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50",
//                   active
//                     ? "border-butter bg-butter-light/50 text-butter-dark"
//                     : "border-ink/12 text-ink-soft"
//                 )}
//               >
//                 {label}
//               </button>
//             );
//           })}
//         </div>
//       </Card>

//       <Card className="mt-6 p-5">
//         <h2 className="font-display text-base font-semibold text-ink">Personal details</h2>
//         <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <Input
//               label="First name"
//               value={form.firstName}
//               onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
//             />
//             <Input
//               label="Last name"
//               value={form.lastName}
//               onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
//             />
//           </div>
//           <Input
//             label="Phone"
//             value={form.phone}
//             onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
//           />
//           <label className="block">
//             <span className="mb-1.5 block text-sm font-medium text-ink-soft">Preferred milk</span>
//             <select
//               className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
//               value={form.preferredMilk}
//               onChange={(e) => setForm((f) => ({ ...f, preferredMilk: e.target.value }))}
//             >
//               <option value="">No preference</option>
//               {Object.entries(MILK_TYPE_LABEL).map(([value, label]) => (
//                 <option key={value} value={value}>
//                   {label}
//                 </option>
//               ))}
//             </select>
//           </label>
//           <Button type="submit" loading={saving} className="self-start">
//             Save changes
//           </Button>
//         </form>
//       </Card>

//       <Card className="mt-4 p-5">
//         <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
//           <KeyRound size={16} /> Change password
//         </h2>
//         <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-4">
//           <Input
//             label="Current password"
//             type="password"
//             required
//             value={passwords.currentPassword}
//             onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
//           /> 
//           <Input
//             label="New password"
//             type="password"
//             required
//             minLength={6}
//             value={passwords.newPassword}
//             onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
//           />
//           <Button type="submit" variant="outline" loading={changingPassword} className="self-start">
//             Update password
//           </Button>
//         </form>
//       </Card>

//       <Button
//         variant="ghost"
//         className="mt-6 w-full text-clay hover:bg-clay-light"
//         onClick={() => {
//           logout();
//           navigate("/");
//         }}
//       >
//         <LogOut size={16} /> Log out
//       </Button>
//     </div>
//   );
// }








import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, MapPin, Bell, Wallet as WalletIcon, LogOut, ChevronRight, KeyRound, Heart, Store, Repeat } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../api/auth.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import { MILK_TYPE_LABEL, cx } from "../lib/utils.js";

const links = [
  { to: "/addresses", label: "Delivery addresses", icon: MapPin },
  { to: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/wallet", label: "Wallet & loyalty points", icon: WalletIcon },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: user?.username?.firstName || "",
    lastName: user?.username?.lastName || "",
    phone: user?.phone || "",
    preferredMilk: user?.preferredMilk || "",
  });
  const [saving, setSaving] = useState(false);

  // Favorites toggle immediately on click rather than waiting for a save
  // button — matches the pattern used for dark mode and notifications.
  const [favorites, setFavorites] = useState(user?.favorites || []);
  const [savingFavorite, setSavingFavorite] = useState("");

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const toggleFavorite = async (type) => {
    const next = favorites.includes(type)
      ? favorites.filter((t) => t !== type)
      : [...favorites, type];

    setSavingFavorite(type);
    const previous = favorites;
    setFavorites(next); // optimistic
    try {
      await authApi.updateProfile({ favorites: next });
    } catch (err) {
      setFavorites(previous); // revert on failure
      toast.error(err.message);
    } finally {
      setSavingFavorite("");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({
        username: { firstName: form.firstName, lastName: form.lastName },
        phone: form.phone,
        preferredMilk: form.preferredMilk || undefined,
      });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwords);
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <User size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {user?.username?.firstName} {user?.username?.lastName}
          </h1>
          <p className="text-sm text-ink-soft">{user?.email}</p>
        </div>
      </div>

      {user?.role === "dairyOwner" && (
        <a
          href={import.meta.env.VITE_OWNER_PORTAL_URL || "http://localhost:5174"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block"
        >
          <Card className="flex items-center gap-3 border-dawn/30 bg-dawn-light/30 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dawn text-white">
              <Store size={17} />
            </span>
            <span className="flex-1 text-sm font-medium text-dawn-dark">Go to owner portal</span>
            <ChevronRight size={16} className="text-dawn-dark" />
          </Card>
        </a>
      )}

      {user?.role === "user" && (
        <Card className="mt-6 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Store size={15} /> Run a dairy?
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            Register your business on the{" "}
            <a
              href={import.meta.env.VITE_OWNER_PORTAL_URL || "http://localhost:5174"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-dawn-dark hover:underline"
            >
              WishMilk Owner Portal
            </a>{" "}
            to list milk products and start taking orders.
          </p>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex items-center gap-3 p-4 transition-colors hover:border-butter/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
                <Icon size={17} />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{label}</span>
              <ChevronRight size={16} className="text-ink-faint" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-2 flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium text-ink">Appearance</p>
          <p className="text-xs text-ink-faint">Light, dark, or match your device</p>
        </div>
        <ThemeToggle />
      </Card>

      <Card className="mt-2 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <Heart size={15} /> Favorite milk types
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">Used to personalize what you see first</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(MILK_TYPE_LABEL).map(([type, label]) => {
            const active = favorites.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleFavorite(type)}
                disabled={savingFavorite === type}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50",
                  active
                    ? "border-butter bg-butter-light/50 text-butter-dark"
                    : "border-ink/12 text-ink-soft"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Personal details</h2>
        <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Preferred milk</span>
            <select
              className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
              value={form.preferredMilk}
              onChange={(e) => setForm((f) => ({ ...f, preferredMilk: e.target.value }))}
            >
              <option value="">No preference</option>
              {Object.entries(MILK_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" loading={saving} className="self-start">
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <KeyRound size={16} /> Change password
        </h2>
        <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={6}
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Button type="submit" variant="outline" loading={changingPassword} className="self-start">
            Update password
          </Button>
        </form>
      </Card>

      <Button
        variant="ghost"
        className="mt-6 w-full text-clay hover:bg-clay-light"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        <LogOut size={16} /> Log out
      </Button>
    </div>
  );
}
