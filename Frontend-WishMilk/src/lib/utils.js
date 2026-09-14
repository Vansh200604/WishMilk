export function cx(...args) {
  return args.filter(Boolean).join(" ");
}

export function formatINR(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export const MILK_TYPE_LABEL = {
  cow: "Cow milk",
  buffalo: "Buffalo milk",
  goat: "Goat milk",
  sheep: "Sheep milk",
};

export const SLOT_LABEL = {
  morning: "Morning (6–9 AM)",
  afternoon: "Afternoon (12–3 PM)",
  evening: "Evening (5–8 PM)",
};

export const ORDER_STATUS_STYLE = {
  pending: { label: "Pending", className: "bg-butter-light/60 text-butter-dark" },
  confirmed: { label: "Confirmed", className: "bg-dawn-light/60 text-dawn-dark" },
  out_for_delivery: { label: "Out for delivery", className: "bg-dawn-light/60 text-dawn-dark" },
  delivered: { label: "Delivered", className: "bg-leaf-light text-leaf" },
  cancelled: { label: "Cancelled", className: "bg-clay-light text-clay" },
};

// Finds the price for a given milk type from a dairy's milkPricing array.
export function priceForMilkType(dairy, milkType) {
  const entry = dairy?.milkPricing?.find((p) => p.type === milkType);
  return entry ? entry.price : 0;
}