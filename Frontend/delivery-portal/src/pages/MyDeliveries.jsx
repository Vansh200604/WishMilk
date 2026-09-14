// import { useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { Truck, Wifi, WifiOff } from "lucide-react";
// import { deliveryApi } from "../api/delivery.js";
// import { authApi } from "../api/auth.js";
// import DeliveryCard from "../components/DeliveryCard.jsx";
// import Button from "../components/ui/Button.jsx";
// import Spinner from "../components/ui/Spinner.jsx";
// import EmptyState from "../components/ui/EmptyState.jsx";
// import { cx } from "../lib/utils.js";

// const tabs = [
//   { value: "", label: "Active", isActiveFilter: true },
//   { value: "delivered", label: "Delivered" },
//   { value: "failed", label: "Failed" },
// ];

// const TRACKING_KEY = "wishmilk_rider_tracking";
// const MIN_UPDATE_INTERVAL_MS = 30_000; // don't hammer the API on every GPS tick

// export default function MyDeliveries() {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState("");
//   // "Online" = the browser is actively watching position and pushing
//   // updates automatically, not just a one-off manual share. Persisted so
//   // it survives a page refresh — the rider doesn't have to re-enable it
//   // every time they open the app.
//   const [online, setOnline] = useState(() => localStorage.getItem(TRACKING_KEY) === "true");
//   const watchIdRef = useRef(null);
//   const lastSentRef = useRef(0);

//   const load = () => {
//     setLoading(true);
//     const params = tab && !tabs.find((t) => t.value === tab)?.isActiveFilter ? { status: tab } : {};
//     deliveryApi
//       .myDeliveries(params)
//       .then((res) => {
//         let data = res.data || [];
//         if (tab === "") {
//           data = data.filter((d) => !["delivered", "failed"].includes(d.status));
//         }
//         data.sort((a, b) => Number(!a.riderConfirmed) - Number(!b.riderConfirmed));
//         setDeliveries(data);
//       })
//       .catch((err) => toast.error(err.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, [tab]);

//   // Starts/stops the browser's live position watch whenever "online" is
//   // toggled, and cleans up automatically if the page unmounts (e.g. the
//   // rider navigates away or closes the tab) so it never keeps running
//   // silently in the background.
//   useEffect(() => {
//     localStorage.setItem(TRACKING_KEY, String(online));

//     if (!online) {
//       if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//         watchIdRef.current = null;
//       }
//       return;
//     }

//     if (!navigator.geolocation) {
//       toast.error("Location isn't available in this browser");
//       setOnline(false);
//       return;
//     }

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (pos) => {
//         const now = Date.now();
//         if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
//         lastSentRef.current = now;
//         authApi
//           .updateMyLocation([pos.coords.longitude, pos.coords.latitude])
//           .catch(() => {
//             // A single missed update isn't worth interrupting the rider —
//             // the next watchPosition tick will just try again.
//           });
//       },
//       () => {
//         toast.error("Lost access to your location — you've been taken offline");
//         setOnline(false);
//       },
//       { enableHighAccuracy: true, maximumAge: 15_000 }
//     );

//     return () => {
//       if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//         watchIdRef.current = null;
//       }
//     };
//   }, [online]);

//   const toggleOnline = () => {
//     if (!online) {
//       toast.success("You're online — sharing your location automatically");
//     } else {
//       toast("You're offline — you won't be matched to new deliveries", { icon: "📴" });
//     }
//     setOnline((v) => !v);
//   };

//   const pendingCount = deliveries.filter((d) => !d.riderConfirmed).length;

//   return (
//     <div>
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <h1 className="font-display text-2xl font-semibold text-ink">My deliveries</h1>
//           {pendingCount > 0 && (
//             <p className="mt-1 text-xs font-medium text-butter-dark">
//               {pendingCount} awaiting your response
//             </p>
//           )}
//         </div>
//         <Button
//           variant={online ? "primary" : "outline"}
//           size="sm"
//           onClick={toggleOnline}
//         >
//           {online ? <Wifi size={14} /> : <WifiOff size={14} />}
//           {online ? "Online" : "Go online"}
//         </Button>
//       </div>
//       <p className="mt-1 text-xs text-ink-faint">
//         {online
//           ? "Your location updates automatically while you're online."
//           : "Go online to share your location and become eligible for nearby deliveries."}
//       </p>

//       <div className="mt-4 flex gap-2">
//         {tabs.map((t) => (
//           <button
//             key={t.value}
//             onClick={() => setTab(t.value)}
//             className={cx(
//               "rounded-full border px-3.5 py-1.5 text-xs font-medium",
//               tab === t.value
//                 ? "border-butter bg-butter-light/50 text-butter-dark"
//                 : "border-ink/12 text-ink-soft"
//             )}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       <div className="mt-5">
//         {loading ? (
//           <Spinner />
//         ) : deliveries.length === 0 ? (
//           <EmptyState
//             icon={Truck}
//             title="Nothing here"
//             description="Deliveries assigned to you by your dairy will show up here."
//           />
//         ) : (
//           <div className="flex flex-col gap-3">
//             {deliveries.map((d) => (
//               <DeliveryCard key={d._id} delivery={d} onChanged={load} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }














import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Truck, Wifi, WifiOff } from "lucide-react";
import { deliveryApi } from "../api/delivery.js";
import { authApi } from "../api/auth.js";
import DeliveryCard from "../components/DeliveryCard.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { cx } from "../lib/utils.js";

const tabs = [
  { value: "", label: "Active", isActiveFilter: true },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

const TRACKING_KEY = "wishmilk_rider_tracking";
const MIN_UPDATE_INTERVAL_MS = 30_000; // don't hammer the API on every GPS tick

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  // "Online" = the browser is actively watching position and pushing
  // updates automatically, not just a one-off manual share. Persisted so
  // it survives a page refresh — the rider doesn't have to re-enable it
  // every time they open the app.
  const [online, setOnline] = useState(() => localStorage.getItem(TRACKING_KEY) === "true");
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const load = () => {
    setLoading(true);
    const params = tab && !tabs.find((t) => t.value === tab)?.isActiveFilter ? { status: tab } : {};
    deliveryApi
      .myDeliveries(params)
      .then((res) => {
        let data = res.data || [];
        if (tab === "") {
          data = data.filter((d) => !["delivered", "failed"].includes(d.status));
        }
        data.sort((a, b) => Number(!a.riderConfirmed) - Number(!b.riderConfirmed));
        setDeliveries(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  // Starts/stops the browser's live position watch whenever "online" is
  // toggled, and cleans up automatically if the page unmounts (e.g. the
  // rider navigates away or closes the tab) so it never keeps running
  // silently in the background.
  useEffect(() => {
    localStorage.setItem(TRACKING_KEY, String(online));

    if (!online) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Location isn't available in this browser");
      setOnline(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
        lastSentRef.current = now;
        authApi
          .updateMyLocation([pos.coords.longitude, pos.coords.latitude])
          .catch(() => {
            // A single missed update isn't worth interrupting the rider —
            // the next watchPosition tick will just try again.
          });
      },
      () => {
        authApi.goOffline().catch(() => {});
        toast.error("Lost access to your location — you've been taken offline");
        setOnline(false);
      },
      { enableHighAccuracy: true, maximumAge: 15_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [online]);

  const toggleOnline = () => {
    if (!online) {
      toast.success("You're online — sharing your location automatically");
    } else {
      authApi.goOffline().catch(() => {
        // If this fails, the rider still stops watching locally below —
        // worst case they're briefly matchable until their location goes
        // stale, not a broken experience either way.
      });
      toast("You're offline — you won't be matched to new deliveries", { icon: "📴" });
    }
    setOnline((v) => !v);
  };

  const pendingCount = deliveries.filter((d) => !d.riderConfirmed).length;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My deliveries</h1>
          {pendingCount > 0 && (
            <p className="mt-1 text-xs font-medium text-butter-dark">
              {pendingCount} awaiting your response
            </p>
          )}
        </div>
        <Button
          variant={online ? "primary" : "outline"}
          size="sm"
          onClick={toggleOnline}
        >
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          {online ? "Online" : "Go online"}
        </Button>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        {online
          ? "Your location updates automatically while you're online."
          : "Go online to share your location and become eligible for nearby deliveries."}
      </p>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cx(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium",
              tab === t.value
                ? "border-butter bg-butter-light/50 text-butter-dark"
                : "border-ink/12 text-ink-soft"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <Spinner />
        ) : deliveries.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Nothing here"
            description="Deliveries assigned to you by your dairy will show up here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {deliveries.map((d) => (
              <DeliveryCard key={d._id} delivery={d} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}