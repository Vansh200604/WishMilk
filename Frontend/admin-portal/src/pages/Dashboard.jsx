import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Store, ClipboardList, Repeat, UserCheck, Truck, Wallet, CheckCircle2 } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { formatINR } from "../lib/utils.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const cards = [
    { label: "Customers", value: stats.totalUsers, icon: Users, color: "text-dawn-dark bg-dawn-light/40" },
    { label: "Dairy owners", value: stats.totalDairyOwners, icon: Store, color: "text-butter-dark bg-butter-light/40" },
    { label: "Riders", value: stats.totalRiders, icon: Truck, color: "text-leaf bg-leaf-light" },
    { label: "Pending rider approvals", value: stats.pendingRiders, icon: UserCheck, color: "text-clay bg-clay-light" },
    { label: "Total dairies", value: stats.totalDairies, icon: Store, color: "text-dawn-dark bg-dawn-light/40" },
    { label: "Active dairies", value: stats.activeDairies, icon: CheckCircle2, color: "text-leaf bg-leaf-light" },
    { label: "Total orders", value: stats.totalOrders, icon: ClipboardList, color: "text-butter-dark bg-butter-light/40" },
    { label: "Active subscriptions", value: stats.activeSubscriptions, icon: Repeat, color: "text-dawn-dark bg-dawn-light/40" },
  ];

  return (
    <div>
      <h1 className="animate-fade-in-up font-display text-2xl font-semibold text-ink sm:text-3xl">
        Platform overview
      </h1>

      <Card className="animate-fade-in-up stagger-1 mt-6 overflow-hidden">
        <div className="bg-ink px-6 py-7 text-cream">
          <p className="flex items-center gap-2 text-sm text-cream/70">
            <Wallet size={16} /> Total revenue (paid orders)
          </p>
          <p className="mt-2 animate-count-pulse font-mono text-3xl font-semibold sm:text-4xl">
            {formatINR(stats.totalRevenue)}
          </p>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }, i) => (
          <Card
            key={label}
            className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} p-4 transition-transform duration-200 hover:-translate-y-0.5`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon size={17} />
            </span>
            <p className="mt-3 font-mono text-2xl font-semibold text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}