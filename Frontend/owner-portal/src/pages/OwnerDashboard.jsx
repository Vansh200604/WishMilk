import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store, PackageSearch, ClipboardList, ArrowRight, Star, Power } from "lucide-react";
import toast from "react-hot-toast";
import { useMyDairy } from "../hooks/useMyDairy.js";
import { dairyApi } from "../api/dairy.js";
import { orderApi } from "../api/order.js";
import { milkApi } from "../api/milk.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function OwnerDashboard() {
  const { dairy, setDairy, loading } = useMyDairy();
  const [pendingCount, setPendingCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    if (!dairy) return;
    orderApi
      .byDairy(dairy._id, { status: "pending" })
      .then((res) => setPendingCount(res.total ?? res.count ?? 0))
      .catch(() => setPendingCount(null));
    milkApi
      .byDairy(dairy._id)
      .then((res) => setProductCount((res.data || []).length))
      .catch(() => setProductCount(null));
  }, [dairy]);

  const handleToggleStatus = async () => {
    setTogglingStatus(true);
    try {
      const res = await dairyApi.toggleStatus(dairy._id);
      setDairy(res.data);
      toast.success(`Dairy is now ${res.data.isActive ? "active" : "inactive"}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) return <Spinner />;

  if (!dairy) {
    return (
      <EmptyState
        icon={Store}
        title="Register your dairy to get started"
        description="Once registered, you can list milk products, set pricing, and start receiving orders."
        to="/dairy"
        actionLabel="Register your dairy"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{dairy.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Star size={14} className="text-butter-dark" fill="currentColor" />
            {dairy.rating?.toFixed?.(1) ?? "New"} rating
          </p>
        </div>
        <Button
          className="flex items-center gap-1.5 bg-red-500 transition-transform hover:scale-105 active:scale-95 hover:bg-red-400"
          variant={dairy.isActive ? "outline" : "primary"}
          size="sm"
          onClick={handleToggleStatus}
          loading={togglingStatus}
        >
          <Power size={14}/> {dairy.isActive ? "Set inactive" : "Set active"}
        </Button>
      </div>

      {!dairy.isActive && (
        <Card className="mt-4 border-clay/30 bg-clay-light/40 p-4 text-sm text-clay">
          Your dairy is inactive — customers can't find or order from it right now.
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Pending orders</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{pendingCount ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Milk products</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{productCount ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">
            {dairy.isActive ? "Active" : "Inactive"}
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link to="/dairy">
          <Card className="flex items-center gap-3 p-4 hover:border-butter/40">
            <Store size={18} className="text-dawn-dark" />
            <span className="flex-1 text-sm font-medium text-ink">Edit dairy profile</span>
            <ArrowRight size={15} className="text-ink-faint" />
          </Card>
        </Link>
        <Link to="/milk">
          <Card className="flex items-center gap-3 p-4 hover:border-butter/40">
            <PackageSearch size={18} className="text-dawn-dark" />
            <span className="flex-1 text-sm font-medium text-ink">Manage milk products</span>
            <ArrowRight size={15} className="text-ink-faint" />
          </Card>
        </Link>
        <Link to="/orders">
          <Card className="flex items-center gap-3 p-4 hover:border-butter/40">
            <ClipboardList size={18} className="text-dawn-dark" />
            <span className="flex-1 text-sm font-medium text-ink">View orders</span>
            <ArrowRight size={15} className="text-ink-faint" />
          </Card>
        </Link>
      </div>
    </div>
  );
}