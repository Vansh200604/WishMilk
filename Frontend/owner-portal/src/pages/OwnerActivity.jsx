import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity as ActivityIcon, ShoppingBasket, Flame, Calendar, Trophy, Store } from "lucide-react";
import { earningsApi } from "../api/earnings.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import OverviewDonut from "../components/activity/OverviewDonut.jsx";
import ActivityHeatmap from "../components/activity/ActivityHeatmap.jsx";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function OwnerActivity() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    earningsApi
      .getActivity(year)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  if (!data.hasDairy) {
    return (
      <EmptyState
        icon={Store}
        title="Register your dairy to see activity"
        description="Once you register your dairy and start fulfilling orders, your activity calendar will show up here."
        to="/dairy"
        actionLabel="Register your dairy"
      />
    );
  }

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-ink">
        <ActivityIcon size={28} /> Dairy activity
      </h1>
      <p className="mt-1 text-sm text-ink-soft">A look back at the orders your dairy has fulfilled.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr,1fr]">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Orders by milk type</h2>
          <div className="mt-4">
            <OverviewDonut breakdown={data.milkBreakdown} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Stats</h2>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
                <ShoppingBasket size={16} />
              </span>
              <span className="flex-1 text-sm text-ink-soft">Delivered orders (lifetime)</span>
              <span className="font-mono text-sm font-semibold text-ink">{data.totalOrders}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="grid sm:grid-cols-2">
          <div className="bg-gradient-to-br from-butter to-clay p-5 text-ink-fixed sm:col-span-1">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Flame size={16} /> Fulfillment streak
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
        </div>
      </Card>

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