import { Search, MapPin } from "lucide-react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { MILK_TYPE_LABEL, cx } from "../../lib/utils.js";

const milkTypes = Object.keys(MILK_TYPE_LABEL);
const plans = ["daily", "weekly", "monthly"];

export default function DairyFilters({ filters, onChange, onUseLocation, locating }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink/8 bg-cream-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            aria-label="Search dairies"
            placeholder="Search dairies by name…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
          />
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={onUseLocation}
          loading={locating}
          className="whitespace-nowrap"
        >
          <MapPin size={16} /> Near me
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Milk</span>
        <button
          onClick={() => set({ milkType: "" })}
          className={cx(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !filters.milkType ? "border-butter bg-butter-light/50 text-butter-dark" : "border-ink/12 text-ink-soft"
          )}
        >
          All
        </button>
        {milkTypes.map((type) => (
          <button
            key={type}
            onClick={() => set({ milkType: filters.milkType === type ? "" : type })}
            className={cx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              filters.milkType === type
                ? "border-butter bg-butter-light/50 text-butter-dark"
                : "border-ink/12 text-ink-soft"
            )}
          >
            {MILK_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Plan</span>
        {plans.map((plan) => (
          <button
            key={plan}
            onClick={() => set({ subscriptionPlan: filters.subscriptionPlan === plan ? "" : plan })}
            className={cx(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize",
              filters.subscriptionPlan === plan
                ? "border-dawn bg-dawn-light/50 text-dawn-dark"
                : "border-ink/12 text-ink-soft"
            )}
          >
            {plan}
          </button>
        ))}
      </div>
    </div>
  );
}