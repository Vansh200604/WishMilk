import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity as ActivityIcon, Truck, Flame, Calendar, Trophy, XCircle } from "lucide-react";
import { earningsApi } from "../api/earnings.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import OverviewDonut from "../components/activity/OverviewDonut.jsx";
import ActivityHeatmap from "../components/activity/ActivityHeatmap.jsx";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function RiderActivity() {
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

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-ink">
        <ActivityIcon size={28} /> Your activity
      </h1>
      <p className="mt-1 text-sm text-ink-soft">A look back at the deliveries you've completed.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr,1fr]">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Deliveries by milk type</h2>
          <div className="mt-4">
            <OverviewDonut breakdown={data.milkBreakdown} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Stats</h2>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
                <Truck size={16} />
              </span>
              <span className="flex-1 text-sm text-ink-soft">Completed deliveries (lifetime)</span>
              <span className="font-mono text-sm font-semibold text-ink">{data.totalDeliveries}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-clay-light text-clay">
                <XCircle size={16} />
              </span>
              <span className="flex-1 text-sm text-ink-soft">Failed deliveries</span>
              <span className="font-mono text-sm font-semibold text-ink">{data.failedDeliveries}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="grid sm:grid-cols-2">
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
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <Calendar size={17} /> {data.yearTotal} deliveries in {year}
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