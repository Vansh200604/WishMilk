import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Package, ChevronRight, X } from "lucide-react";
import { orderApi } from "../api/order.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { formatINR, formatDate, ORDER_STATUS_STYLE, SLOT_LABEL, cx } from "../lib/utils.js";

const statusTabs = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    orderApi
      .myOrders(status ? { status } : {})
      .then((res) => setOrders(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await orderApi.cancel(id, "Cancelled by user");
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">My orders</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={cx(
              "flex-none rounded-full border px-3.5 py-1.5 text-xs font-medium",
              status === t.value
                ? "border-butter bg-butter-light/50 text-butter-dark"
                : "border-ink/12 text-ink-soft"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders here yet"
            description="Once you place an order, it'll show up here with live status."
            to="/dairies"
            actionLabel="Browse dairies"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
              return (
                <Card key={order._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/orders/${order._id}`} className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {order.milkType?.name || "Milk product"}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {order.dairy?.name} · Qty {order.quantity} · {SLOT_LABEL[order.deliverySlot]}
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        Scheduled {formatDate(order.scheduledDate)}
                      </p>
                    </Link>
                    <div className="flex flex-none flex-col items-end gap-2">
                      <Badge className={style.className}>{style.label}</Badge>
                      <span className="font-mono text-sm font-semibold text-ink">
                        {formatINR(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex items-center gap-1 text-xs font-medium text-dawn-dark hover:underline"
                    >
                      View details <ChevronRight size={13} />
                    </Link>
                    {["pending", "confirmed"].includes(order.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-clay hover:bg-clay-light"
                        onClick={() => handleCancel(order._id)}
                        loading={cancellingId === order._id}
                      >
                        <X size={13} /> Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}