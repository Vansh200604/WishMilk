import { cx } from "../../lib/utils.js";

export default function Badge({ className, children, ...props }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}