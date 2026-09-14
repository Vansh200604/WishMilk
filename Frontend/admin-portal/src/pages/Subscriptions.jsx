import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Repeat } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, formatDate, cx } from "../lib/utils.js";

const statusTabs = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const statusStyle = {
  active: "bg-leaf-light text-leaf",
  paused: "bg-butter-light/60 text-butter-dark",
  cancelled: "bg-clay-light text-clay",
  completed: "bg-ink/8 text-ink-soft",
};

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi
      .getSubscriptions({ status: status || undefined })
      .then((res) => {
        setSubs(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Subscriptions</h1>
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
        ) : subs.length === 0 ? (
          <EmptyState icon={Repeat} title="No subscriptions match this filter" />
        ) : (
          <div className="flex flex-col gap-2">
            {subs.map((sub, i) => (
              <Card
                key={sub._id}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} flex items-center justify-between gap-3 p-4`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {sub.milkType?.name} · {sub.dairy?.name}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {sub.user?.username?.firstName} {sub.user?.username?.lastName || ""} · {sub.user?.email}
                  </p>
                  <p className="text-xs text-ink-faint capitalize">
                    {sub.plan} · next {formatDate(sub.nextDeliveryDate)}
                  </p>
                </div>
                <div className="flex flex-none flex-col items-end gap-1.5">
                  <Badge className={statusStyle[sub.status]}>{sub.status}</Badge>
                  <span className="font-mono text-sm font-semibold text-ink">
                    {formatINR(sub.pricePerDelivery)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}