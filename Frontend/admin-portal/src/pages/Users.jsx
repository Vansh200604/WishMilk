import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users as UsersIcon, Search, Power } from "lucide-react";
import { adminApi } from "../api/admin.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatDate, cx } from "../lib/utils.js";

const roleTabs = [
  { value: "", label: "All" },
  { value: "user", label: "Customers" },
  { value: "dairyOwner", label: "Dairy owners" },
  { value: "deliveryPerson", label: "Riders" },
  { value: "admin", label: "Admins" },
];

const roleBadge = {
  user: "bg-dawn-light/50 text-dawn-dark",
  dairyOwner: "bg-butter-light/60 text-butter-dark",
  deliveryPerson: "bg-leaf-light text-leaf",
  admin: "bg-clay-light text-clay",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    adminApi
      .getUsers({ role: role || undefined, search: search || undefined })
      .then((res) => {
        setUsers(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleToggleActive = async (user) => {
    setBusyId(user._id);
    try {
      await adminApi.updateUserStatus(user._id, !user.isActive);
      toast.success(`${user.isActive ? "Deactivated" : "Activated"} ${user.username?.firstName || "user"}`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="animate-fade-in-up">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-ink-soft">{total} total</p>
        </div>
        <form onSubmit={handleSearch} className="animate-fade-in-up stagger-1 flex gap-2">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button type="submit" variant="outline" size="md">
            <Search size={15} />
          </Button>
        </form>
      </div>

      <div className="mt-4 flex animate-fade-in-up stagger-1 gap-2 overflow-x-auto pb-1 no-scrollbar">
        {roleTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setRole(t.value)}
            className={cx(
              "flex-none rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              role === t.value
                ? "border-butter bg-butter-light/50 text-butter-dark"
                : "border-ink/12 text-ink-soft hover:border-ink/20"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users match this filter" />
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u, i) => (
              <Card
                key={u._id}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">
                      {u.username?.firstName} {u.username?.lastName || ""}
                    </p>
                    <Badge className={roleBadge[u.role]}>{u.role}</Badge>
                    {!u.isActive && <Badge className="bg-ink/8 text-ink-soft">inactive</Badge>}
                  </div>
                  <p className="truncate text-xs text-ink-faint">
                    {u.email} · {u.phone}
                  </p>
                  <p className="text-xs text-ink-faint">Joined {formatDate(u.createdAt)}</p>
                </div>
                <Button
                  variant={u.isActive ? "outline" : "primary"}
                  size="sm"
                  className="flex-none self-start sm:self-auto"
                  onClick={() => handleToggleActive(u)}
                  loading={busyId === u._id}
                >
                  <Power size={13} /> {u.isActive ? "Deactivate" : "Activate"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}