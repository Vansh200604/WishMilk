import { cx } from "../../lib/utils.js";

const variants = {
  primary: "bg-butter text-ink-fixed hover:bg-butter-dark shadow-card",
  secondary: "bg-ink text-cream hover:bg-ink/90",
  outline: "border border-ink/15 text-ink hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-clay text-white hover:bg-clay/90",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 rounded-xl",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-6 py-3 rounded-2xl",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  loading,
  disabled,
  children,
  ...props
}) {
  return (
    <Component
      className={cx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Component>
  );
}