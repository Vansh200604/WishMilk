// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Truck } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { dairyApi } from "../api/dairy.js";
// import Card from "../components/ui/Card.jsx";
// import Input from "../components/ui/Input.jsx";
// import Button from "../components/ui/Button.jsx";
// import { cx } from "../lib/utils.js";

// const initialForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

// // Registers a normal account and immediately links it to the chosen dairy
// // as a rider — one submit. Known limitation (see README): the dairy owner
// // doesn't approve this, so anyone can claim to ride for any dairy today.
// export default function Register() {
//   const { registerAsRider } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState(initialForm);
//   const [dairies, setDairies] = useState([]);
//   const [dairyId, setDairyId] = useState("");
//   const [loadingDairies, setLoadingDairies] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     dairyApi
//       .list({})
//       .then((res) => setDairies(res.data || []))
//       .catch(() => setDairies([]))
//       .finally(() => setLoadingDairies(false));
//   }, []);

//   const set = (patch) => setForm((f) => ({ ...f, ...patch }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     if (!dairyId) {
//       setError("Please choose which dairy you ride for");
//       return;
//     }
//     setLoading(true);
//     try {
//       await registerAsRider(
//         {
//           username: { firstName: form.firstName, lastName: form.lastName },
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           // Riders don't place orders, but the User model requires a
//           // location — a neutral placeholder is fine here.
//           location: { address: "N/A", coordinates: [0, 0] },
//         },
//         dairyId
//       );
//       toast.success("You're in! Check My Deliveries for anything assigned to you.");
//       navigate("/", { replace: true });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
//       <div className="mb-8 flex flex-col items-center text-center">
//         <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
//           <Truck size={20} />
//         </span>
//         <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Join as a rider</h1>
//         <p className="mt-1 text-sm text-ink-soft">Pick the dairy you deliver for, and you're set.</p>
//       </div>

//       <Card className="p-6">
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <Input
//               label="First name"
//               required
//               value={form.firstName}
//               onChange={(e) => set({ firstName: e.target.value })}
//             />
//             <Input
//               label="Last name"
//               value={form.lastName}
//               onChange={(e) => set({ lastName: e.target.value })}
//             />
//           </div>
//           <Input
//             label="Email"
//             type="email"
//             required
//             value={form.email}
//             onChange={(e) => set({ email: e.target.value })}
//           />
//           <Input label="Phone number" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
//           <Input
//             label="Password"
//             type="password"
//             required
//             minLength={6}
//             value={form.password}
//             onChange={(e) => set({ password: e.target.value })}
//           />

//           <label className="block">
//             <span className="mb-1.5 block text-sm font-medium text-ink-soft">Which dairy do you ride for?</span>
//             <select
//               className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
//               value={dairyId}
//               onChange={(e) => setDairyId(e.target.value)}
//               disabled={loadingDairies}
//             >
//               <option value="">{loadingDairies ? "Loading dairies…" : "Select a dairy"}</option>
//               {dairies.map((d) => (
//                 <option key={d._id} value={d._id}>
//                   {d.name}
//                 </option>
//               ))}
//             </select>
//           </label>

//           {error && <p className="text-sm text-clay">{error}</p>}

//           <Button type="submit" size="lg" loading={loading} className="w-full">
//             Create account
//           </Button>
//         </form>
//       </Card>

//       <p className="mt-6 text-center text-sm text-ink-soft">
//         Already have an account?{" "}
//         <Link to="/login" className="font-medium text-dawn-dark hover:underline">
//           Log in
//         </Link>
//       </p>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Truck, LocateFixed, CheckCircle2 } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { dairyApi } from "../api/dairy.js";
// import Card from "../components/ui/Card.jsx";
// import Input from "../components/ui/Input.jsx";
// import Button from "../components/ui/Button.jsx";
// import { cx } from "../lib/utils.js";

// const initialForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

// // Registers a normal account and immediately links it to the chosen dairy
// // as a rider — one submit. Known limitation (see README): the dairy owner
// // doesn't approve this, so anyone can claim to ride for any dairy today.
// export default function Register() {
//   const { registerAsRider } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState(initialForm);
//   const [dairies, setDairies] = useState([]);
//   const [dairyId, setDairyId] = useState("");
//   const [nearestId, setNearestId] = useState("");
//   const [locating, setLocating] = useState(false);
//   const [loadingDairies, setLoadingDairies] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");



//   useEffect(() => {
//     dairyApi
//       .list({})
//       .then((res) =>  setDairies(res.data || []))
//       .catch(() => setDairies([]))
//       .finally(() => setLoadingDairies(false));
//   }, []);

//   const set = (patch) => setForm((f) => ({ ...f, ...patch }));

//   // Auto-detects the nearest dairy from the rider's current location and
//   // pre-selects it — they can still pick a different one from the list.
//   const detectNearestDairy = () => {
//     if (!navigator.geolocation) {
//       toast.error("Location isn't available in this browser");
//       return;
//     }
//     setLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const res = await dairyApi.nearby({
//             lng: pos.coords.longitude,
//             lat: pos.coords.latitude,
//             radius: 15000,
//           });
//           const nearest = res.data?.[0];
//           if (nearest) {
//             setDairyId(nearest._id);
//             setNearestId(nearest._id);
//             toast.success(`Nearest dairy: ${nearest.name}`);
//           } else {
//             toast.error("No dairies found nearby — pick one from the list");
//           }
//         } catch (err) {
//           toast.error(err.message);
//         } finally {
//           setLocating(false);
//         }
//       },
//       () => {
//         toast.error("Couldn't access your location — pick a dairy from the list instead");
//         setLocating(false);
//       }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     if (!dairyId) {
//       setError("Please choose which dairy you ride for");
//       return;
//     }
//     setLoading(true);
//     try {
//       await registerAsRider(
//         {
//           username: { firstName: form.firstName, lastName: form.lastName },
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           role: "deliveryPerson",
//           // Riders don't place orders, but the User model requires a
//           // location — a neutral placeholder is fine here.
//           location: { address: "N/A", coordinates: [0, 0] },
//         },
        
//       );
//       toast.success("You're in! Check My Deliveries for anything assigned to you.");
//       navigate("/", { replace: true });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
//       <div className="mb-8 flex flex-col items-center text-center">
//         <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
//           <Truck size={20} />
//         </span>
//         <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Join as a rider</h1>
//         <p className="mt-1 text-sm text-ink-soft">We'll suggest the dairy nearest you — or pick one yourself.</p>
//       </div>

//       <Card className="p-6">
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <Input
//               label="First name"
//               required
//               value={form.firstName}
//               onChange={(e) => set({ firstName: e.target.value })}
//             />
//             <Input
//               label="Last name"
//               value={form.lastName}
//               onChange={(e) => set({ lastName: e.target.value })}
//             />
//           </div>
//           <Input
//             label="Email"
//             type="email"
//             required
//             value={form.email}
//             onChange={(e) => set({ email: e.target.value })}
//           />
//           <Input label="Phone number" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
//           <Input
//             label="Password"
//             type="password"
//             required
//             minLength={6}
//             value={form.password}
//             onChange={(e) => set({ password: e.target.value })}
//           />

//             <div>
//               <div className="mb-1.5 flex items-center justify-between">
//                 <span className="text-sm font-medium text-ink-soft">Which dairy do you ride for?</span>
//                 <button
//                   type="button"
//                   onClick={detectNearestDairy}
//                   disabled={locating}
//                   className="flex items-center gap-1 text-xs font-medium text-dawn-dark hover:underline disabled:opacity-50"
//                 >
//                   <LocateFixed size={13} /> {locating ? "Locating…" : "Find nearest"}
//                 </button>
//               </div>
//               <select
//                 className={cx(
//                   "w-full rounded-xl border bg-cream-card px-3.5 py-2.5 text-sm text-ink",
//                   dairyId && dairyId === nearestId ? "border-leaf" : "border-ink/12"
//                 )}
//                 value={dairyId}
//                 onChange={(e) => setDairyId(e.target.value)}
//                 disabled={loadingDairies}
//               >
//                 <option value="">{loadingDairies ? "Loading dairies…" : "Select a dairy"}</option>
//                 {dairies.map((d) => (
//                   <option key={d._id} value={d._id}>
//                     {d.name}
//                     {d._id === nearestId ? " (nearest)" : ""}
//                   </option>
//                 ))}
//               </select>
//               {dairyId && dairyId === nearestId && (
//                 <p className="mt-1.5 flex items-center gap-1 text-xs text-leaf">
//                   <CheckCircle2 size={12} /> Auto-selected as the nearest dairy to you
//                 </p>
//               )}
//             </div>

//           {error && <p className="text-sm text-clay">{error}</p>}

//           <Button type="submit" size="lg" loading={loading} className="w-full">
//             Create account
//           </Button>
//         </form>
//       </Card>

//       <p className="mt-6 text-center text-sm text-ink-soft">
//         Already have an account?{" "}
//         <Link to="/login" className="font-medium text-dawn-dark hover:underline">
//           Log in
//         </Link>
//       </p>
//     </div>
//   );
// }





import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

const initialForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

// Registers a normal account and immediately upgrades it to deliveryPerson
// in one submit. No dairy is chosen here — riders aren't tied to any one
// dairy. Which delivery a rider gets is decided dynamically: whenever a
// dairy owner creates a delivery, the backend finds whichever registered
// rider is currently closest and offers it to them.
export default function Register() {
  const { registerAsRider } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerAsRider({
        username: { firstName: form.firstName, lastName: form.lastName },
        email: form.email,
        phone: form.phone,
        password: form.password,
        // Riders don't place orders, but the User model requires a
        // location — a neutral placeholder is fine here. Their real,
        // meaningful location is set separately via "Update my location"
        // once they're in the app, which is what matching actually uses.
        currentLocation: {
          type: "Point",
          coordinates: [0, 0],
          address: "N/A",
        },
      });
      toast.success("You're in! Update your location, then check My Deliveries.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <Truck size={20} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Join as a rider</h1>
        <p className="mt-1 text-sm text-ink-soft">
          No dairy to pick — you'll be matched to nearby deliveries automatically.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
          />
          <Input label="Phone number" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
          />

          {error && <p className="text-sm text-clay">{error}</p>}
 
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-dawn-dark hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}