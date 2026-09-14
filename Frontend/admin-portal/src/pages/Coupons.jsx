import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Tag, Plus, Power, Trash2 } from "lucide-react";
import { couponApi } from "../api/coupon.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, formatDate, cx } from "../lib/utils.js";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderAmount: "",
  usageLimit: "",
  perUserLimit: "1",
  expiresAt: "",
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    couponApi
      .list()
      .then((res) => setCoupons(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await couponApi.create({
        code: form.code.toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: Number(form.perUserLimit) || 1,
        expiresAt: form.expiresAt,
      });
      toast.success("Coupon created");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      await couponApi.toggle(id);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon? This can't be undone.")) return;
    setBusyId(id);
    try {
      await couponApi.remove(id);
      toast.success("Coupon deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex animate-fade-in-up items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Coupons</h1>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New coupon
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="animate-fade-in-up stagger-1 mt-4 p-5">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Code"
                required
                placeholder="WELCOME50"
                value={form.code}
                onChange={(e) => set({ code: e.target.value })}
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-soft">Discount type</span>
                <select
                  className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                  value={form.discountType}
                  onChange={(e) => set({ discountType: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat amount</option>
                </select>
              </label>
              <Input
                label={form.discountType === "percentage" ? "Discount %" : "Discount ₹"}
                type="number"
                required
                min="0"
                value={form.discountValue}
                onChange={(e) => set({ discountValue: e.target.value })}
              />
              {form.discountType === "percentage" && (
                <Input
                  label="Max discount ₹"
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => set({ maxDiscount: e.target.value })}
                />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Min order ₹"
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => set({ minOrderAmount: e.target.value })}
              />
              <Input
                label="Total uses allowed"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={form.usageLimit}
                onChange={(e) => set({ usageLimit: e.target.value })}
              />
              <Input
                label="Uses per customer"
                type="number"
                min="1"
                value={form.perUserLimit}
                onChange={(e) => set({ perUserLimit: e.target.value })}
              />
            </div>

            <Input
              label="Expires on"
              type="date"
              required
              value={form.expiresAt}
              onChange={(e) => set({ expiresAt: e.target.value })}
            />

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                Create coupon
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : coupons.length === 0 ? (
          <EmptyState icon={Tag} title="No coupons yet" description="Create one to offer customers a discount." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {coupons.map((c, i) => (
              <Card
                key={c._id}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} p-4 transition-transform duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-base font-semibold text-ink">{c.code}</p>
                    <p className="text-xs text-ink-faint">{c.description}</p>
                  </div>
                  <Badge className={c.isActive ? "bg-leaf-light text-leaf" : "bg-clay-light text-clay"}>
                    {c.isActive ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {c.discountType === "percentage" ? `${c.discountValue}% off` : `${formatINR(c.discountValue)} off`}
                  {c.minOrderAmount ? ` · min ${formatINR(c.minOrderAmount)}` : ""}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  Used {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""} · expires {formatDate(c.expiresAt)}
                </p>
                <div className="mt-3 flex gap-2 border-t border-ink/8 pt-3">
                  <Button variant="outline" size="sm" onClick={() => handleToggle(c._id)} loading={busyId === c._id}>
                    <Power size={13} /> {c.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-clay hover:bg-clay-light"
                    onClick={() => handleDelete(c._id)}
                    loading={busyId === c._id}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}