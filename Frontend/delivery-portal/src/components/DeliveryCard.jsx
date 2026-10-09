// import { useState } from "react";
// import toast from "react-hot-toast";
// import { MapPin, Check, X, Milk, ThumbsUp, ThumbsDown } from "lucide-react";
// import { deliveryApi } from "../api/delivery.js";
// import Card from "./ui/Card.jsx";
// import Badge from "./ui/Badge.jsx";
// import Button from "./ui/Button.jsx";
// import { formatDate, SLOT_LABEL } from "../lib/utils.js";

// const deliveryStatusFlow = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];
// const deliveryStatusLabel = {
//   pending: "Pending",
//   assigned: "Assigned to you",
//   "picked-up": "Picked up",
//   "out-for-delivery": "Out for delivery",
//   delivered: "Delivered",
//   failed: "Failed",
// };
// const deliveryStatusStyle = {
//   pending: "bg-butter-light/60 text-butter-dark",
//   assigned: "bg-dawn-light/60 text-dawn-dark",
//   "picked-up": "bg-dawn-light/60 text-dawn-dark",
//   "out-for-delivery": "bg-dawn-light/60 text-dawn-dark",
//   delivered: "bg-leaf-light text-leaf",
//   failed: "bg-clay-light text-clay",
// };

// export default function DeliveryCard({ delivery, onChanged }) {
//   const [updating, setUpdating] = useState(false);
//   const [responding, setResponding] = useState(false);
//   const [sharingLocation, setSharingLocation] = useState(false);

//   const order = delivery.order || {};
//   const nextStep = deliveryStatusFlow[deliveryStatusFlow.indexOf(delivery.status) + 1];
//   const isDone = delivery.status === "delivered" || delivery.status === "failed";
//   const needsResponse = !delivery.riderConfirmed && !isDone;

//   const advance = async (status) => {
//     setUpdating(true);
//     try {
//       await deliveryApi.updateStatus(delivery._id, { status });
//       toast.success(`Marked ${deliveryStatusLabel[status].toLowerCase()}`);
//       onChanged();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const respond = async (accept) => {
//     setResponding(true);
//     try {
//       if (accept) {
//         await deliveryApi.confirm(delivery._id);
//         toast.success("Delivery confirmed — you're on the hook for this one");
//       } else {
//         await deliveryApi.decline(delivery._id);
//         toast.success("Declined — it's been offered to someone else nearby");
//       }
//       onChanged();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setResponding(false);
//     }
//   };

//   const shareLocation = () => {
//     if (!navigator.geolocation) return;
//     setSharingLocation(true);
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           await deliveryApi.updateLocation(delivery._id, [pos.coords.longitude, pos.coords.latitude]);
//           toast.success("Location shared");
//         } catch (err) {
//           toast.error(err.message);
//         } finally {
//           setSharingLocation(false);
//         }
//       },
//       () => {
//         toast.error("Couldn't access your location");
//         setSharingLocation(false);
//       }
//     );
//   };

//   return (
//     <Card className={needsResponse ? "border-butter/50 p-4" : "p-4"}>
//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-start gap-3">
//           <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
//             <Milk size={16} />
//           </span>
//           <div>
//             <p className="font-medium text-ink">{order.milkType?.name || "Milk order"}</p>
//             <p className="text-xs text-ink-faint">
//               Qty {order.quantity} {order.milkType?.unit} · {SLOT_LABEL[order.deliverySlot]}
//             </p>
//             <p className="mt-1 text-xs text-ink-faint">Scheduled {formatDate(order.scheduledDate)}</p>
//           </div>
//         </div>
//         <Badge className={deliveryStatusStyle[delivery.status]}>{deliveryStatusLabel[delivery.status]}</Badge>
//       </div>

//       <div className="mt-3 flex items-start gap-2 border-t border-ink/8 pt-3 text-sm text-ink-soft">
//         <MapPin size={14} className="mt-0.5 flex-none text-ink-faint" />
//         <span>{order.deliveryAddress?.fullAddress || "Address unavailable"}</span>
//       </div>

//       {needsResponse ? (
//         <div className="mt-3 flex flex-col gap-2">
//           <p className="text-xs font-medium text-butter-dark">New assignment — take this delivery?</p>
//           <div className="flex gap-2">
//             <Button size="sm" onClick={() => respond(true)} loading={responding}>
//               <ThumbsUp size={14} /> Accept
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-clay hover:bg-clay-light"
//               onClick={() => respond(false)}
//               loading={responding}
//             >
//               <ThumbsDown size={14} /> Decline
//             </Button>
//           </div>
//         </div>
//       ) : (
//         !isDone && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {nextStep && nextStep !== "failed" && (
//               <Button size="sm" onClick={() => advance(nextStep)} loading={updating}>
//                 <Check size={14} /> Mark {deliveryStatusLabel[nextStep].toLowerCase()}
//               </Button>
//             )}
//             <Button variant="outline" size="sm" onClick={shareLocation} loading={sharingLocation}>
//               <MapPin size={14} /> Share my location
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-clay hover:bg-clay-light"
//               onClick={() => advance("failed")}
//               loading={updating}
//             >
//               <X size={14} /> Mark failed
//             </Button>
//           </div>
//         )
//       )}
//     </Card>
//   );
// }






import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Check, X, Milk, ThumbsUp, ThumbsDown, Navigation } from "lucide-react";
import { deliveryApi } from "../api/delivery.js";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import DeliveryMap from "./DeliveryMap.jsx";
import { formatDate, SLOT_LABEL } from "../lib/utils.js";

const deliveryStatusFlow = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];
const deliveryStatusLabel = {
  pending: "Pending",
  assigned: "Assigned to you",
  "picked-up": "Picked up",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};
const deliveryStatusStyle = {
  pending: "bg-butter-light/60 text-butter-dark",
  assigned: "bg-dawn-light/60 text-dawn-dark",
  "picked-up": "bg-dawn-light/60 text-dawn-dark",
  "out-for-delivery": "bg-dawn-light/60 text-dawn-dark",
  delivered: "bg-leaf-light text-leaf",
  failed: "bg-clay-light text-clay",
};

const MIN_UPDATE_INTERVAL_MS = 20_000;

// [lng, lat] (GeoJSON, how the backend stores it) -> {lat, lng} (how
// Leaflet/DeliveryMap wants it).
function toLatLng(coords, label) {
  if (!coords || coords.length !== 2) return null;
  return { lng: coords[0], lat: coords[1], label };
}

export default function DeliveryCard({ delivery, onChanged }) {
  const [updating, setUpdating] = useState(false);
  const [responding, setResponding] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const order = delivery.order || {};
  const nextStep = deliveryStatusFlow[deliveryStatusFlow.indexOf(delivery.status) + 1];
  const isDone = delivery.status === "delivered" || delivery.status === "failed";
  const needsResponse = !delivery.riderConfirmed && !isDone;

  // Which leg of the trip is this: heading to the dairy to pick up, or
  // heading to the customer to deliver? Drives both the map's destination
  // and which icon it uses.
  const phase = delivery.status === "out-for-delivery" ? "toCustomer" : "toDairy";
  const isTrackable = delivery.riderConfirmed && !isDone;

  // While this delivery is confirmed and active, continuously watch this
  // rider's own position for the map (immediate, no round-trip needed)
  // and periodically push it to the backend so the customer's tracking
  // map stays in sync too.
  useEffect(() => {
    if (!isTrackable) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setMyPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "You" });

        const now = Date.now();
        if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
        lastSentRef.current = now;
        deliveryApi
          .updateLocation(delivery._id, [pos.coords.longitude, pos.coords.latitude])
          .catch(() => {
            // A missed update isn't worth interrupting the rider — the
            // next watchPosition tick tries again.
          });
      },
      () => {
        // Silent — the map just shows "location not available" via
        // DeliveryMap's own fallback if this never fires successfully.
      },
      { enableHighAccuracy: true, maximumAge: 15_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTrackable, delivery._id]);

  const destination =
    phase === "toDairy"
      ? toLatLng(delivery.dairy?.location?.coordinates, delivery.dairy?.name || "Dairy")
      : toLatLng(order.deliveryAddress?.location?.coordinates, order.deliveryAddress?.label || "Customer");

  const advance = async (status) => {
    setUpdating(true);
    try {
      await deliveryApi.updateStatus(delivery._id, { status });
      toast.success(`Marked ${deliveryStatusLabel[status].toLowerCase()}`);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const respond = async (accept) => {
    setResponding(true);
    try {
      if (accept) {
        await deliveryApi.confirm(delivery._id);
        toast.success("Delivery confirmed — you're on the hook for this one");
      } else {
        await deliveryApi.decline(delivery._id);
        toast.success("Declined — it's been offered to someone else nearby");
      }
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResponding(false);
    }
  };

  return (
    <Card className={needsResponse ? "border-butter/50 p-4" : "p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
            <Milk size={16} />
          </span>
          <div>
            <p className="font-medium text-ink">{order.milkType?.name || "Milk order"}</p>
            <p className="text-xs text-ink-faint">
              Qty {order.quantity} {order.milkType?.unit} · {SLOT_LABEL[order.deliverySlot]}
            </p>
            <p className="mt-1 text-xs text-ink-faint">Scheduled {formatDate(order.scheduledDate)}</p>
          </div>
        </div>
        <Badge className={deliveryStatusStyle[delivery.status]}>{deliveryStatusLabel[delivery.status]}</Badge>
      </div>

      <div className="mt-3 flex items-start gap-2 border-t border-ink/8 pt-3 text-sm text-ink-soft">
        <MapPin size={14} className="mt-0.5 flex-none text-ink-faint" />
        <span>{order.deliveryAddress?.fullAddress || "Address unavailable"}</span>
      </div>

      {needsResponse ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-butter-dark">New assignment — take this delivery?</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => respond(true)} loading={responding}>
              <ThumbsUp size={14} /> Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-clay hover:bg-clay-light"
              onClick={() => respond(false)}
              loading={responding}
            >
              <ThumbsDown size={14} /> Decline
            </Button>
          </div>
        </div>
      ) : (
        !isDone && (
          <>
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Navigation size={13} />
                {phase === "toDairy" ? "Navigate to the dairy for pickup" : "Navigate to the customer"}
              </p>
              <DeliveryMap
                origin={myPosition}
                destination={destination}
                destinationType={phase === "toDairy" ? "dairy" : "home"}
                height={220}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {nextStep && nextStep !== "failed" && (
                <Button size="sm" onClick={() => advance(nextStep)} loading={updating}>
                  <Check size={14} /> Mark {deliveryStatusLabel[nextStep].toLowerCase()}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-clay hover:bg-clay-light"
                onClick={() => advance("failed")}
                loading={updating}
              >
                <X size={14} /> Mark failed
              </Button>
            </div>
          </>
        )
      )}
    </Card>
  );
}