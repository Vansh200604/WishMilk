import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Milk } from "lucide-react";
import { dairyApi } from "../api/dairy.js";
import DairyFilters from "../components/dairy/DairyFilters.jsx";
import DairyCard from "../components/dairy/DairyCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function Dairies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    milkType: searchParams.get("milkType") || "",
    subscriptionPlan: searchParams.get("subscriptionPlan") || "",
  });
  const [dairies, setDairies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [near, setNear] = useState(null);

  // The search box updates `filters` instantly (so typing feels responsive),
  // but the actual API call waits for a pause in typing — otherwise every
  // keystroke fires its own request.
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    const params = {};
    if (debouncedFilters.search) params.search = debouncedFilters.search;
    if (debouncedFilters.milkType) params.milkType = debouncedFilters.milkType;
    if (debouncedFilters.subscriptionPlan) params.subscriptionPlan = debouncedFilters.subscriptionPlan;
    setSearchParams(params, { replace: true });

    setLoading(true);
    const request = near
      ? dairyApi.nearby({ lng: near[0], lat: near[1], radius: 8000 })
      : dairyApi.list(params);

    request
      .then((res) => setDairies(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, near]);

  const visible = useMemo(() => {
    if (!near) return dairies;
    // /nearby doesn't support the same query filters, so filter client-side
    return dairies.filter((d) => {
      if (filters.milkType && !d.milkTypes?.includes(filters.milkType)) return false;
      if (filters.subscriptionPlan && !d.subscriptionPlans?.includes(filters.subscriptionPlan))
        return false;
      if (filters.search && !d.name?.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
  }, [dairies, near, filters]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNear([pos.coords.longitude, pos.coords.latitude]);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Couldn't access your location");
      }
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Browse dairies</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {near ? "Showing dairies near your current location." : "Filter by milk type, plan, or search by name."}
      </p>

      <div className="mt-6">
        <DairyFilters
          filters={filters}
          onChange={(f) => {
            setNear(null);
            setFilters(f);
          }}
          onUseLocation={handleUseLocation}
          locating={locating}
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Milk}
            title="No dairies match your filters"
            description="Try clearing a filter or searching a different area."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d) => (
              <DairyCard key={d._id} dairy={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}