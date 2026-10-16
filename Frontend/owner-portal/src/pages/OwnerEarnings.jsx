import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, TrendingUp, Clock3, Send, History, CheckCircle2, Store } from "lucide-react";
import { earningsApi } from "../api/earnings.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import EarningsTrend from "../components/earnings/EarningsTrend.jsx";
import { formatINR, formatDate } from "../lib/utils.js";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

const PAYOUT_STATUS_STYLE = {
  pending: { label: "Pending", className: "bg-butter-light/60 text-butter-dark" },
  processing: { label: "Processing", className: "bg-dawn-light/60 text-dawn-dark" },
  paid: { label: "Paid", className: "bg-leaf-light text-leaf" },
  rejected: { label: "Rejected", className: "bg-clay-light text-clay" },
};

export default function OwnerEarnings() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [form, setForm] = useState({ amount: "", method: "upi", payoutDetails: "" });
  const [requesting, setRequesting] = useState(false);

  const load = () => {
    setLoading(true);
    earningsApi
      .getMine(year)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const loadPayouts = () => {
    earningsApi
      .getMyPayouts()
      .then((res) => setPayouts(res.data || []))
      .catch(() => {});
  };

  useEffect(load, [year]);
  useEffect(loadPayouts, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setRequesting(true);
    try {
      await earningsApi.requestPayout({
        amount,
        method: form.method,
        payoutDetails: form.payoutDetails,
      });
      toast.success("Payout requested");
      setForm({ amount: "", method: "upi", payoutDetails: "" });
      load();
      loadPayouts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  if (!data.hasDairy) {
    return (
      <EmptyState
        icon={Store}
        title="Register your dairy to start earning"
        description="Once you register your dairy and start fulfilling orders, your earnings will show up here."
        to="/dairy"
        actionLabel="Register your dairy"
      />
    );
  }

  const statCards = [
    { label: "Net earnings (lifetime)", value: formatINR(data.netEarnings), icon: Wallet, color: "text-leaf bg-leaf-light" },
    { label: "Available to withdraw", value: formatINR(data.availableBalance), icon: Send, color: "text-dawn-dark bg-dawn-light/40" },
    { label: "This month", value: formatINR(data.thisMonthNet), icon: TrendingUp, color: "text-butter-dark bg-butter-light/40" },
    { label: "Last month", value: formatINR(data.lastMonthNet), icon: Clock3, color: "text-ink-soft bg-ink/6" },
  ];

  return (
    <div>
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-ink">
          <Wallet size={28} /> Earnings
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          You keep {(100 - data.commissionPercent).toFixed(0)}% of every delivered order — WishMilk's platform fee
          is {data.commissionPercent}%.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon size={16} />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-ink">Daily earnings trend</h2>
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
          <EarningsTrend data={data.dailyEarnings} />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          {data.deliveredOrders} delivered orders · {formatINR(data.grossRevenue)} gross revenue lifetime
        </p>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr,1.3fr]">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <Send size={17} /> Request a payout
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            Up to {formatINR(data.availableBalance)} available right now
            {data.pendingPayout > 0 && ` (${formatINR(data.pendingPayout)} already pending)`}.
          </p>
          <form onSubmit={handleRequestPayout} className="mt-4 flex flex-col gap-3">
            <Input
              label="Amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 500"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Payout method</span>
              <select
                className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                value={form.method}
                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              >
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </label>
            <Input
              label={form.method === "upi" ? "UPI ID" : "Bank account details"}
              placeholder={form.method === "upi" ? "yourname@upi" : "Account number, IFSC"}
              value={form.payoutDetails}
              onChange={(e) => setForm((f) => ({ ...f, payoutDetails: e.target.value }))}
            />
            <Button type="submit" loading={requesting} disabled={data.availableBalance <= 0}>
              Request payout
            </Button>
            {data.availableBalance <= 0 && (
              <p className="text-xs text-ink-faint">No balance available to withdraw yet.</p>
            )}
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <History size={17} /> Payout history
          </h2>
          {payouts.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No payout requests yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {payouts.map((p) => {
                const style = PAYOUT_STATUS_STYLE[p.status] || PAYOUT_STATUS_STYLE.pending;
                return (
                  <li
                    key={p._id}
                    className="flex items-start justify-between gap-3 border-b border-ink/6 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink">{formatINR(p.amount)}</p>
                      <p className="text-xs text-ink-faint">
                        {formatDate(p.createdAt)} · {p.method === "upi" ? "UPI" : "Bank transfer"}
                      </p>
                      {p.notes && <p className="mt-0.5 text-xs text-ink-faint">{p.notes}</p>}
                    </div>
                    <Badge className={style.className}>
                      {p.status === "paid" && <CheckCircle2 size={12} />} {style.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}