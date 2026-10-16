import { MILK_TYPE_LABEL } from "../../lib/utils.js";

// Plain SVG ring chart — stroke-dasharray per segment, no charting
// library needed for four slices. Colors come straight from WishMilk's
// own token set (butter/dawn/leaf/clay), not a copied palette. Only the
// ring itself is rotated (so the first segment starts at 12 o'clock) —
// the center text stays upright by living outside that rotated group.
//
// Responsive notes: the SVG has no width/height attributes — its size
// comes entirely from the Tailwind width classes + `aspect-square` on
// the wrapper, with the 0–160 viewBox just defining its internal
// coordinate space. That lets it shrink on a tight mobile card and
// grow back up on desktop without ever looking squashed. Below `sm`
// the donut stacks above the legend (centered); from `sm` up they sit
// side by side.
const SEGMENT_COLORS = {
  cow: "#E7A73C",
  buffalo: "#6E97B8",
  goat: "#4C8B62",
  sheep: "#C1573A",
};

const RADIUS = 60;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OverviewDonut({ breakdown }) {
  const entries = Object.entries(breakdown || {});
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  let offset = 0;
  const segments = entries.map(([type, count]) => {
    const fraction = total > 0 ? count / total : 0;
    const dash = fraction * CIRCUMFERENCE;
    const segment = { type, count, dash, offset };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={`${total} orders by milk type`}
        className="aspect-square w-36 flex-none sm:w-32 md:w-36 lg:w-40"
      >
        <g transform="rotate(-90 80 80)">
          <circle cx={80} cy={80} r={RADIUS} fill="none" stroke="currentColor" className="text-ink/8" strokeWidth={STROKE} />
          {segments.map((s) => (
            <circle
              key={s.type}
              cx={80}
              cy={80}
              r={RADIUS}
              fill="none"
              stroke={SEGMENT_COLORS[s.type]}
              strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${CIRCUMFERENCE - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x={80} y={76} textAnchor="middle" className="fill-ink font-mono font-semibold" style={{ fontSize: 26 }}>
          {total}
        </text>
        <text x={80} y={96} textAnchor="middle" className="fill-ink-faint" style={{ fontSize: 11 }}>
          orders
        </text>
      </svg>

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:w-auto sm:flex-col sm:gap-2.5">
        {entries.map(([type, count]) => (
          <div key={type} className="flex min-w-0 items-center gap-2 text-sm">
            <span
              className="h-3 w-3 flex-none rounded-sm sm:h-2.5 sm:w-2.5"
              style={{ backgroundColor: SEGMENT_COLORS[type] }}
            />
            <span className="truncate text-ink-soft">{MILK_TYPE_LABEL[type]}</span>
            <span className="ml-auto flex-none font-mono text-ink">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}