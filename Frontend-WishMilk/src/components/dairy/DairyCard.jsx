import { Link } from "react-router-dom";
import { Star, MapPin, Milk as MilkIcon } from "lucide-react";
import Card from "../ui/Card.jsx";
import { MILK_TYPE_LABEL } from "../../lib/utils.js";

export default function DairyCard({ dairy }) {
  return (
    <Link to={`/dairies/${dairy._id}`}>
      <Card creamTop className="h-full transition-transform hover:-translate-y-0.5">
        <div className="flex h-32 items-center justify-center bg-dawn-light/40">
          {dairy.image ? (
            <img src={dairy.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <MilkIcon size={32} className="text-dawn-dark" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold leading-snug text-ink">
              {dairy.name}
            </h3>
            <span className="flex flex-none items-center gap-1 rounded-full bg-butter-light/60 px-2 py-0.5 text-xs font-semibold text-butter-dark">
              <Star size={12} fill="currentColor" />
              {dairy.rating?.toFixed?.(1) ?? "New"}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
            <MapPin size={12} />
            <span className="line-clamp-1">{dairy.location?.address || "Address unavailable"}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5   ">

            {(dairy.milkTypes || []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-cream-soft px-2 py-0.5 text-[11px] font-medium text-ink-soft"
              > 
                {MILK_TYPE_LABEL[t] || t}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}