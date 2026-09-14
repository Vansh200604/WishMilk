import { cx } from "../../lib/utils.js";

export default function Spinner({ className, label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-faint">
      <span
        role="status"
        aria-label={label}
        className={cx(
          "h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-butter",
          className
        )}
      />
      <span className="text-sm">{label}…</span>
    </div>
  );
}