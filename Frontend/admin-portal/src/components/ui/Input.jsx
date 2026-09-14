import { forwardRef } from "react";
import { cx } from "../../lib/utils.js";

const Input = forwardRef(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cx(
          "w-full rounded-xl border bg-cream-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn focus-visible:border-dawn",
          error ? "border-clay" : "border-ink/12",
          className
        )}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-clay">{error}</span>}
    </label>
  );
});

export default Input;