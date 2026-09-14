import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Minus, Plus, Repeat } from "lucide-react";
import { authApi } from "../../api/auth.js";
import { subscriptionApi } from "../../api/subscription.js";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { formatINR, SLOT_LABEL, cx } from "../../lib/utils.js";

const plans = [
  { value: "weekly", label: "Weekly", hint: "Delivered daily, billed every 7 days" },
  { value: "monthly", label: "Monthly", hint: "Delivered daily, billed every 30 days" },
];

// A subscription delivers every day automatically once active — no
// manual order needed. This modal is how a customer sets one up for a
// specific milk product.
export default function SubscribeModal({ milk, dairy, pricePerUnit, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [plan, setPlan] = useState("weekly");
  const [slot, setSlot] = useState("morning");
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authApi
      .getAddresses()
      .then((res) => {
        setAddresses(res.data || []);
        if (res.data?.length) setAddressId(res.data[0]._id);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressId) {
      toast.error("Add a delivery address first, from your profile");
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionApi.create({
        dairy: dairy._id,
        milkType: milk._id,
        quantity,
        deliveryAddress: addressId,
        deliverySlot: slot,
        plan,
      });
      toast.success("Subscribed! Deliveries start tomorrow.");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream-card p-6 sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-butter-light/60 text-butter-dark">
              <Repeat size={16} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Subscribe</h2>
              <p className="text-xs text-ink-faint">{milk.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Quantity per delivery</span>
            <div className="flex items-center gap-2 rounded-xl border border-ink/12 px-1 w-fit">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Billing cycle</span>
            <div className="grid grid-cols-2 gap-2">
              {plans.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPlan(p.value)}
                  className={cx(
                    "rounded-xl border p-3 text-left",
                    plan === p.value ? "border-butter bg-butter-light/30" : "border-ink/12"
                  )}
                >
                  <span className="block text-sm font-medium text-ink">{p.label}</span>
                  <span className="block text-xs text-ink-faint">{p.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Delivery slot</span>
            <select
              className="w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              {Object.entries(SLOT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Delivery address</span>
            {loadingAddresses ? (
              <p className="text-sm text-ink-soft">Loading…</p>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-clay">
                No saved addresses — add one from your profile first, then come back.
              </p>
            ) : (
              <select
                className="w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink"
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
              >
                {addresses.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.label} — {a.fullAddress}
                  </option>
                ))}
              </select>
            )}
          </label>

          <div className="rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">
            <span className="font-mono font-semibold text-ink">{formatINR(pricePerUnit * quantity)}</span> per
            delivery · charged as orders are generated, every day
          </div>

          <Button type="submit" size="lg" loading={submitting} disabled={addresses.length === 0}>
            Start subscription
          </Button>
        </form>
      </div>
    </div>
  );
}