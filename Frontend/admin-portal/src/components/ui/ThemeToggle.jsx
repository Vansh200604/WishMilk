import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cx } from "../../lib/utils.js";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cx("inline-flex items-center gap-0.5 rounded-xl border border-ink/12 bg-cream-card p-1", className)}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            title={label}
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              active ? "bg-butter text-ink-fixed" : "text-ink-faint hover:text-ink"
            )}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}