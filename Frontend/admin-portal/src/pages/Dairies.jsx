import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Store, Search, Star } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function Dairies() {
  const [dairies, setDairies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminApi
      .getDairies({ search: search || undefined })
      .then((res) => {
        setDairies(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="animate-fade-in-up">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Dairies</h1>
          <p className="mt-1 text-sm text-ink-soft">{total} total, including inactive</p>
        </div>
        <form onSubmit={handleSearch} className="animate-fade-in-up stagger-1 flex gap-2">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button type="submit" variant="outline" size="md">
            <Search size={15} />
          </Button>
        </form>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : dairies.length === 0 ? (
          <EmptyState icon={Store} title="No dairies found" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {dairies.map((d, i) => (
              <Card
                key={d._id}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} p-4 transition-transform duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold text-ink">{d.name}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {d.owner?.username?.firstName} {d.owner?.username?.lastName || ""} · {d.owner?.email}
                    </p>
                  </div>
                  <Badge className={d.isActive ? "bg-leaf-light text-leaf" : "bg-clay-light text-clay"}>
                    {d.isActive ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-ink-faint">
                  <Star size={12} className="text-butter-dark" fill="currentColor" />
                  {d.rating?.toFixed?.(1) ?? "New"} · {d.location?.address}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}