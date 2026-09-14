/*

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Phone, Truck, Check, X } from "lucide-react";
import { orderApi } from "../api/order.js";
import { deliveryApi } from "../api/delivery.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Input from "../components/ui/Input.jsx";
import {
  formatINR,
  formatDate,
  ORDER_STATUS_STYLE,
  SLOT_LABEL,
  cx,
} from "../lib/utils.js";

const timelineLabel = {
  pending: "Order received",
  assigned: "Delivery assigned",
  "picked-up": "Picked up from dairy",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  failed: "Delivery failed",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [form, setForm] = useState({ deliverySlot: "morning", scheduledDate: "" });

  const load = () => {
    setLoading(true);
    orderApi
      .getById(id)
      .then((res) => {
        setOrder(res.data);
        setForm({
          deliverySlot: res.data.deliverySlot,
          scheduledDate: new Date(res.data.scheduledDate).toISOString().split("T")[0],
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

    deliveryApi
      .byOrder(id)
      .then((res) => setDelivery(res.data))
      .catch(() => setDelivery(null));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderApi.cancel(id, "Cancelled by user");
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduling(true);
    try {
      await orderApi.reschedule(id, form);
      toast.success("Order rescheduled");
      setShowReschedule(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-ink-soft">
        Order not found. <Link to="/orders" className="text-dawn-dark hover:underline">Back to orders</Link>
      </div>
    );
  }

  const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
  const canModify = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/orders" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {order.milkType?.name || "Milk order"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Order #{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <Badge className={style.className}>{style.label}</Badge>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Order details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2.5 text-sm">
          <dt className="text-ink-faint">Dairy</dt>
          <dd className="text-right text-ink">{order.dairy?.name}</dd>
          <dt className="text-ink-faint">Quantity</dt>
          <dd className="text-right text-ink">
            {order.quantity} {order.milkType?.unit}
          </dd>
          <dt className="text-ink-faint">Delivery slot</dt>
          <dd className="text-right text-ink">{SLOT_LABEL[order.deliverySlot]}</dd>
          <dt className="text-ink-faint">Scheduled date</dt>
          <dd className="text-right text-ink">{formatDate(order.scheduledDate)}</dd>
          <dt className="text-ink-faint">Delivery address</dt>
          <dd className="text-right text-ink">{order.deliveryAddress?.fullAddress}</dd>
          <dt className="text-ink-faint">Payment status</dt>
          <dd className="text-right capitalize text-ink">{order.paymentStatus}</dd>
          <dt className="mt-1 font-medium text-ink">Total</dt>
          <dd className="mt-1 text-right font-mono text-base font-semibold text-ink">
            {formatINR(order.totalPrice)}
          </dd>
        </dl>
      </Card>

      {order.dairy?.phone && (
        <Card className="mt-4 p-5">
          <h2 className="font-display text-base font-semibold text-ink">Dairy contact</h2>
          <a
            href={`tel:${order.dairy.phone}`}
            className="mt-2 flex items-center gap-2 text-sm text-dawn-dark hover:underline"
          >
            <Phone size={14} /> {order.dairy.phone}
          </a>
        </Card>
      )}

      <Card className="mt-4 p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Truck size={17} /> Delivery tracking
        </h2>
        {!delivery ? (
          <p className="mt-2 text-sm text-ink-soft">
            Tracking will appear here once the dairy assigns your delivery.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-4">
            {(delivery.timeLine || []).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-leaf-light text-leaf">
                  <Check size={13} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    {timelineLabel[step.status] || step.status}
                  </p>
                  {step.message && <p className="text-xs text-ink-faint">{step.message}</p>}
                  <p className="text-xs text-ink-faint">{formatDate(step.timestamp)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {canModify && (
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Manage order</h2>
            <button
              onClick={() => setShowReschedule((s) => !s)}
              className="text-sm font-medium text-dawn-dark hover:underline"
            >
              {showReschedule ? "Cancel edit" : "Reschedule"}
            </button>
          </div>

          {showReschedule && (
            <form onSubmit={handleReschedule} className="mt-4 flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">Slot</span>
                  <select
                    className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                    value={form.deliverySlot}
                    onChange={(e) => setForm((f) => ({ ...f, deliverySlot: e.target.value }))}
                  >
                    {Object.entries(SLOT_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Date"
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <Button type="submit" size="sm" loading={rescheduling} className="self-start">
                Save changes
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-clay hover:bg-clay-light"
            onClick={handleCancel}
            loading={cancelling}
          >
            <X size={14} /> Cancel order
          </Button>
        </Card>
      )}
    </div>
  );
}

*/



import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Phone, Truck, Check, X, RefreshCw } from "lucide-react";
import { orderApi } from "../api/order.js";
import { deliveryApi } from "../api/delivery.js";
import { paymentApi } from "../api/payment.js";
import { payWithRazorpay } from "../lib/razorpay.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Input from "../components/ui/Input.jsx";
import {
  formatINR,
  formatDate,
  ORDER_STATUS_STYLE,
  SLOT_LABEL,
  cx,
} from "../lib/utils.js";

const timelineLabel = {
  pending: "Order received",
  assigned: "Delivery assigned",
  "picked-up": "Picked up from dairy",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  failed: "Delivery failed",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [form, setForm] = useState({ deliverySlot: "morning", scheduledDate: "" });

  const load = () => {
    setLoading(true);
    orderApi
      .getById(id)
      .then((res) => {
        setOrder(res.data);
        setForm({
          deliverySlot: res.data.deliverySlot,
          scheduledDate: new Date(res.data.scheduledDate).toISOString().split("T")[0],
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

    deliveryApi
      .byOrder(id)
      .then((res) => setDelivery(res.data))
      .catch(() => setDelivery(null));

    paymentApi
      .getByOrder(id)
      .then((res) => setPayment(res.data))
      .catch(() => setPayment(null));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderApi.cancel(id, "Cancelled by user");
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduling(true);
    try {
      await orderApi.reschedule(id, form);
      toast.success("Order rescheduled");
      setShowReschedule(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRescheduling(false);
    }
  };

  // Only offered when there's an actual online-payment attempt that hasn't
  // succeeded yet — cash-on-delivery orders never show this. The backend
  // reuses the same Razorpay order behind the scenes, so this is safe to
  // click more than once if an earlier attempt was cancelled or failed.
  const canRetryPayment =
    payment && payment.paymentMethod !== "cash_on_delivery" && payment.paymentStatus !== "paid";

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      const payRes = await paymentApi.createOrder({
        orderId: id,
        paymentMethod: payment.paymentMethod || "upi",
      });
      await payWithRazorpay(payRes.data);
      toast.success("Payment successful — order confirmed!");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-ink-soft">
        Order not found. <Link to="/orders" className="text-dawn-dark hover:underline">Back to orders</Link>
      </div>
    );
  }

  const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
  const canModify = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/orders" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {order.milkType?.name || "Milk order"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Order #{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <Badge className={style.className}>{style.label}</Badge>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Order details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2.5 text-sm">
          <dt className="text-ink-faint">Dairy</dt>
          <dd className="text-right text-ink">{order.dairy?.name}</dd>
          <dt className="text-ink-faint">Quantity</dt>
          <dd className="text-right text-ink">
            {order.quantity} {order.milkType?.unit}
          </dd>
          <dt className="text-ink-faint">Delivery slot</dt>
          <dd className="text-right text-ink">{SLOT_LABEL[order.deliverySlot]}</dd>
          <dt className="text-ink-faint">Scheduled date</dt>
          <dd className="text-right text-ink">{formatDate(order.scheduledDate)}</dd>
          <dt className="text-ink-faint">Delivery address</dt>
          <dd className="text-right text-ink">{order.deliveryAddress?.fullAddress}</dd>
          <dt className="text-ink-faint">Payment status</dt>
          <dd className="text-right capitalize text-ink">{order.paymentStatus}</dd>
          <dt className="mt-1 font-medium text-ink">Total</dt>
          <dd className="mt-1 text-right font-mono text-base font-semibold text-ink">
            {formatINR(order.totalPrice)}
          </dd>
        </dl>
      </Card>

      {canRetryPayment && (
        <Card className="mt-4 flex items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-medium text-ink">Payment incomplete</p>
            <p className="text-xs text-ink-faint">
              {payment.paymentStatus === "failed"
                ? "Your last attempt didn't go through."
                : "You didn't finish paying for this order."}{" "}
              Your order is still saved.
            </p>
          </div>
          <Button size="sm" onClick={handleRetryPayment} loading={retrying}>
            <RefreshCw size={14} /> Retry payment
          </Button>
        </Card>
      )}

      {order.dairy?.phone && (
        <Card className="mt-4 p-5">
          <h2 className="font-display text-base font-semibold text-ink">Dairy contact</h2>
          <a
            href={`tel:${order.dairy.phone}`}
            className="mt-2 flex items-center gap-2 text-sm text-dawn-dark hover:underline"
          >
            <Phone size={14} /> {order.dairy.phone}
          </a>
        </Card>
      )}

      <Card className="mt-4 p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Truck size={17} /> Delivery tracking
        </h2>
        {!delivery ? (
          <p className="mt-2 text-sm text-ink-soft">
            Tracking will appear here once the dairy assigns your delivery.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-4">
            {(delivery.timeLine || []).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-leaf-light text-leaf">
                  <Check size={13} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    {timelineLabel[step.status] || step.status}
                  </p>
                  {step.message && <p className="text-xs text-ink-faint">{step.message}</p>}
                  <p className="text-xs text-ink-faint">{formatDate(step.timestamp)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {canModify && (
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Manage order</h2>
            <button
              onClick={() => setShowReschedule((s) => !s)}
              className="text-sm font-medium text-dawn-dark hover:underline"
            >
              {showReschedule ? "Cancel edit" : "Reschedule"}
            </button>
          </div>

          {showReschedule && (
            <form onSubmit={handleReschedule} className="mt-4 flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">Slot</span>
                  <select
                    className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                    value={form.deliverySlot}
                    onChange={(e) => setForm((f) => ({ ...f, deliverySlot: e.target.value }))}
                  >
                    {Object.entries(SLOT_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Date"
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <Button type="submit" size="sm" loading={rescheduling} className="self-start">
                Save changes
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-clay hover:bg-clay-light"
            onClick={handleCancel}
            loading={cancelling}
          >
            <X size={14} /> Cancel order
          </Button>
        </Card>
      )}
    </div>
  );
}