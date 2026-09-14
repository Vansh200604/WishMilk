import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Trash2, Plus, LocateFixed } from "lucide-react";
import { authApi } from "../api/auth.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { cx } from "../lib/utils.js";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "home", fullAddress: "" });
  const [coords, setCoords] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    authApi
      .getAddresses()
      .then((res) => setAddresses(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
      () => toast.error("Couldn't access your location")
    );
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.fullAddress) return;
    setSaving(true);
    try {
      await authApi.addAddress({
        label: form.label,
        fullAddress: form.fullAddress,
        location: { coordinates: coords || [0, 0] },
      });
      toast.success("Address added");
      setForm({ label: "home", fullAddress: "" });
      setCoords(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await authApi.deleteAddress(id);
      toast.success("Address removed");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/profile" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to profile
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink">Delivery addresses</h1>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : addresses.length === 0 && !showForm ? (
          <EmptyState
            icon={MapPin}
            title="No addresses saved"
            description="Add one so checkout only takes a tap."
            actionLabel="Add address"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <Card key={a._id} className="flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
                  <MapPin size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize text-ink">{a.label}</p>
                  <p className="text-sm text-ink-soft">{a.fullAddress}</p>
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  disabled={deletingId === a._id}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-ink-faint hover:bg-clay-light hover:text-clay disabled:opacity-50"
                  aria-label={`Delete ${a.label} address`}
                >
                  <Trash2 size={15} />
                </button>
              </Card>
            ))}
          </div>
        )}

        {!showForm && addresses.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-ink/20 px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:border-butter hover:text-ink"
          >
            <Plus size={15} /> Add a new address
          </button>
        )}

        {showForm && (
          <Card className="mt-3 p-4">
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex gap-2">
                {["home", "office", "other"].map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setForm((f) => ({ ...f, label: l }))}
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                      form.label === l
                        ? "border-butter bg-butter-light/50 text-butter-dark"
                        : "border-ink/12 text-ink-soft"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Flat / street / area / city"
                value={form.fullAddress}
                onChange={(e) => setForm((f) => ({ ...f, fullAddress: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={captureLocation}
                className="flex items-center gap-1.5 self-start text-xs font-medium text-dawn-dark hover:underline"
              >
                <LocateFixed size={14} /> {coords ? "Location pinned ✓" : "Pin current location"}
              </button>
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={saving}>
                  Save address
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}