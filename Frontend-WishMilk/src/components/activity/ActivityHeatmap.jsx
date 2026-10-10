import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

// Responsive day sizes: 12px on mobile, 14px on small screens,
// and 16px on medium and larger screens.
const CELL_SIZE_CLASS =
  "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4";

const CELL_GAP_CLASS = "gap-1 sm:gap-[5px] md:gap-1.5";
const MONTH_GAP_CLASS = "gap-5 sm:gap-6 md:gap-8";

// WishMilk yellow intensity.
function intensityClass(count) {
  if (count === 0) {
    return "bg-ink/15 ring-1 ring-inset ring-ink/10";
  }

  if (count === 1) return "bg-butter-light";
  if (count <= 3) return "bg-butter";

  return "bg-butter-dark";
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Build one month's cells and align the first day to its weekday.
function buildMonthCells(year, monthIndex, dataByDate) {
  const firstDay = new Date(
    Date.UTC(year, monthIndex, 1)
  );

  const daysInMonth = new Date(
    Date.UTC(year, monthIndex + 1, 0)
  ).getUTCDate();

  const leadingBlanks = firstDay.getUTCDay();

  const cells = Array.from(
    { length: leadingBlanks },
    () => null
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const entry = dataByDate[date];

    cells.push({
      date,
      count: entry?.count || 0,
      items: entry?.items || [],
    });
  }

  return cells;
}

// Responsive tooltip for each calendar day.

function DayCell({ cell, isPinned, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const cellRef = useRef(null);
  const tooltipRef = useRef(null);
  const hideTimerRef = useRef(null);

  const showTooltip = isPinned || hovered;
  const items = cell.items || [];

  const cancelHide = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();

    hideTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      hideTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    if (!showTooltip) {
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const box = cellRef.current;
      const tooltip = tooltipRef.current;

      if (!box || !tooltip) return;

      const rect = box.getBoundingClientRect();
      const tip = tooltip.getBoundingClientRect();

      const margin = 8;
      const gap = 6;

      let left = rect.left + rect.width / 2 - tip.width / 2;

      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - tip.width - margin)
      );

      const placement =
        rect.top >= tip.height + gap + margin ? "top" : "bottom";

      let top =
        placement === "top"
          ? rect.top - tip.height - gap
          : rect.bottom + gap;

      top = Math.max(
        margin,
        Math.min(top, window.innerHeight - tip.height - margin)
      );

      const arrowX = Math.max(
        10,
        Math.min(
          tip.width - 10,
          rect.left + rect.width / 2 - left
        )
      );

      setTooltipPosition({ left, top, arrowX, placement });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showTooltip, cell.date, cell.count, items.length]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        ref={cellRef}
        type="button"
        data-heatmap-day="true"
        aria-label={`${formatDateLabel(cell.date)}: ${cell.count} orders`}
        aria-pressed={isPinned}
        onMouseEnter={() => {
          cancelHide();
          setHovered(true);
        }}
        onMouseLeave={scheduleHide}
        onFocus={() => {
          cancelHide();
          setHovered(true);
        }}
        onBlur={scheduleHide}
        onClick={(event) => {
          event.stopPropagation();
          cancelHide();
          onToggle(cell.date);
        }}
        className={`${CELL_SIZE_CLASS} block shrink-0 cursor-pointer touch-manipulation rounded-[3px] border-0 p-0 transition-transform focus:outline-none focus:ring-2 focus:ring-butter-dark ${intensityClass(
          cell.count
        )} ${showTooltip ? "scale-125" : ""}`}
      />

      {showTooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            data-heatmap-tooltip="true"
            role="tooltip"
            onMouseEnter={() => {
              cancelHide();
              setHovered(true);
            }}
            onMouseLeave={scheduleHide}
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "fixed",
              left: tooltipPosition?.left ?? 0,
              top: tooltipPosition?.top ?? 0,
              visibility: tooltipPosition ? "visible" : "hidden",
              width: "min(10rem, calc(100vw - 1rem))",
            }}
            className="z-[100] rounded-lg border border-ink/10 bg-cream-card p-2 text-left shadow-md"
          >
            <p className="text-[10px] font-semibold leading-tight text-ink">
              {formatDateLabel(cell.date)}
            </p>

            <p className="mt-1 text-[10px] text-ink-soft">
              {cell.count} {cell.count === 1 ? "order" : "orders"}
            </p>

            {cell.count === 0 ? (
              <p className="mt-1 text-[10px] text-ink-faint">
                No orders
              </p>
            ) : items.length > 0 ? (
              <div className="mt-1.5 flex flex-col gap-1.5">
                {items.map((item, index) => (
                  <div
                    key={`${item.milkType}-${index}`}
                    className="flex items-start justify-between gap-2 text-[10px] leading-tight"
                  >
                    <span className="min-w-0 capitalize text-ink-soft">
                      {item.milkType} milk
                      {item.orders != null && (
                        <span className="block text-[9px] text-ink-faint">
                          {item.orders}{" "}
                          {item.orders === 1 ? "order" : "orders"}
                        </span>
                      )}
                    </span>

                    <span className="shrink-0 font-mono font-medium text-ink">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-[10px] text-ink-faint">
                Milk details unavailable.
              </p>
            )}

            <div
              style={{
                left: tooltipPosition?.arrowX ?? "50%",
              }}
              className={`absolute -translate-x-1/2 border-4 border-transparent ${
                tooltipPosition?.placement === "top"
                  ? "top-full border-t-cream-card"
                  : "bottom-full border-b-cream-card"
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default function ActivityHeatmap({
  year,
  dailyActivity,
}) {
  const scrollerRef = useRef(null);

  const [pinnedDate, setPinnedDate] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dataByDate = {};

  (dailyActivity || []).forEach((day) => {
    dataByDate[day.date] = day;
  });

  const refreshScrollState = useCallback(() => {
    const element = scrollerRef.current;

    if (!element) return;

    setCanScrollLeft(element.scrollLeft > 4);

    setCanScrollRight(
      element.scrollLeft + element.clientWidth <
        element.scrollWidth - 4
    );
  }, []);

  // Position the current month in view when the year changes.
  useEffect(() => {
    setPinnedDate(null);

    const scroller = scrollerRef.current;

    if (!scroller) return;

    const now = new Date();

    const targetMonth =
      year === now.getUTCFullYear()
        ? now.getUTCMonth()
        : year < now.getUTCFullYear()
          ? 11
          : 0;

    const target = scroller.querySelector(
      `[data-month-index="${targetMonth}"]`
    );

    if (target) {
      const offset =
        target.offsetLeft -
        scroller.clientWidth / 2 +
        target.clientWidth / 2;

      scroller.scrollTo({
        left: Math.max(0, offset),
        behavior: "auto",
      });
    }

    requestAnimationFrame(refreshScrollState);
  }, [year, refreshScrollState]);

  // Track horizontal scroll and viewport resizing.
  useEffect(() => {
    const element = scrollerRef.current;

    if (!element) return;

    refreshScrollState();

    element.addEventListener(
      "scroll",
      refreshScrollState,
      { passive: true }
    );

    window.addEventListener("resize", refreshScrollState);

    return () => {
      element.removeEventListener(
        "scroll",
        refreshScrollState
      );

      window.removeEventListener(
        "resize",
        refreshScrollState
      );
    };
  }, [refreshScrollState]);

  // Close a pinned day when clicking outside it.
  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      // Don't close when clicking a calendar box or its tooltip.
      if (
        target.closest("[data-heatmap-day]") ||
        target.closest("[data-heatmap-tooltip]")
      ) {
        return;
      }

      setPinnedDate(null);
    };

    document.addEventListener("click", closeOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, []);

  const scrollByAmount = (direction) => {
    const element = scrollerRef.current;

    if (!element) return;

    element.scrollBy({
      left: element.clientWidth * 0.7 * direction,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-ink-faint sm:text-[11px]">
          Scroll horizontally to see all 12 months
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to earlier months"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/12 text-ink-soft transition-colors enabled:hover:bg-ink/5 disabled:opacity-30 sm:h-7 sm:w-7"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to later months"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/12 text-ink-soft transition-colors enabled:hover:bg-ink/5 disabled:opacity-30 sm:h-7 sm:w-7"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={`flex w-full min-w-0 justify-between ${MONTH_GAP_CLASS} overflow-x-auto overscroll-x-contain scroll-smooth pb-3 pt-3`}
      >
        {MONTH_NAMES.map((name, monthIndex) => {
          const cells = buildMonthCells(
            year,
            monthIndex,
            dataByDate
          );

          return (
            <div
              key={name}
              data-month-index={monthIndex}
              className="flex flex-none flex-col items-center gap-2"
            >
              <div
                className={`grid grid-flow-col grid-rows-7 ${CELL_GAP_CLASS}`}
              >
                {cells.map((cell, index) =>
                  cell ? (
                    <DayCell
                      key={cell.date}
                      cell={cell}
                      isPinned={pinnedDate === cell.date}
                      onToggle={(date) => {
                        setPinnedDate((previous) =>
                          previous === date ? null : date
                        );
                      }}
                    />
                  ) : (
                    <div
                      key={`blank-${monthIndex}-${index}`}
                      aria-hidden="true"
                      className={CELL_SIZE_CLASS}
                    />
                  )
                )}
              </div>

              <span className="text-[10px] text-ink-faint sm:text-xs">
                {name.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
