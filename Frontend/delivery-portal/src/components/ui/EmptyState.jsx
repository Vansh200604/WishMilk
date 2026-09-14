import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, to }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-cream-card px-6 py-16 text-center">
      {Icon && (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-butter-light/50 text-butter-dark">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {actionLabel &&
        (to ? (
          <Button as={Link} to={to} className="mt-2" size="sm">
            {actionLabel}
          </Button>
        ) : (
          <Button onClick={onAction} className="mt-2" size="sm">
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}