import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity as ActivityIcon, Flame, Calendar, Trophy, Users, Store, Truck, XCircle, PackageCheck } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import OverviewDonut from "../components/activity/OverviewDonut.jsx";
import ActivityHeatmap from "../components/activity/ActivityHeatmap.jsx";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function AdminActivity() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getActivity(year)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  const stats = [
    { label: "Delivered orders (lifetime)", value: data.totalOrders, icon: PackageCheck, color: "bg-leaf-light text-leaf" },
    { label: "Customers who ordered", value: data.activeCustomers, icon: Users, color: "bg-dawn-light/40 text-dawn-dark" },
    { label: "Dairies fulfilling orders", value: data.activeDairies, icon: Store, color: "bg-butter-light/40 text-butter-dark" },
    { label: "Riders delivering", value: data.activeRiders, icon: Truck, color: "bg-dawn-light/40 text-dawn-dark" },
    { label: "Cancelled orders", value: data.cancelledOrders, icon: XCircle, color: "bg-clay-light text-clay" },
  ];

  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
          <ActivityIcon size={26} /> Platform activity
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Delivered orders across every dairy on WishMilk.</p>
      </div>

      <div className="mt-6 grid animate-fade-in-up stagger-1 gap-5 lg:grid-cols-[1.2fr,1fr]">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Orders by milk type</h2>
          <div className="mt-4">
            <OverviewDonut breakdown={data.milkBreakdown} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Platform stats</h2>
          <div className="mt-4 flex flex-col gap-3">
            {stats.map(({ label, value, icon: Icon, color }) => (
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

      <Card className="mt-5 animate-fade-in-up stagger-2 overflow-hidden">
        <div className="grid sm:grid-cols-2">
          <div className="bg-gradient-to-br from-butter to-clay p-5 text-ink-fixed">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Flame size={16} /> Delivery streak
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold">{data.currentStreak} days</p>
            <p className="mt-1 text-xs opacity-80">Consecutive days with at least one delivery</p>
          </div>
          <div className="flex items-center gap-3 p-5">
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

      <Card className="mt-5 animate-fade-in-up stagger-3 p-5">
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