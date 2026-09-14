import { Star, Pencil, Trash2 } from "lucide-react";
import Card from "../ui/Card.jsx";
import { formatDate } from "../../lib/utils.js";

export default function ReviewItem({ review, isOwn, onEdit, onDelete, deleting }) {
  const name = review.userId?.username
    ? `${review.userId.username.firstName} ${review.userId.username.lastName || ""}`.trim()
    : "A WishMilk customer";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-butter-dark">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} strokeWidth={1.75} />
            ))}
          </div>
          <p className="mt-1 text-sm font-medium text-ink">{isOwn ? "You" : name}</p>
        </div>
        <span className="flex-none text-xs text-ink-faint">{formatDate(review.createdAt)}</span>
      </div>

      {review.comments && <p className="mt-2 text-sm text-ink-soft">{review.comments}</p>}

      {isOwn && (
        <div className="mt-3 flex gap-3 border-t border-ink/8 pt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-medium text-dawn-dark hover:underline"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs font-medium text-clay hover:underline disabled:opacity-50"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </Card>
  );
}