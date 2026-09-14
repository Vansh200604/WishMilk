import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LocateFixed, Trash2 } from "lucide-react";
import { useMyDairy } from "../hooks/useMyDairy.js";
import { dairyApi } from "../api/dairy.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { MILK_TYPE_LABEL, cx } from "../lib/utils.js";

const plans = ["daily", "weekly", "monthly"];
const milkTypes = Object.keys(MILK_TYPE_LABEL);

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  image: "",
  address: "",
  deliveryStart: "06:00",
  deliveryEnd: "09:00",
  subscriptionPlans: [],
};

export default function OwnerDairyProfile() {
  const { dairy, setDairy, loading, reload } = useMyDairy();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [coords, setCoords] = useState(null);
  const [pricing, setPricing] = useState({ cow: "", buffalo: "", goat: "", sheep: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Once the dairy loads, populate the form with its current values
  useEffect(() => {
    if (!dairy) return;
    setForm({
      name: dairy.name || "",
      email: dairy.email || "",
      phone: dairy.phone || "",
      image: dairy.image || "",
      address: dairy.location?.address || "",
      deliveryStart: dairy.deliveryTime?.start || "06:00",
      deliveryEnd: dairy.deliveryTime?.end || "09:00",
      subscriptionPlans: dairy.subscriptionPlans || [],
    });
    setCoords(dairy.location?.coordinates || null);

    const nextPricing = { cow: "", buffalo: "", goat: "", sheep: "" };
    (dairy.milkPricing || []).forEach((p) => {
      nextPricing[p.type] = p.price;
    });
    setPricing(nextPricing);
  }, [dairy]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const togglePlan = (plan) => {
    set({
      subscriptionPlans: form.subscriptionPlans.includes(plan)
        ? form.subscriptionPlans.filter((p) => p !== plan)
        : [...form.subscriptionPlans, plan],
    });
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
      () => toast.error("Couldn't access your location")
    );
  };

  const buildPayload = () => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    image: form.image || undefined,
    location: { address: form.address, coordinates: coords || [0, 0] },
    deliveryTime: { start: form.deliveryStart, end: form.deliveryEnd },
    subscriptionPlans: form.subscriptionPlans,
    milkPricing: milkTypes
      .filter((t) => pricing[t] !== "" && pricing[t] !== null)
      .map((t) => ({ type: t, price: Number(pricing[t]) })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (dairy) {
        const res = await dairyApi.update(dairy._id, buildPayload());
        // Pricing has its own dedicated endpoint on the backend
        await dairyApi.updatePricing(dairy._id, buildPayload().milkPricing);
        setDairy(res.data);
        toast.success("Dairy profile updated");
      } else {
        await dairyApi.create(buildPayload());
        toast.success("Dairy registered! Add your milk products next.");
        reload();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your dairy? This can't be undone.")) return;
    setDeleting(true);
    try {
      await dairyApi.remove(dairy._id);
      toast.success("Dairy deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {dairy ? "Dairy profile" : "Register your dairy"}
      </h1>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Dairy name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
            />
            <Input label="Phone" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <Input
            label="Image URL (optional)"
            value={form.image}
            onChange={(e) => set({ image: e.target.value })}
          />

          <div>
            <Input
              label="Address"
              required
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
            />
            <button
              type="button"
              onClick={captureLocation}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-dawn-dark hover:underline"
            >
              <LocateFixed size={14} /> {coords ? "Location pinned ✓" : "Pin current location"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Delivery window start"
              type="time"
              value={form.deliveryStart}
              onChange={(e) => set({ deliveryStart: e.target.value })}
            />
            <Input
              label="Delivery window end"
              type="time"
              value={form.deliveryEnd}
              onChange={(e) => set({ deliveryEnd: e.target.value })}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Subscription plans</span>
            <div className="flex flex-wrap gap-2">
              {plans.map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => togglePlan(plan)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
                    form.subscriptionPlans.includes(plan)
                      ? "border-butter bg-butter-light/50 text-butter-dark"
                      : "border-ink/12 text-ink-soft"
                  )}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              Pricing per litre (leave blank for milk you don't sell)
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              {milkTypes.map((type) => (
                <Input
                  key={type}
                  label={MILK_TYPE_LABEL[type]}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="₹"
                  value={pricing[type]}
                  onChange={(e) => setPricing((p) => ({ ...p, [type]: e.target.value }))}
                />
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" loading={saving} className="self-start">
            {dairy ? "Save changes" : "Register dairy"}
          </Button>
        </form>
      </Card>

      {dairy && (
        <Card className="mt-4 border-clay/20 p-5">
          <h2 className="font-display text-base font-semibold text-clay">Danger zone</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Deleting your dairy removes it permanently, including its milk products.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={handleDelete}
            loading={deleting}
          >
            <Trash2 size={14} /> Delete dairy
          </Button>
        </Card>
      )}
    </div>
  );
}