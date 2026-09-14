import { cx } from "../../lib/utils.js";

export default function Card({ className, creamTop, children, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-cream-card border border-ink/8 shadow-card overflow-hidden",
        creamTop && "cream-top",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}