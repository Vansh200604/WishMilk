import { useState } from "react";
import { formatINR } from "../../lib/utils.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// 12-month platform commission chart. Plain divs rather than a charting
// library, scaled to the tallest month. `data` is the `monthly` array from
// /earnings/platform: [{ month: "2026-10", commission, gross, orders }].
export default function MonthlyChart({ data }) {
  const [hover, setHover] = useState(null);
  const months = data || [];
  const max = Math.max(...months.map((m) => m.commission), 1);

  return (
    <div className="flex h-40 items-end gap-1.5 sm:gap-2">
      {months.map((m, i) => {
        const [, mm] = m.month.split("-");
        const label = MONTH_NAMES[Number(mm) - 1];
        const isHovered = hover === i;
        return (
          <div
            key={m.month}
            className="relative flex h-full flex-1 flex-col justify-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            onClick={() => setHover((h) => (h === i ? null : i))}
          >
            <div
              className={`w-full rounded-t-md transition-colors ${
                m.commission > 0 ? (isHovered ? "bg-leaf" : "bg-leaf/70") : "bg-ink/8"
              }`}
              style={{ height: `${Math.max(3, (m.commission / max) * 78)}%` }}
            />
            <span className="mt-1.5 text-center text-[10px] text-ink-faint">{label}</span>
            {isHovered && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink/10 bg-cream-card px-2 py-1 text-[11px] shadow-lg">
                <p className="font-semibold text-ink">{formatINR(m.commission)} commission</p>
                <p className="text-ink-faint">
                  {formatINR(m.gross)} gross · {m.orders} orders
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}