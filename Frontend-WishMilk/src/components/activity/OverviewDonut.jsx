import { MILK_TYPE_LABEL } from "../../lib/utils.js";

// Plain SVG ring chart — stroke-dasharray per segment, no charting
// library needed for four slices. Colors come straight from WishMilk's
// own token set (butter/dawn/leaf/clay), not a copied palette. Only the
// ring itself is rotated (so the first segment starts at 12 o'clock) —
// the center text stays upright by living outside that rotated group.
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
    <div className="flex items-center gap-6">
      <svg width={160} height={160} viewBox="0 0 160 160" className="flex-none">
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

      <div className="flex flex-col gap-2">
        {entries.map(([type, count]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 flex-none rounded-sm"
              style={{ backgroundColor: SEGMENT_COLORS[type] }}
            />
            <span className="text-ink-soft">{MILK_TYPE_LABEL[type]}</span>
            <span className="ml-auto font-mono text-ink">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}