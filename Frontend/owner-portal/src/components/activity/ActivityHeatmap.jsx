import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Buckets by count, not a continuous scale — simpler to read at a
// glance, and matches how every calendar-heatmap convention (GitHub,
// etc.) already does it. Colors are WishMilk's own leaf-green tones.
function intensityClass(count) {
  if (count === 0) {
    return "bg-ink/15 ring-1 ring-inset ring-ink/10";
  }
  if (count === 1) return "bg-butter-light";
  if (count <= 3) return "bg-butter";

  return "bg-butter-dark";
}

function formatDateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Builds one month's day-cells, padded at the start so day 1 lands in
// its correct weekday column (Sunday-first, like most calendar grids).
function buildMonthCells(year, monthIndex, dataByDate) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingBlanks = firstDay.getUTCDay();

  const cells = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = dataByDate[dateStr];
    cells.push({ date: dateStr, count: entry?.count || 0, items: entry?.items || [] });
  }
  return cells;
}

// Bigger, more comfortable cells than a stock GitHub-style grid, and a
// matching gap so the squares breathe instead of smearing together —
// still scaling up a touch further on larger screens.
const CELL_SIZE_CLASS = "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4";
const CELL_GAP_CLASS = "gap-1 sm:gap-[5px] md:gap-1.5";
const MONTH_GAP_CLASS = "gap-5 sm:gap-6 md:gap-8";

// One day-cell plus its tooltip. The tooltip shows on hover (desktop)
// and toggles open on click/tap (so it works on touch devices too —
// a pinned cell stays open until it's clicked again or the person
// clicks elsewhere).
function DayCell({ cell, isPinned, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const showTooltip = isPinned || hovered;

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(cell.date);
        }}
        className={`${CELL_SIZE_CLASS} cursor-pointer rounded-[3px] transition-transform ${intensityClass(
          cell.count
        )} ${showTooltip ? "scale-125" : ""}`}
      />
      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-44 -translate-x-1/2 rounded-xl border border-ink/10 bg-cream-card p-2.5 text-left shadow-lg sm:w-52 sm:p-3"
        >
          <p className="text-[10px] font-semibold text-ink sm:text-[11px]">{formatDateLabel(cell.date)}</p>
          {cell.count === 0 ? (
            <p className="mt-1 text-[10px] text-ink-faint sm:text-[11px]">No deliveries</p>
          ) : (
            <div className="mt-1.5 flex flex-col gap-1">
              {cell.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-[10px] sm:text-[11px]">
                  <span className="capitalize text-ink-soft">{item.milkType} milk</span>
                  <span className="font-mono font-medium text-ink">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* little pointer triangle */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-cream-card" />
        </div>
      )}
    </div>
  );
}

export default function ActivityHeatmap({ year, dailyActivity }) {
  const scrollerRef = useRef(null);
  const [pinnedDate, setPinnedDate] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dataByDate = {};
  (dailyActivity || []).forEach((d) => {
    dataByDate[d.date] = d;
  });

  const refreshScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // All 12 months render in one row that fills the full width of the
  // card — when they all fit, the spacing between months stretches to
  // use the space; when they don't (most phones, most of the time),
  // the row scrolls horizontally instead of being squeezed. Opens
  // scrolled to roughly the current month for the active year, or to
  // December for a past year.
  useEffect(() => {
    setPinnedDate(null);
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const now = new Date();
    const targetMonth = now.getFullYear() === year ? now.getUTCMonth() : 11;
    const target = scroller.querySelector(`[data-month-index="${targetMonth}"]`);
    if (target) {
      const offset = target.offsetLeft - scroller.clientWidth / 2 + target.clientWidth / 2;
      scroller.scrollTo({ left: Math.max(0, offset), behavior: "auto" });
    }
    requestAnimationFrame(refreshScrollState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    const el = scrollerRef.current;
    refreshScrollState();
    if (!el) return;
    el.addEventListener("scroll", refreshScrollState, { passive: true });
    window.addEventListener("resize", refreshScrollState);
    return () => {
      el.removeEventListener("scroll", refreshScrollState);
      window.removeEventListener("resize", refreshScrollState);
    };
  }, []);

  // Clicking anywhere outside a pinned tooltip closes it.
  useEffect(() => {
    const closeOnOutsideClick = () => setPinnedDate(null);
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  const scrollByAmount = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: scroller.clientWidth * 0.4 * direction, behavior: "smooth" });
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-ink-faint">Scroll to see all 12 months</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to earlier months"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-ink/12 text-ink-soft transition-colors enabled:hover:bg-ink/5 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to later months"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-ink/12 text-ink-soft transition-colors enabled:hover:bg-ink/5 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={`flex w-full min-w-0 justify-between ${MONTH_GAP_CLASS} overflow-x-auto pb-2 pt-3`}
      >
        {MONTH_NAMES.map((name, monthIndex) => {
          const cells = buildMonthCells(year, monthIndex, dataByDate);
          return (
            <div
              key={name}
              data-month-index={monthIndex}
              className="flex flex-none flex-col items-center gap-2"
            >
              <div className={`grid grid-flow-col grid-rows-7 ${CELL_GAP_CLASS}`}>
                {cells.map((cell, idx) =>
                  cell ? (
                    <DayCell
                      key={cell.date}
                      cell={cell}
                      isPinned={pinnedDate === cell.date}
                      onToggle={(date) => setPinnedDate((prev) => (prev === date ? null : date))}
                    />
                  ) : (
                    <div key={`blank-${monthIndex}-${idx}`} className={CELL_SIZE_CLASS} />
                  )
                )}
              </div>
              <span className="text-[10px] text-ink-faint sm:text-xs">{name.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}