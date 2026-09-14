import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, formatDate, ORDER_STATUS_STYLE, cx } from "../lib/utils.js";

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi
      .getOrders({ status: status || undefined })
      .then((res) => {
        setOrders(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-ink-soft">{total} total, platform-wide</p>
      </div>

      <div className="mt-4 flex animate-fade-in-up stagger-1 gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={cx(
              "flex-none rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              status === t.value
                ? "border-butter bg-butter-light/50 text-butter-dark"
                : "border-ink/12 text-ink-soft hover:border-ink/20"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders match this filter" />
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order, i) => {
              const style = ORDER_STATUS_STYLE[order.status] || ORDER_STATUS_STYLE.pending;
              return (
                <Card
                  key={order._id}
                  className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} flex items-center justify-between gap-3 p-4`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {order.milkType?.name} · {order.dairy?.name}
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      {order.userId?.username?.firstName} {order.userId?.username?.lastName || ""} ·{" "}
                      {order.userId?.email}
                    </p>
                    <p className="text-xs text-ink-faint">{formatDate(order.scheduledDate)}</p>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <Badge className={style.className}>{style.label}</Badge>
                    <span className="font-mono text-sm font-semibold text-ink">
                      {formatINR(order.totalPrice)}
                    </span>
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