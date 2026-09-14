import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBasket } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatINR, MILK_TYPE_LABEL } from "../lib/utils.js";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          description="Browse dairies and add a milk product to get started."
          to="/dairies"
          actionLabel="Browse dairies"
        />
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Each product ships as its own order, so you can track them independently.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {items.map((item) => (
          // Two rows on phones (icon+details, then controls) so the quantity
          // stepper and delete button always have room to be tappable.
          // One row from `sm:` up, once there's width to spare.
          <Card key={item.milkId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-dawn-light/40 text-dawn-dark">
                <ShoppingBasket size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.milkName}</p>
                <p className="text-xs text-ink-faint">
                  {item.dairyName} · {MILK_TYPE_LABEL[item.milkType]} · {item.packaging}
                </p>
                <p className="mt-1 font-mono text-sm text-ink">{formatINR(item.pricePerUnit)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-2 rounded-xl border border-ink/12 px-1">
                <button
                  onClick={() => updateQuantity(item.milkId, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center font-mono text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.milkId, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.milkId)}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-ink-faint hover:bg-clay-light hover:text-clay"
                aria-label={`Remove ${item.milkName}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">Subtotal</span>
          <span className="font-mono text-lg font-semibold text-ink">{formatINR(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          Delivery slot, address and any coupon are applied on the next step.
        </p>
        <Button size="lg" className="mt-4 w-full" onClick={handleCheckout}>
          Continue to checkout
        </Button>
      </Card>

      <Link to="/dairies" className="mt-4 block text-center text-sm font-medium text-dawn-dark hover:underline">
        Add more items
      </Link>
    </div>
  );
}