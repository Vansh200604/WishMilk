import { MILK_TYPE_LABEL } from "../../lib/utils.js";

const SEGMENT_COLORS = {
  cow: "#E7A73C",
  buffalo: "#6E97B8",
  goat: "#4C8B62",
  sheep: "#C1573A",
};

const RADIUS = 70;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OverviewDonut({ breakdown }) {
  const entries = Object.entries(breakdown || {});
  const total = entries.reduce(
    (sum, [, count]) => sum + count,
    0
  );

  let offset = 0;

  const segments = entries.map(([type, count]) => {
    const fraction = total > 0 ? count / total : 0;
    const dash = fraction * CIRCUMFERENCE;

    const segment = { type, count, dash, offset };
    offset += dash;

    return segment;
  });

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6 lg:gap-8">
      {/* Donut chart */}
      <div className="flex min-w-0 items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          role="img"
          aria-label={`${total} orders by milk type`}
          className="block h-auto w-full max-w-[220px] sm:max-w-[240px]"
        >
          <g transform="rotate(-90 80 80)">
            <circle
              cx={80}
              cy={80}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              className="text-ink/8"
              strokeWidth={STROKE}
            />

            {segments.map((segment) => (
              <circle
                key={segment.type}
                cx={80}
                cy={80}
                r={RADIUS}
                fill="none"
                stroke={SEGMENT_COLORS[segment.type] || "#9CA3AF"}
                strokeWidth={STROKE}
                strokeDasharray={`${segment.dash} ${
                  CIRCUMFERENCE - segment.dash
                }`}
                strokeDashoffset={-segment.offset}
                strokeLinecap="butt"
              />
            ))}
          </g>

          <text
            x={80}
            y={76}
            textAnchor="middle"
            className="fill-ink font-mono font-semibold"
            style={{ fontSize: 26 }}
          >
            {total}
          </text>

          <text
            x={80}
            y={96}
            textAnchor="middle"
            className="fill-ink-faint"
            style={{ fontSize: 11 }}
          >
            orders
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-1 sm:gap-y-4">
        {entries.map(([type, count]) => (
          <div
            key={type}
            className="flex min-w-0 items-center gap-2 text-xs sm:text-sm"
          >
            <span
              className="h-3 w-3 flex-none rounded-sm"
              style={{
                backgroundColor:
                  SEGMENT_COLORS[type] || "#9CA3AF",
              }}
            />

            <span className="min-w-0 truncate text-ink-soft">
              {MILK_TYPE_LABEL[type] || type}
            </span>

            <span className="ml-auto flex-none font-mono text-ink">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
