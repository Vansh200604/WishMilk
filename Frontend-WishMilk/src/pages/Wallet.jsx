import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Gift, Plus } from "lucide-react";
import { walletApi } from "../api/wallet.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, formatDate } from "../lib/utils.js";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [points, setPoints] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = () => {
    setLoading(true);
    walletApi
      .get()
      .then((res) => setWallet(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setAdding(true);
    try {
      await walletApi.addMoney(Number(amount));
      toast.success(`${formatINR(amount)} added to wallet`);
      setAmount("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!points || Number(points) <= 0) return;
    setRedeeming(true);
    try {
      const res = await walletApi.redeemPoints(Number(points));
      toast.success(res.message);
      setPoints("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Wallet</h1>

      <Card className="mt-6 overflow-hidden">
        <div className="bg-ink px-6 py-7 text-cream">
          <p className="flex items-center gap-2 text-sm text-cream/70">
            <WalletIcon size={16} /> Available balance
          </p>
          <p className="mt-2 font-mono text-4xl font-semibold">{formatINR(wallet?.balance)}</p>
          <div className="mt-4 flex gap-6 text-sm text-cream/70">
            <span>Earned {formatINR(wallet?.totalEarned)}</span>
            <span>Spent {formatINR(wallet?.totalSpent)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-butter-light/40 px-6 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-butter-dark">
            <Gift size={16} /> Loyalty points
          </span>
          <span className="font-mono text-sm font-semibold text-butter-dark">
            {wallet?.loyaltyPoints ?? 0}
          </span>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Add money</h2>
          <form onSubmit={handleAddMoney} className="mt-3 flex flex-col gap-3">
            <Input
              type="number"
              min="1"
              placeholder="Amount in ₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button type="submit" loading={adding}>
              <Plus size={15} /> Add money
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-ink">Redeem points</h2>
          <form onSubmit={handleRedeem} className="mt-3 flex flex-col gap-3">
            <Input
              type="number"
              min="1"
              placeholder="Points to redeem"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <Button type="submit" variant="outline" loading={redeeming}>
              <Gift size={15} /> Redeem
            </Button>
          </form>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Recent activity</h2>
      {!wallet?.transactions?.length ? (
        <div className="mt-3">
          <EmptyState icon={WalletIcon} title="No transactions yet" description="Top up your wallet to see activity here." />
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {[...wallet.transactions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((t, i) => (
              <Card key={i} className="flex items-center gap-3 p-3.5">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${
                    t.type === "credit" ? "bg-leaf-light text-leaf" : "bg-clay-light text-clay"
                  }`}
                >
                  {t.type === "credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{t.description || "Transaction"}</p>
                  <p className="text-xs text-ink-faint">{formatDate(t.createdAt)}</p>
                </div>
                <span
                  className={`font-mono text-sm font-semibold ${
                    t.type === "credit" ? "text-leaf" : "text-clay"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"}
                  {formatINR(t.amount)}
                </span>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}