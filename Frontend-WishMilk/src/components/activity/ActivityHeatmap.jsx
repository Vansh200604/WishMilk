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

// Builds one month's day-cells, padded at the start so day 1 lands in
// its correct weekday column (Sunday-first, like most calendar grids).
function buildMonthCells(year, monthIndex, countByDate) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingBlanks = firstDay.getUTCDay();

  const cells = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date: dateStr, count: countByDate[dateStr] || 0 });
  }
  return cells;
}

export default function ActivityHeatmap({ year, dailyActivity }) {
  const countByDate = {};
  (dailyActivity || []).forEach((d) => {
    countByDate[d.date] = d.count;
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {MONTH_NAMES.map((name, monthIndex) => {
        const cells = buildMonthCells(year, monthIndex, countByDate);
        return (
          <div key={name} className="flex flex-none flex-col items-center gap-1.5">
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {cells.map((cell, i) =>
                cell ? (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count} order${cell.count === 1 ? "" : "s"}`}
                    className={`h-2.5 w-2.5 rounded-[2px] ${intensityClass(cell.count)}`}
                  />
                ) : (
                  <div key={`blank-${monthIndex}-${i}`} className="h-2.5 w-2.5" />
                )
              )}
            </div>
            <span className="text-[10px] text-ink-faint">{name.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}