// import { useState } from "react";
// import toast from "react-hot-toast";
// import { ChevronDown, ChevronUp, Truck, MapPin, Check, UserCheck } from "lucide-react";
// import { orderApi } from "../api/order.js";
// import { deliveryApi } from "../api/delivery.js";
// import { authApi } from "../api/auth.js";
// import Card from "../components/ui/Card.jsx";
// import Badge from "../components/ui/Badge.jsx";
// import Button from "../components/ui/Button.jsx";
// import { formatINR, formatDate, ORDER_STATUS_STYLE, SLOT_LABEL } from "../lib/utils.js";

// const orderStatusOptions = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];

// // Delivery status values use hyphens on the backend (picked-up, not
// // picked_up) — matching the Delivery model's enum exactly.
// const deliveryStatusFlow = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];
// const deliveryStatusLabel = {
//   pending: "Pending",
//   assigned: "Assigned",
//   "picked-up": "Picked up",
//   "out-for-delivery": "Out for delivery",
//   delivered: "Delivered",
//   failed: "Failed",
// };

// export default function OwnerOrderCard({ order, onChanged }) {
//   const [updatingStatus, setUpdatingStatus] = useState(false);
//   const [expanded, setExpanded] = useState(false);
//   const [loadingDelivery, setLoadingDelivery] = useState(false);
//   const [delivery, setDelivery] = useState(undefined); // undefined = not loaded yet
//   const [creatingDelivery, setCreatingDelivery] = useState(false);
//   const [updatingDelivery, setUpdatingDelivery] = useState(false);
//   const [riders, setRiders] = useState([]);
//   const [assigningRider, setAssigningRider] = useState(false);

//   const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
//   const customerName = order.userId?.username
//     ? `${order.userId.username.firstName} ${order.userId.username.lastName || ""}`.trim()
//     : "Customer";

//   const handleStatusChange = async (e) => {
//     const status = e.target.value;
//     if (status === order.status) return;
//     if (status === "cancelled" && !window.confirm("Cancel this order?")) return;

//     setUpdatingStatus(true);
//     try {
//       await orderApi.updateStatus(order._id, { status });
//       toast.success(`Order marked ${status.replace("_", " ")}`);
//       onChanged();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const loadDelivery = () => {
//     setLoadingDelivery(true);
//     deliveryApi
//       .byOrder(order._id)
//       .then((res) => setDelivery(res.data))
//       .catch(() => setDelivery(null))
//       .finally(() => setLoadingDelivery(false));

//     authApi
//       .getRidersForDairy(order.dairy?._id || order.dairy)
//       .then((res) => setRiders(res.data || []))
//       .catch(() => setRiders([]));
//   };

//   const toggleExpand = () => {
//     setExpanded((e) => !e);
//     if (delivery === undefined) loadDelivery();
//   };

//   const handleAssignRider = async (riderId) => {
//     if (!riderId) return;
//     setAssigningRider(true);
//     try {
//       const res = await deliveryApi.assignRider(delivery._id, riderId);
//       setDelivery(res.data);
//       toast.success("Rider assigned");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setAssigningRider(false);
//     }
//   };

//   const handleCreateDelivery = async () => {
//     setCreatingDelivery(true);
//     try {
//       const res = await deliveryApi.create({ orderId: order._id });
//       setDelivery(res.data);
//       toast.success("Delivery created");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setCreatingDelivery(false);
//     }
//   };

//   const advanceDelivery = async (status) => {
//     setUpdatingDelivery(true);
//     try {
//       const res = await deliveryApi.updateStatus(delivery._id, { status });
//       setDelivery(res.data);
//       toast.success(`Delivery marked ${deliveryStatusLabel[status].toLowerCase()}`);
//       if (status === "delivered") onChanged();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setUpdatingDelivery(false);
//     }
//   };

//   const shareLiveLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           await deliveryApi.updateLocation(delivery._id, [pos.coords.longitude, pos.coords.latitude]);
//           toast.success("Location shared with customer");
//         } catch (err) {
//           toast.error(err.message);
//         }
//       },
//       () => toast.error("Couldn't access your location")
//     );
//   };

//   const nextDeliveryStep = delivery && deliveryStatusFlow[deliveryStatusFlow.indexOf(delivery.status) + 1];

//   return (
//     <Card className="p-4">
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className="truncate font-medium text-ink">{order.milkType?.name || "Milk product"}</p>
//           <p className="text-xs text-ink-faint">
//             {customerName} · Qty {order.quantity} · {SLOT_LABEL[order.deliverySlot]}
//           </p>
//           <p className="mt-1 text-xs text-ink-faint">Scheduled {formatDate(order.scheduledDate)}</p>
//         </div>
//         <div className="flex flex-none flex-col items-end gap-2">
//           <Badge className={style.className}>{style.label}</Badge>
//           <span className="font-mono text-sm font-semibold text-ink">{formatINR(order.totalPrice)}</span>
//         </div>
//       </div>

//       <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-3">
//         <label className="text-xs font-medium text-ink-soft">Status</label>
//         <select
//           className="rounded-lg border border-ink/12 bg-cream-card px-2.5 py-1.5 text-xs text-ink disabled:opacity-50"
//           value={order.status}
//           onChange={handleStatusChange}
//           disabled={updatingStatus}
//         >
//           {orderStatusOptions.map((s) => (
//             <option key={s} value={s}>
//               {s.replace("_", " ")}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={toggleExpand}
//           className="ml-auto flex items-center gap-1 text-xs font-medium text-dawn-dark hover:underline"
//         >
//           <Truck size={13} /> Delivery {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
//         </button>
//       </div>

//       {expanded && (
//         <div className="mt-3 border-t border-ink/8 pt-3">
//           {loadingDelivery ? (
//             <p className="text-xs text-ink-soft">Loading delivery info…</p>
//           ) : !delivery ? (
//             <div className="flex items-center justify-between gap-3">
//               <p className="text-xs text-ink-soft">
//                 No delivery yet — creating one auto-assigns the nearest available rider.
//               </p>
//               <Button size="sm" onClick={handleCreateDelivery} loading={creatingDelivery}>
//                 Create delivery
//               </Button>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs font-medium text-ink-soft">
//                   Current: <span className="text-ink">{deliveryStatusLabel[delivery.status]}</span>
//                 </span>
//                 {nextDeliveryStep && (
//                   <Button size="sm" onClick={() => advanceDelivery(nextDeliveryStep)} loading={updatingDelivery}>
//                     <Check size={13} /> Mark {deliveryStatusLabel[nextDeliveryStep].toLowerCase()}
//                   </Button>
//                 )}
//               </div>

//               {delivery.assignedRider && (
//                 <Badge
//                   className={
//                     delivery.riderConfirmed
//                       ? "self-start bg-leaf-light text-leaf"
//                       : "self-start bg-butter-light/60 text-butter-dark"
//                   }
//                 >
//                   {delivery.riderConfirmed ? "Rider confirmed" : "Awaiting rider confirmation"}
//                 </Badge>
//               )}

//               <div className="flex items-center gap-2">
//                 <UserCheck size={13} className="flex-none text-dawn-dark" />
//                 <select
//                   className="flex-1 rounded-lg border border-ink/12 bg-cream-card px-2.5 py-1.5 text-xs text-ink disabled:opacity-50"
//                   value={delivery.assignedRider?._id || delivery.assignedRider || ""}
//                   onChange={(e) => handleAssignRider(e.target.value)}
//                   disabled={assigningRider || riders.length === 0}
//                 >
//                   <option value="">
//                     {riders.length === 0 ? "No approved riders with a shared location nearby" : "Unassigned"}
//                   </option>
//                   {riders.map((r) => (
//                     <option key={r._id} value={r._id}>
//                       {r.username?.firstName} {r.username?.lastName || ""}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {delivery.status !== "delivered" && delivery.status !== "failed" && (
//                 <button
//                   onClick={shareLiveLocation}
//                   className="flex items-center gap-1.5 self-start text-xs font-medium text-dawn-dark hover:underline"
//                 >
//                   <MapPin size={13} /> Share my current location
//                 </button>
//               )}
//               {delivery.status !== "failed" && nextDeliveryStep && (
//                 <button
//                   onClick={() => advanceDelivery("failed")}
//                   className="self-start text-xs font-medium text-clay hover:underline"
//                 >
//                   Mark delivery failed
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </Card>
//   );
// }














import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Truck, MapPin, Check, UserCheck } from "lucide-react";
import { orderApi } from "../api/order.js";
import { deliveryApi } from "../api/delivery.js";
import { authApi } from "../api/auth.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { formatINR, formatDate, ORDER_STATUS_STYLE, SLOT_LABEL } from "../lib/utils.js";

const orderStatusOptions = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];

// Delivery status values use hyphens on the backend (picked-up, not
// picked_up) — matching the Delivery model's enum exactly.
const deliveryStatusFlow = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];
const deliveryStatusLabel = {
  pending: "Pending",
  assigned: "Assigned",
  "picked-up": "Picked up",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};

export default function OwnerOrderCard({ order, onChanged }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [delivery, setDelivery] = useState(undefined); // undefined = not loaded yet
  const [creatingDelivery, setCreatingDelivery] = useState(false);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);
  const [riders, setRiders] = useState([]);
  const [assigningRider, setAssigningRider] = useState(false);

  const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
  const customerName = order.userId?.username
    ? `${order.userId.username.firstName} ${order.userId.username.lastName || ""}`.trim()
    : "Customer";

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    if (status === order.status) return;
    if (status === "cancelled" && !window.confirm("Cancel this order?")) return;

    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(order._id, { status });
      toast.success(`Order marked ${status.replace("_", " ")}`);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const loadDelivery = () => {
    setLoadingDelivery(true);
    deliveryApi
      .byOrder(order._id)
      .then((res) => setDelivery(res.data))
      .catch(() => setDelivery(null))
      .finally(() => setLoadingDelivery(false));

    authApi
      .getRidersForDairy(order.dairy?._id || order.dairy)
      .then((res) => setRiders(res.data || []))
      .catch(() => setRiders([]));
  };

  const toggleExpand = () => {
    setExpanded((e) => !e);
    if (delivery === undefined) loadDelivery();
  };

  const handleAssignRider = async (riderId) => {
    if (!riderId) return;

    if (order.status === "cancelled") {
      toast.error("Cannot assign rider to a cancelled order");
      return;
    }

    setAssigningRider(true);
    try {
      const res = await deliveryApi.assignRider(delivery._id, riderId);
      setDelivery(res.data);
      toast.success("Rider assigned");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssigningRider(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (order.status === "cancelled") {
      toast.error("Cannot create delivery for a cancelled order");
      return;
    }

    setCreatingDelivery(true);
    try {
      const res = await deliveryApi.create({ orderId: order._id });
      setDelivery(res.data);
      toast.success("Delivery created");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingDelivery(false);
    }
  };

  const advanceDelivery = async (status) => {
    setUpdatingDelivery(true);
    try {
      const res = await deliveryApi.updateStatus(delivery._id, { status });
      setDelivery(res.data);
      toast.success(`Delivery marked ${deliveryStatusLabel[status].toLowerCase()}`);
      if (status === "delivered") onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const shareLiveLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await deliveryApi.updateLocation(delivery._id, [pos.coords.longitude, pos.coords.latitude]);
          toast.success("Location shared with customer");
        } catch (err) {
          toast.error(err.message);
        }
      },
      () => toast.error("Couldn't access your location")
    );
  };

  const nextDeliveryStep = delivery && deliveryStatusFlow[deliveryStatusFlow.indexOf(delivery.status) + 1];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{order.milkType?.name || "Milk product"}</p>
          <p className="text-xs text-ink-faint">
            {customerName} · Qty {order.quantity} · {SLOT_LABEL[order.deliverySlot]}
          </p>
          <p className="mt-1 text-xs text-ink-faint">Scheduled {formatDate(order.scheduledDate)}</p>
        </div>
        <div className="flex flex-none flex-col items-end gap-2">
          <Badge className={style.className}>{style.label}</Badge>
          <span className="font-mono text-sm font-semibold text-ink">{formatINR(order.totalPrice)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-3">
        <label className="text-xs font-medium text-ink-soft">Status</label>
        <select
          className="rounded-lg border border-ink/12 bg-cream-card px-2.5 py-1.5 text-xs text-ink disabled:opacity-50"
          value={order.status}
          onChange={handleStatusChange}
          disabled={updatingStatus}
        >
          {orderStatusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <button
          onClick={toggleExpand}
          className="ml-auto flex items-center gap-1 text-xs font-medium text-dawn-dark hover:underline"
        >
          <Truck size={13} /> Delivery {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-ink/8 pt-3">
          {loadingDelivery ? (
            <p className="text-xs text-ink-soft">Loading delivery info…</p>
          ) : !delivery ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-ink-soft">
                No delivery yet — creating one auto-assigns the nearest available rider.
              </p>  
              
              <Button size="sm" onClick={handleCreateDelivery} loading={creatingDelivery}>
                Create delivery
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-soft">
                  Current: <span className="text-ink">{deliveryStatusLabel[delivery.status]}</span>
                </span>
                {nextDeliveryStep && !["delivered", "failed"].includes(nextDeliveryStep) && (
                  <Button size="sm" onClick={() => advanceDelivery(nextDeliveryStep)} loading={updatingDelivery}>
                    <Check size={13} /> Mark {deliveryStatusLabel[nextDeliveryStep].toLowerCase()}
                  </Button>
                )}
              </div>

              {nextDeliveryStep && ["delivered", "failed"].includes(nextDeliveryStep) && (
                <p className="text-xs text-ink-faint">
                  Out for delivery — only the rider can mark this delivered or failed from here.
                </p>
              )}

              {delivery.assignedRider && (
                <Badge
                  className={
                    delivery.riderConfirmed
                      ? "self-start bg-leaf-light text-leaf"
                      : "self-start bg-butter-light/60 text-butter-dark"
                  }
                >
                  {delivery.riderConfirmed ? "Rider confirmed" : "Awaiting rider confirmation"}
                </Badge>
              )}
              
             
              <div className="flex items-center gap-2">
                <UserCheck size={13} className="flex-none text-dawn-dark" />
                <select
                  className="flex-1 rounded-lg border border-ink/12 bg-cream-card px-2.5 py-1.5 text-xs text-ink disabled:opacity-50"
                  value={delivery.assignedRider?._id || delivery.assignedRider || ""}
                  onChange={(e) => handleAssignRider(e.target.value)}
                  disabled={assigningRider || riders.length === 0 }
                >
                  <option value="">
                    {riders.length === 0 ? "No approved riders with a shared location nearby" : "Unassigned"}
                  </option>
                  {riders.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.username?.firstName} {r.username?.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>
              

              {delivery.status !== "delivered" && delivery.status !== "failed" && (
                <button
                  onClick={shareLiveLocation}
                  className="flex items-center gap-1.5 self-start text-xs font-medium text-dawn-dark hover:underline"
                >
                  <MapPin size={13} /> Share my current location
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}