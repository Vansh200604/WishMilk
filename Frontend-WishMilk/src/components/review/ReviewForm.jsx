import { useState } from "react";
import { Star } from "lucide-react";
import Button from "../ui/Button.jsx";
import { cx } from "../../lib/utils.js";

// Shared form for both writing a new review and editing an existing one —
// the parent decides which by passing (or not passing) `initial`.
export default function ReviewForm({ initial, onSubmit, onCancel, submitting }) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState(initial?.comments || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comments });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5 text-butter-dark"
          >
            <Star
              size={22}
              fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
              strokeWidth={1.75}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="What was your experience with this dairy? (optional)"
        rows={3}
        className="w-full resize-none rounded-xl border border-ink/12 bg-cream-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn"
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={submitting} disabled={rating === 0}>
          {initial ? "Save changes" : "Post review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}