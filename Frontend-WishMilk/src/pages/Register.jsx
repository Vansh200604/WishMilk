import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Milk, LocateFixed } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { MILK_TYPE_LABEL } from "../lib/utils.js";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  preferredMilk: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));


  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location isn't available in this browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          // MongoDB GeoJSON format: [longitude, latitude]
          setCoords([longitude, latitude]);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          if (!response.ok) {
            throw new Error("Failed to get address");
          }

          const data = await response.json();

          set({
            address: data.display_name
          });

          toast.success("Location and address captured");
        } catch (error) {
          console.error(error);
          toast.error("Location captured, but address couldn't be found");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setLocating(false);
        toast.error(
          "Couldn't get your location — enter your address manually"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.address) {
      setError("Please add your delivery address");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: { firstName: form.firstName, lastName: form.lastName },
        email: form.email,
        phone: form.phone,
        password: form.password,
        preferredMilk: form.preferredMilk || undefined,
        location: {
          address: form.address,
          // Falls back to a neutral point if geolocation was denied —
          // the user can refine this later from Profile > Addresses.
          coordinates: coords || [0, 0],
        },
      });
      toast.success("Account created — welcome to WishMilk!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <Milk size={20} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">Takes less than a minute.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              name="firstName"
              required
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
            />
            <Input
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
          />
          <Input
            label="Phone number"
            name="phone"
            required
            pattern="[0-9]{10}"
            hint="10 digits, no country code"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
          />

          <div>
            <Input
              label="Delivery address"
              name="address"
              required
              placeholder="Flat / street / area / city"
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
            />
            <button
              type="button"
              onClick={useMyLocation}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-dawn-dark hover:underline disabled:opacity-50"
              disabled={locating}
            >
              <LocateFixed size={14} />
              {locating ? "Locating…" : coords ? "Location pinned ✓" : "Use my current location"}
            </button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              Preferred milk (optional)
            </span>
            <select
              className="w-full rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn"
              value={form.preferredMilk}
              onChange={(e) => set({ preferredMilk: e.target.value })}
            >
              <option value="">No preference</option>
              {Object.entries(MILK_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-clay">{error}</p>}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-dawn-dark hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}