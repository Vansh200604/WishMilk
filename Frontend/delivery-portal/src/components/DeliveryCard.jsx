import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Check, X, Milk, ThumbsUp, ThumbsDown } from "lucide-react";
import { deliveryApi } from "../api/delivery.js";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
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

export default function DeliveryCard({ delivery, onChanged }) {
  const [updating, setUpdating] = useState(false);
  const [responding, setResponding] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  const order = delivery.order || {};
  const nextStep = deliveryStatusFlow[deliveryStatusFlow.indexOf(delivery.status) + 1];
  const isDone = delivery.status === "delivered" || delivery.status === "failed";
  const needsResponse = !delivery.riderConfirmed && !isDone;

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

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await deliveryApi.updateLocation(delivery._id, [pos.coords.longitude, pos.coords.latitude]);
          toast.success("Location shared");
        } catch (err) {
          toast.error(err.message);
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        toast.error("Couldn't access your location");
        setSharingLocation(false);
      }
    );
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
          <div className="mt-3 flex flex-wrap gap-2">
            {nextStep && nextStep !== "failed" && (
              <Button size="sm" onClick={() => advance(nextStep)} loading={updating}>
                <Check size={14} /> Mark {deliveryStatusLabel[nextStep].toLowerCase()}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={shareLocation} loading={sharingLocation}>
              <MapPin size={14} /> Share my location
            </Button>
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
        )
      )}
    </Card>
  );
}