import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity as ActivityIcon,
  Code2,
  ShoppingBasket,
  Star,
  Wallet,
  Repeat,
  Flame,
  Calendar,
  Trophy,
} from "lucide-react";
import { orderApi } from "../api/order.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import OverviewDonut from "../components/activity/OverviewDonut.jsx";
import ActivityHeatmap from "../components/activity/ActivityHeatmap.jsx";
import { formatINR } from "../lib/utils.js";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function Activity() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderApi
      .getActivity(year)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  const statCards = [
    { label: "Total orders", value: data.totalOrders, icon: ShoppingBasket, color: "text-dawn-dark bg-dawn-light/40" },
    { label: "Total spent", value: formatINR(data.totalSpent), icon: Wallet, color: "text-butter-dark bg-butter-light/40" },
    { label: "Loyalty points", value: data.loyaltyPoints, icon: Trophy, color: "text-leaf bg-leaf-light" },
    { label: "Subscription deliveries", value: data.subscriptionDeliveries, icon: Repeat, color: "text-dawn-dark bg-dawn-light/40" },
    { label: "Reviews written", value: data.reviewsWritten, icon: Star, color: "text-butter-dark bg-butter-light/40" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-ink">
        <ActivityIcon size={28} /> Your activity
      </h1>
      <p className="mt-1 text-sm text-ink-soft">A look back at your deliveries, habits, and savings.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr,1fr]">
        {/* Overview donut */}
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Orders by milk type</h2>
          <div className="mt-4">
            <OverviewDonut breakdown={data.milkBreakdown} />
          </div>
        </Card>

        {/* Stat list */}
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Stats</h2>
          <div className="mt-4 flex flex-col gap-3">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${color}`}>
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-sm text-ink-soft">{label}</span>
                <span className="font-mono text-sm font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Streak card */}
      <Card className="mt-5 overflow-hidden">
        <div className="grid sm:grid-cols-3">
          <div className="bg-gradient-to-br from-butter to-clay p-5 text-ink-fixed sm:col-span-1">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Flame size={16} /> Delivery streak
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold">{data.currentStreak} days</p>
          </div>
          <div className="flex items-center gap-3 p-5 sm:col-span-1">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
              <Trophy size={16} />
            </span>
            <div>
              <p className="text-xs text-ink-faint">Longest streak</p>
              <p className="font-mono text-lg font-semibold text-ink">{data.longestStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-5 sm:col-span-1">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-leaf-light text-leaf">
              <Code2 size={16} />
            </span>
            <div>
              <p className="text-xs text-ink-faint">{year} activity</p>
              <p className="font-mono text-lg font-semibold text-ink">{data.yearTotal} orders</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar heatmap */}
      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <Calendar size={17} /> {data.yearTotal} orders in {year}
          </h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-ink/12 bg-cream-card px-3 py-1.5 text-sm text-ink"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <ActivityHeatmap year={year} dailyActivity={data.dailyActivity} />
        </div>
      </Card>
    </div>
  );
}