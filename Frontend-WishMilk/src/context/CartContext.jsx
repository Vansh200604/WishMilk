import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "wishmilk_cart";

// Each cart line is one milk product from one dairy, since the backend
// creates a separate Order per product. At checkout we submit one
// POST /api/orders call per line, sharing the same address/slot/date.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (line) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.milkId === line.milkId);
      if (existing) {
        return prev.map((i) =>
          i.milkId === line.milkId ? { ...i, quantity: i.quantity + line.quantity } : i
        );
      }
      return [...prev, line];
    });
  };

  const updateQuantity = (milkId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.milkId === milkId ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (milkId) => {
    setItems((prev) => prev.filter((i) => i.milkId !== milkId));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}