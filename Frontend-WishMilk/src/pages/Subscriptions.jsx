import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Repeat, Pause, Play, X } from "lucide-react";
import { subscriptionApi } from "../api/subscription.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, formatDate, SLOT_LABEL, cx } from "../lib/utils.js";

const statusStyle = {
  active: "bg-leaf-light text-leaf",
  paused: "bg-butter-light/60 text-butter-dark",
  cancelled: "bg-clay-light text-clay",
  completed: "bg-ink/8 text-ink-soft",
};

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    subscriptionApi
      .myList()
      .then((res) => setSubs(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePause = async (id) => {
    setBusyId(id);
    try {
      await subscriptionApi.pause(id);
      toast.success("Subscription paused");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const handleResume = async (id) => {
    setBusyId(id);
    try {
      await subscriptionApi.resume(id);
      toast.success("Subscription resumed");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this subscription? This can't be undone.")) return;
    setBusyId(id);
    try {
      await subscriptionApi.cancel(id);
      toast.success("Subscription cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Subscriptions</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Deliveries are generated automatically every day these are active — no need to order manually.
      </p>

      <div className="mt-6">
        {subs.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions yet"
            description="Subscribe to a milk product from any dairy page for daily delivery."
            to="/dairies"
            actionLabel="Browse dairies"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {subs.map((sub) => (
              <Card key={sub._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{sub.milkType?.name}</p>
                    <p className="text-xs text-ink-faint">
                      {sub.dairy?.name} · Qty {sub.quantity} · {SLOT_LABEL[sub.deliverySlot]}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint capitalize">
                      {sub.plan} · {formatINR(sub.pricePerDelivery)} / delivery
                    </p>
                  </div>
                  <Badge className={statusStyle[sub.status]}>{sub.status}</Badge>
                </div>

                {sub.status === "active" && (
                  <p className="mt-2 text-xs text-ink-faint">
                    Next delivery {formatDate(sub.nextDeliveryDate)}
                  </p>
                )}

                {["active", "paused"].includes(sub.status) && (
                  <div className="mt-3 flex gap-2 border-t border-ink/8 pt-3">
                    {sub.status === "active" ? (
                      <Button variant="outline" size="sm" onClick={() => handlePause(sub._id)} loading={busyId === sub._id}>
                        <Pause size={13} /> Pause
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleResume(sub._id)} loading={busyId === sub._id}>
                        <Play size={13} /> Resume
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-clay hover:bg-clay-light"
                      onClick={() => handleCancel(sub._id)}
                      loading={busyId === sub._id}
                    >
                      <X size={13} /> Cancel
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}