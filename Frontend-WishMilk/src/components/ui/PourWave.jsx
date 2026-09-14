import { cx } from "../../lib/utils.js";

// The one recurring signature motif: a gentle settling wave, like milk
// just poured into a glass. Used sparingly — hero + section breaks only.
// Default fill tracks the card surface color, so it stays correct in dark mode.
export default function PourWave({ className, fill = "rgb(var(--wm-cream-card))" }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      className={cx("block w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 40C240 80 480 0 720 24C960 48 1200 84 1440 44V90H0V40Z"
        fill={fill}
      />
    </svg>
  );
}