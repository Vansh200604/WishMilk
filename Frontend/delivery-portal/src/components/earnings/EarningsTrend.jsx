import { useState } from "react";
import { formatINR } from "../../lib/utils.js";

// Lightweight daily-earnings trend — deliberately not a charting
// library, just the last ~60 days scaled to the tallest bar in the
// window, with a hover tooltip. Keeps each portal's bundle small for
// one simple chart. `data` is the dailyEarnings array from the
// earnings endpoint: [{ date, net, ... }].
export default function EarningsTrend({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const recent = (data || []).slice(-60);

  if (recent.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-faint">No earnings yet this year.</p>;
  }

  const max = Math.max(...recent.map((d) => d.net), 1);

  return (
    <div className="flex h-32 items-end gap-[3px] overflow-x-auto pb-1">
      {recent.map((d, i) => {
        const heightPct = Math.max(4, (d.net / max) * 100);
        const isHovered = hoverIndex === i;
        return (
          <div
            key={d.date}
            className="relative min-w-[4px] flex-1"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex((h) => (h === i ? null : h))}
          >
            <div
              className={`w-full rounded-t-sm transition-colors ${
                d.net > 0 ? (isHovered ? "bg-leaf" : "bg-leaf/70") : "bg-ink/8"
              }`}
              style={{ height: `${heightPct}%` }}
            />
            {isHovered && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink/10 bg-cream-card px-2 py-1 text-[11px] shadow-lg">
                <span className="font-semibold text-ink">{formatINR(d.net)}</span>
                <span className="ml-1 text-ink-faint">{d.date}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}