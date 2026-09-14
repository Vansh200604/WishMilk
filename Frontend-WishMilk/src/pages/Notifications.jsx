import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { notificationApi } from "../api/notification.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatDate, cx } from "../lib/utils.js";

const typeStyle = {
  order: "bg-dawn-light/50 text-dawn-dark",
  subscription: "bg-butter-light/50 text-butter-dark",
  payment: "bg-leaf-light text-leaf",
  delivery: "bg-dawn-light/50 text-dawn-dark",
  promo: "bg-butter-light/50 text-butter-dark",
  system: "bg-ink/8 text-ink-soft",
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    setLoading(true);
    notificationApi
      .list()
      .then((res) => setItems(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, status: "read" } : n)));
    try {
      await notificationApi.markRead(id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, status: "read" })));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    const prev = items;
    setItems((p) => p.filter((n) => n._id !== id));
    try {
      await notificationApi.remove(id);
    } catch (err) {
      toast.error(err.message);
      setItems(prev);
    }
  };

  const unreadCount = items.filter((n) => n.status !== "read").length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} loading={markingAll}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="New order and delivery updates will show up here." />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((n) => (
              <Card
                key={n._id}
                className={cx("flex items-start gap-3 p-4", n.status !== "read" && "border-butter/40")}
              >
                <span className={cx("mt-0.5 flex-none rounded-full px-2 py-1 text-[10px] font-semibold capitalize", typeStyle[n.type])}>
                  {n.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-faint">{formatDate(n.createdAt)}</p>
                </div>
                <div className="flex flex-none flex-col gap-1">
                  {n.status !== "read" && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-leaf-light hover:text-leaf"
                      aria-label="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-clay-light hover:text-clay"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}