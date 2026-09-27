// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Truck, MapPin } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";
// import Card from "../components/ui/Card.jsx";
// import Input from "../components/ui/Input.jsx";
// import Button from "../components/ui/Button.jsx";

// const initialForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

// // Registers a normal account and immediately upgrades it to deliveryPerson
// // in one submit. No dairy is chosen here — riders aren't tied to any one
// // dairy. Which delivery a rider gets is decided dynamically: whenever a
// // dairy owner creates a delivery, the backend finds whichever registered
// // rider is currently closest and offers it to them.
// export default function Register() {
//   const { registerAsRider } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState(initialForm);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const set = (patch) => setForm((f) => ({ ...f, ...patch }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await registerAsRider({
//         username: { firstName: form.firstName, lastName: form.lastName },
//         email: form.email,
//         phone: form.phone,
//         password: form.password,
//         // Riders don't place orders, but the User model requires a
//         // location — a neutral placeholder is fine here. Their real,
//         // meaningful location is set separately via "Update my location"
//         // once they're in the app, which is what matching actually uses.
//         currentLocation: {
//           type: "Point",
//           coordinates: [0, 0],
//           address: "N/A",
//         },
//       });
//       toast.success("You're in! Update your location, then check My Deliveries.");
//       navigate("/", { replace: true });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
//       <div className="mb-8 flex flex-col items-center text-center">
//         <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
//           <Truck size={20} />
//         </span>
//         <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Join as a rider</h1>
//         <p className="mt-1 text-sm text-ink-soft">
//           No dairy to pick — you'll be matched to nearby deliveries automatically.
//         </p>
//       </div>

//       <Card className="p-6">
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <Input
//               label="First name"
//               required
//               value={form.firstName}
//               onChange={(e) => set({ firstName: e.target.value })}
//             />
//             <Input
//               label="Last name"
//               value={form.lastName}
//               onChange={(e) => set({ lastName: e.target.value })}
//             />
//           </div>
//           <Input
//             label="Email"
//             type="email"
//             required
//             value={form.email}
//             onChange={(e) => set({ email: e.target.value })}
//           />
//           <Input label="Phone number" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
//           <Input
//             label="Password"
//             type="password"
//             required
//             minLength={6}
//             value={form.password}
//             onChange={(e) => set({ password: e.target.value })}
//           />

//           {error && <p className="text-sm text-clay">{error}</p>}
 
//           <Button type="submit" size="lg" loading={loading} className="w-full">
//             Create account
//           </Button>
//         </form>
//       </Card>

//       <p className="mt-6 text-center text-sm text-ink-soft">
//         Already have an account?{" "}
//         <Link to="/login" className="font-medium text-dawn-dark hover:underline">
//           Log in
//         </Link>
//       </p>
//     </div>
//   );
// }








import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

// Registers a normal account and immediately upgrades it to deliveryPerson.
// No dairy is selected here. Riders are matched dynamically based on
// their current GPS location.
export default function Register() {
  const { registerAsRider } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Location states
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Get readable address from latitude and longitude
  const getAddressFromCoordinates = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("Unable to find your address.");
    }

    const data = await response.json();

    return data.display_name || "Current location";
  };

  // Get rider's current GPS location
  const getCurrentLocation = () => {
    setLocationError("");
    setError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Get readable address
          const address = await getAddressFromCoordinates(
            latitude,
            longitude
          );

          /*
           * MongoDB GeoJSON uses:
           *
           * [longitude, latitude]
           *
           * NOT [latitude, longitude]
           */
          const geoLocation = {
            type: "Point",
            coordinates: [longitude, latitude],
            address,
          };

          setLocation(geoLocation);
        } catch (err) {
          setLocationError(
            err.message || "Unable to determine your address."
          );
          setLocation(null);
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(
              "Location permission was denied. Please allow location access and try again."
            );
            break;

          case err.POSITION_UNAVAILABLE:
            setLocationError(
              "Your current location could not be detected. Please try again."
            );
            break;

          case err.TIMEOUT:
            setLocationError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setLocationError(
              "Unable to get your current location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Location is required for rider registration
    if (!location) {
      setError(
        "Please get your current location before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      await registerAsRider({
        username: {
          firstName: form.firstName,
          lastName: form.lastName,
        },

        email: form.email,
        phone: form.phone,
        password: form.password,

        // Registered/general location
        location: {
          type: "Point",
          coordinates: location.coordinates,
          address: location.address,
        },

        // Initial current location of the rider
        currentLocation: {
          type: "Point",
          coordinates: location.coordinates,
        },
      });

      toast.success(
        "You're in! Your location has been registered."
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <Truck size={20} />
        </span>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Join as a rider
        </h1>

        <p className="mt-1 text-sm text-ink-soft">
          No dairy to pick — you'll be matched to nearby
          deliveries automatically.
        </p>
      </div>

      <Card className="p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) =>
                set({ firstName: e.target.value })
              }
            />

            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) =>
                set({ lastName: e.target.value })
              }
            />
          </div>

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              set({ email: e.target.value })
            }
          />

          <Input
            label="Phone number"
            required
            value={form.phone}
            onChange={(e) =>
              set({ phone: e.target.value })
            }
          />

          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) =>
              set({ password: e.target.value })
            }
          />

          {/* GPS LOCATION */}
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <div className="flex items-start gap-3">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-dawn-dark"
              />

              <div className="flex-1">
                <p className="font-medium text-ink">
                  Current location
                </p>

                <p className="mt-1 text-sm text-ink-soft">
                  Your GPS location will be used to match you
                  with nearby deliveries.
                </p>

                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  loading={locationLoading}
                  onClick={getCurrentLocation}
                >
                  {location
                    ? "Update my location"
                    : "Use my current location"}
                </Button>

                {location && (
                  <div className="mt-3 rounded-md bg-green-50 p-3">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Location detected
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-700">
                      {location.address}
                    </p>

                    <p className="mt-2 text-xs text-green-600">
                      Coordinates:{" "}
                      {location.coordinates[1].toFixed(6)},{" "}
                      {location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}

                {locationError && (
                  <p className="mt-2 text-sm text-clay">
                    {locationError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-clay">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            disabled={!location || loading}
            className="w-full"
          >
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-dawn-dark hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
