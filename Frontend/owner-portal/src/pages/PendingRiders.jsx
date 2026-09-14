import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserCheck, Check, X } from "lucide-react";
import { authApi } from "../api/auth.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatDate } from "../lib/utils.js";

// Riders have no fixed dairy affiliation, so any dairy owner can approve
// or reject any pending rider — first one to review it decides. There's
// no per-dairy ownership check here, matching how the backend endpoint
// works (see README: known limitation, no invite/verification flow yet).
export default function PendingRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    authApi
      .getPendingRiders()
      .then((res) => setRiders(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (riderId) => {
    setBusyId(riderId);
    try {
      await authApi.approveRider(riderId);
      toast.success("Rider approved");
      setRiders((prev) => prev.filter((r) => r._id !== riderId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const handleReject = async (riderId) => {
    setBusyId(riderId);
    try {
      await authApi.rejectRider(riderId);
      toast.success("Rider rejected");
      setRiders((prev) => prev.filter((r) => r._id !== riderId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Pending riders</h1>
      <p className="mt-1 text-sm text-ink-soft">
        New riders can't be matched to any delivery until approved. Any dairy owner can
        review these — riders aren't tied to a specific dairy.
      </p>

      <div className="mt-6">
        {riders.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Nothing to review"
            description="New rider sign-ups will show up here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {riders.map((rider) => (
              <Card key={rider._id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">
                    {rider.username?.firstName} {rider.username?.lastName || ""}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {rider.phone} · {rider.email}
                  </p>
                  <p className="text-xs text-ink-faint">Applied {formatDate(rider.createdAt)}</p>
                </div>
                <div className="flex flex-none gap-2">
                  <Button size="sm" onClick={() => handleApprove(rider._id)} loading={busyId === rider._id}>
                    <Check size={14} /> Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-clay hover:bg-clay-light"
                    onClick={() => handleReject(rider._id)}
                    loading={busyId === rider._id}
                  >
                    <X size={14} /> Reject
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