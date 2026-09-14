import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, PackageX, ArrowRight } from "lucide-react";
import { useMyDairy } from "../hooks/useMyDairy.js";
import { milkApi } from "../api/milk.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { MILK_TYPE_LABEL, formatINR } from "../lib/utils.js";

const emptyForm = { name: "", type: "cow", fatPercentage: "", packaging: "packet", unit: "liter", image: "" };
const packagingOptions = ["packet", "bottle", "can"];
const unitOptions = ["liter", "ml"];

export default function OwnerMilk() {
  const { dairy, loading: loadingDairy } = useMyDairy();
  const [milk, setMilk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const loadMilk = (dairyId) => {
    setLoading(true);
    milkApi
      .byDairy(dairyId)
      .then((res) => setMilk(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (dairy) loadMilk(dairy._id);
  }, [dairy]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      type: item.type,
      fatPercentage: item.fatPercentage,
      packaging: item.packaging,
      unit: item.unit,
      image: item.image || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await milkApi.update(editingId, { ...form, fatPercentage: Number(form.fatPercentage) });
        toast.success("Milk product updated");
      } else {
        await milkApi.create({
          ...form,
          fatPercentage: Number(form.fatPercentage),
          inStock: true,
          dairyId: dairy._id,
        });
        toast.success("Milk product added");
      }
      setShowForm(false);
      loadMilk(dairy._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStock = async (id) => {
    setBusyId(id);
    try {
      await milkApi.toggleStock(id);
      loadMilk(dairy._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this milk product?")) return;
    setBusyId(id);
    try {
      await milkApi.remove(id);
      toast.success("Milk product deleted");
      loadMilk(dairy._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  if (loadingDairy) return <Spinner />;

  if (!dairy) {
    return (
      <EmptyState
        icon={PackageX}
        title="Register your dairy first"
        description="You'll be able to add milk products once your dairy profile exists."
        to="/dairy"
        actionLabel="Register your dairy"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Milk products</h1>
        {!showForm && (
          <Button size="sm" onClick={startCreate}>
            <Plus size={15} /> Add product
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Product name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-soft">Milk type</span>
                <select
                  className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                  value={form.type}
                  onChange={(e) => set({ type: e.target.value })}
                >
                  {Object.entries(MILK_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-soft">Packaging</span>
                <select
                  className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink capitalize"
                  value={form.packaging}
                  onChange={(e) => set({ packaging: e.target.value })}
                >
                  {packagingOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-soft">Unit</span>
                <select
                  className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink"
                  value={form.unit}
                  onChange={(e) => set({ unit: e.target.value })}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Fat percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={form.fatPercentage}
                onChange={(e) => set({ fatPercentage: e.target.value })}
              />
              <Input
                label="Image URL (optional)"
                value={form.image}
                onChange={(e) => set({ image: e.target.value })}
              />
            </div>
            <p className="text-xs text-ink-faint">
              Pricing for this milk type is set on your{" "}
              <Link to="/dairy" className="text-dawn-dark hover:underline">
                dairy profile page
              </Link>
              , shared across all products of the same type.
            </p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                {editingId ? "Save changes" : "Add product"}
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
        ) : milk.length === 0 ? (
          <EmptyState icon={PackageX} title="No products yet" description="Add your first milk product to start selling." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {milk.map((item) => (
              <Card key={item._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {MILK_TYPE_LABEL[item.type]} · {item.fatPercentage}% fat · {item.packaging}
                    </p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-2 py-1 text-[11px] font-semibold ${
                      item.inStock ? "bg-leaf-light text-leaf" : "bg-clay-light text-clay"
                    }`}
                  >
                    {item.inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStock(item._id)}
                    loading={busyId === item._id}
                  >
                    {item.inStock ? "Mark out of stock" : "Mark in stock"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-clay hover:bg-clay-light"
                    onClick={() => handleDelete(item._id)}
                    loading={busyId === item._id}
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