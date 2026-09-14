import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";
import { useMyDairy } from "../hooks/useMyDairy.js";
import { orderApi } from "../api/order.js";
import OwnerOrderCard from "../components/OwnerOrderCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { cx } from "../lib/utils.js";

const statusTabs = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OwnerOrders() {
  const { dairy, loading: loadingDairy } = useMyDairy();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadOrders = (dairyId) => {
    setLoading(true);
    orderApi
      .byDairy(dairyId, status ? { status } : {})
      .then((res) => setOrders(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (dairy) loadOrders(dairy._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dairy, status]);

  if (loadingDairy) return <Spinner />;

  if (!dairy) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Register your dairy first"
        description="Orders will show up here once customers can find your dairy."
        to="/dairy"
        actionLabel="Register your dairy"
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

      <div className="mt-5">
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders here" description="Nothing matches this filter yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OwnerOrderCard key={order._id} order={order} onChanged={() => loadOrders(dairy._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}