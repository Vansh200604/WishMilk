import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, Percent, Store, Truck, Landmark, CheckCircle2, Inbox } from "lucide-react";
import { earningsApi } from "../api/earnings.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MonthlyChart from "../components/earnings/MonthlyChart.jsx";
import { formatINR, formatDate, cx } from "../lib/utils.js";

const PAYOUT_STATUS_STYLE = {
  pending: { label: "Pending", className: "bg-butter-light/60 text-butter-dark" },
  processing: { label: "Processing", className: "bg-dawn-light/60 text-dawn-dark" },
  paid: { label: "Paid", className: "bg-leaf-light text-leaf" },
  rejected: { label: "Rejected", className: "bg-clay-light text-clay" },
};

const statusTabs = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

const roleTabs = [
  { value: "", label: "Everyone" },
  { value: "dairyOwner", label: "Dairy owners" },
  { value: "deliveryPerson", label: "Riders" },
];

const ROLE_LABEL = { dairyOwner: "Dairy owner", deliveryPerson: "Rider" };

const ACTION_LABEL = { processing: "Mark processing", paid: "Mark as paid", rejected: "Reject" };

const fullName = (u) =>
  [u?.username?.firstName, u?.username?.lastName].filter(Boolean).join(" ") || u?.email || "Unknown user";

export default function AdminEarnings() {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [status, setStatus] = useState("pending");
  const [role, setRole] = useState("");
  // { id, status } while the admin is confirming an action on a payout row
  const [action, setAction] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSummary = () => {
    setLoadingSummary(true);
    earningsApi
      .getPlatform()
      .then((res) => setSummary(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingSummary(false));
  };

  const loadPayouts = () => {
    setLoadingPayouts(true);
    earningsApi
      .getPayouts({ status: status || undefined, role: role || undefined })
      .then((res) => setPayouts(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingPayouts(false));
  };

  useEffect(loadSummary, []);
  useEffect(loadPayouts, [status, role]);

  const startAction = (id, nextStatus) => {
    setAction({ id, status: nextStatus });
    setNote("");
  };

  const confirmAction = async () => {
    if (action.status === "rejected" && !note.trim()) {
      toast.error("Add a short reason so the user knows why");
      return;
    }
    setSaving(true);
    try {
      await earningsApi.updatePayout(action.id, { status: action.status, notes: note.trim() || undefined });
      toast.success(`Payout ${action.status === "paid" ? "marked as paid" : action.status}`);
      setAction(null);
      loadPayouts();
      loadSummary();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingSummary && !summary) return <Spinner />;
  if (!summary) return null;

  const stats = [
    { label: "Platform commission", value: formatINR(summary.platformCommission), icon: Percent, color: "text-leaf bg-leaf-light", hint: `${summary.commissionPercent}% of delivered orders` },
    { label: "Gross order value", value: formatINR(summary.grossRevenue), icon: Wallet, color: "text-butter-dark bg-butter-light/40", hint: `${summary.deliveredOrders} delivered orders` },
    { label: "Owed to dairies", value: formatINR(summary.owedToDairies), icon: Store, color: "text-dawn-dark bg-dawn-light/40", hint: "Net of commission" },
    { label: "Owed to riders", value: formatINR(summary.owedToRiders), icon: Truck, color: "text-dawn-dark bg-dawn-light/40", hint: `${summary.riderCommissionPercent}% of delivered orders` },
  ];

  const open = summary.payouts.pending.count + summary.payouts.processing.count;
  const openAmount = summary.payouts.pending.amount + summary.payouts.processing.amount;

  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
          <Wallet size={26} /> Earnings
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Platform commission, what dairies and riders are owed, and payout requests to settle.
        </p>
      </div>

      <div className="mt-6 grid animate-fade-in-up stagger-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, hint }) => (
          <Card key={label} className="p-5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon size={16} />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid animate-fade-in-up stagger-2 gap-5 lg:grid-cols-[1.6fr,1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-ink">Commission, last 12 months</h2>
            <p className="text-xs text-ink-faint">
              This month {formatINR(summary.thisMonthCommission)} · last month {formatINR(summary.lastMonthCommission)}
            </p>
          </div>
          <div className="mt-6">
            <MonthlyChart data={summary.monthly} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <Landmark size={17} /> Payout requests
          </h2>
          <p className="mt-3 font-mono text-2xl font-semibold text-ink">{formatINR(openAmount)}</p>
          <p className="text-xs text-ink-faint">
            across {open} open request{open === 1 ? "" : "s"}
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {Object.entries(summary.payouts).map(([key, v]) => (
              <li key={key} className="flex items-center justify-between">
                <Badge className={PAYOUT_STATUS_STYLE[key].className}>{PAYOUT_STATUS_STYLE[key].label}</Badge>
                <span className="text-ink-soft">
                  <span className="font-mono font-semibold text-ink">{formatINR(v.amount)}</span> · {v.count}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-ink/6 pt-3 text-xs text-ink-faint">
            Net platform margin after dairy and rider shares: {formatINR(summary.platformNet)}
          </p>
        </Card>
      </div>

      <div className="mt-8 animate-fade-in-up stagger-3">
        <h2 className="font-display text-lg font-semibold text-ink">Payout requests</h2>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {roleTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setRole(t.value)}
              className={cx(
                "flex-none rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                role === t.value
                  ? "border-dawn bg-dawn-light/40 text-dawn-dark"
                  : "border-ink/12 text-ink-soft hover:border-ink/20"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loadingPayouts ? (
            <Spinner />
          ) : payouts.length === 0 ? (
            <EmptyState icon={Inbox} title="No payout requests" description="Nothing matches these filters right now." />
          ) : (
            <ul className="flex flex-col gap-3">
              {payouts.map((p) => {
                const style = PAYOUT_STATUS_STYLE[p.status] || PAYOUT_STATUS_STYLE.pending;
                const isFinal = p.status === "paid" || p.status === "rejected";
                const confirming = action?.id === p._id;
                return (
                  <li key={p._id}>
                    <Card className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{fullName(p.user)}</p>
                          <p className="truncate text-xs text-ink-faint">
                            {ROLE_LABEL[p.role] || p.role} · {p.user?.email}
                            {p.user?.phone ? ` · ${p.user.phone}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg font-semibold text-ink">{formatINR(p.amount)}</p>
                          <Badge className={style.className}>
                            {p.status === "paid" && <CheckCircle2 size={12} />} {style.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-1 rounded-xl bg-ink/4 px-3.5 py-2.5 text-xs text-ink-soft sm:grid-cols-2">
                        <p>
                          <span className="text-ink-faint">Method: </span>
                          {p.method === "upi" ? "UPI" : "Bank transfer"}
                        </p>
                        <p className="break-all">
                          <span className="text-ink-faint">Pay to: </span>
                          {p.payoutDetails || "Not provided"}
                        </p>
                        <p>
                          <span className="text-ink-faint">Requested: </span>
                          {formatDate(p.createdAt)}
                        </p>
                        {p.processedAt && (
                          <p>
                            <span className="text-ink-faint">Settled: </span>
                            {formatDate(p.processedAt)}
                          </p>
                        )}
                      </div>
                      {p.notes && <p className="mt-2 text-xs text-ink-soft">Note: {p.notes}</p>}

                      {!isFinal && !confirming && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => startAction(p._id, "processing")}>
                              {ACTION_LABEL.processing}
                            </Button>
                          )}
                          <Button size="sm" onClick={() => startAction(p._id, "paid")}>
                            {ACTION_LABEL.paid}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => startAction(p._id, "rejected")}>
                            {ACTION_LABEL.rejected}
                          </Button>
                        </div>
                      )}

                      {confirming && (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <Input
                              label={
                                action.status === "rejected"
                                  ? "Reason for rejecting"
                                  : action.status === "paid"
                                  ? "Transaction reference (optional)"
                                  : "Note (optional)"
                              }
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder={action.status === "rejected" ? "e.g. UPI ID is invalid" : ""}
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="md"
                              variant={action.status === "rejected" ? "danger" : "primary"}
                              loading={saving}
                              onClick={confirmAction}
                            >
                              Confirm: {ACTION_LABEL[action.status].toLowerCase()}
                            </Button>
                            <Button size="md" variant="ghost" onClick={() => setAction(null)} disabled={saving}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}