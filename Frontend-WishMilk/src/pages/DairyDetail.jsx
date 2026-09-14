/* 
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, MapPin, Clock, Milk as MilkIcon, ArrowLeft } from "lucide-react";
import { dairyApi } from "../api/dairy.js";
import { milkApi } from "../api/milk.js";
import { reviewApi } from "../api/review.js";
import MilkCard from "../components/milk/MilkCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Card from "../components/ui/Card.jsx";
import { MILK_TYPE_LABEL } from "../lib/utils.js";

export default function DairyDetail() {
  const { id } = useParams();
  const [dairy, setDairy] = useState(null);
  const [milk, setMilk] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dairyApi.getById(id),
      milkApi.byDairy(id).catch(() => ({ data: [] })),
      reviewApi.summary(id).catch(() => ({ data: null })),
    ])
      .then(([dairyRes, milkRes, summaryRes]) => {
        setDairy(dairyRes.data);
        // Defensive: /api/milk/dairy/:id currently can't populate real Milk
        // documents (Dairy.milkTypes is a string enum, not an ObjectId ref),
        // so it may return plain type strings instead of product objects.
        // Filter those out so the UI degrades gracefully until it's fixed
        // backend-side (see README "Known backend issues").
        const realProducts = (milkRes.data || []).filter(
          (item) => item && typeof item === "object" && item._id && item.name
        );
        setMilk(realProducts);
        setSummary(summaryRes.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!dairy) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState icon={MilkIcon} title="Dairy not found" to="/dairies" actionLabel="Back to dairies" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link to="/dairies" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to dairies
      </Link>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div>
          <div className="h-44 overflow-hidden rounded-2xl bg-dawn-light/40 sm:h-56">
            {dairy.image ? (
              <img src={dairy.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-dawn-dark">
                <MilkIcon size={40} />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{dairy.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin size={14} /> {dairy.location?.address}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-butter-light/60 px-3 py-1.5 text-sm font-semibold text-butter-dark">
              <Star size={14} fill="currentColor" />
              {dairy.rating?.toFixed?.(1) ?? "New"}
              {summary?.totalReviews ? (
                <span className="font-normal text-butter-dark/70">({summary.totalReviews})</span>
              ) : null}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {(dairy.milkTypes || []).map((t) => (
              <span key={t} className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink-soft">
                {MILK_TYPE_LABEL[t] || t}
              </span>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl font-semibold text-ink">Milk products</h2>
          {milk.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">This dairy hasn't listed any products yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {milk.map((m) => (
                <MilkCard key={m._id} milk={m} dairy={dairy} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Delivery window</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <Clock size={15} />
              {dairy.deliveryTime?.start} – {dairy.deliveryTime?.end}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Subscription plans</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(dairy.subscriptionPlans || []).map((p) => (
                <span key={p} className="rounded-full bg-dawn-light/50 px-2.5 py-1 text-xs font-medium capitalize text-dawn-dark">
                  {p}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Contact</h3>
            <p className="mt-2 text-sm text-ink-soft">{dairy.phone}</p>
            <p className="text-sm text-ink-soft">{dairy.email}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

*/



import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, MapPin, Clock, Milk as MilkIcon, ArrowLeft } from "lucide-react";
import { dairyApi } from "../api/dairy.js";
import { milkApi } from "../api/milk.js";
import { reviewApi } from "../api/review.js";
import { useAuth } from "../context/AuthContext.jsx";
import MilkCard from "../components/milk/MilkCard.jsx";
import ReviewForm from "../components/review/ReviewForm.jsx";
import ReviewItem from "../components/review/ReviewItem.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Card from "../components/ui/Card.jsx";
import { MILK_TYPE_LABEL } from "../lib/utils.js";

export default function DairyDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [dairy, setDairy] = useState(null);
  const [milk, setMilk] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const myReview = isAuthenticated
    ? reviews.find((r) => r.userId?._id === user?._id)
    : null;

  const loadReviews = () => {
    Promise.all([
      reviewApi.forDairy(id).catch(() => ({ data: [] })),
      reviewApi.summary(id).catch(() => ({ data: null })),
    ]).then(([reviewsRes, summaryRes]) => {
      setReviews(reviewsRes.data || []);
      setSummary(summaryRes.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dairyApi.getById(id),
      milkApi.byDairy(id).catch(() => ({ data: [] })),
      reviewApi.forDairy(id).catch(() => ({ data: [] })),
      reviewApi.summary(id).catch(() => ({ data: null })),
    ])
      .then(([dairyRes, milkRes, reviewsRes, summaryRes]) => {
        setDairy(dairyRes.data);
        // Defensive: /api/milk/dairy/:id currently can't populate real Milk
        // documents (Dairy.milkTypes is a string enum, not an ObjectId ref),
        // so it may return plain type strings instead of product objects.
        // Filter those out so the UI degrades gracefully until it's fixed
        // backend-side (see README "Known backend issues").
        const realProducts = (milkRes.data || []).filter(
          (item) => item && typeof item === "object" && item._id && item.name
        );
        setMilk(realProducts);
        setReviews(reviewsRes.data || []);
        setSummary(summaryRes.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async ({ rating, comments }) => {
    setSubmittingReview(true);
    try {
      if (myReview) {
        await reviewApi.update(myReview._id, { rating, comments });
        toast.success("Review updated");
      } else {
        await reviewApi.create(id, { rating, comments });
        toast.success("Review posted — thanks for the feedback!");
      }
      setShowReviewForm(false);
      loadReviews();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    setDeletingReview(true);
    try {
      await reviewApi.remove(myReview._id);
      toast.success("Review deleted");
      loadReviews();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) return <Spinner />;
  if (!dairy) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState icon={MilkIcon} title="Dairy not found" to="/dairies" actionLabel="Back to dairies" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link to="/dairies" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to dairies
      </Link>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div>
          <div className="h-44 overflow-hidden rounded-2xl bg-dawn-light/40 sm:h-56">
            {dairy.image ? (
              <img src={dairy.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-dawn-dark">
                <MilkIcon size={40} />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{dairy.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin size={14} /> {dairy.location?.address}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-butter-light/60 px-3 py-1.5 text-sm font-semibold text-butter-dark">
              <Star size={14} fill="currentColor" />
              {dairy.rating?.toFixed?.(1) ?? "New"}
              {summary?.totalReviews ? (
                <span className="font-normal text-butter-dark/70">({summary.totalReviews})</span>
              ) : null}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {(dairy.milkTypes || []).map((t) => (
              <span key={t} className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink-soft">
                {MILK_TYPE_LABEL[t] || t}
              </span>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl font-semibold text-ink">Milk products</h2>
          {milk.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">This dairy hasn't listed any products yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {milk.map((m) => (
                <MilkCard key={m._id} milk={m} dairy={dairy} />
              ))}
            </div>
          )}

          <h2 className="mt-8 font-display text-xl font-semibold text-ink">Reviews</h2>

          {isAuthenticated && (
            <div className="mt-4">
              {myReview && !showReviewForm ? (
                <ReviewItem
                  review={myReview}
                  isOwn
                  onEdit={() => setShowReviewForm(true)}
                  onDelete={handleDeleteReview}
                  deleting={deletingReview}
                />
              ) : showReviewForm || !myReview ? (
                <Card className="p-4">
                  <ReviewForm
                    initial={showReviewForm ? myReview : null}
                    onSubmit={handleSubmitReview}
                    onCancel={myReview ? () => setShowReviewForm(false) : undefined}
                    submitting={submittingReview}
                  />
                </Card>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {reviews
              .filter((r) => r._id !== myReview?._id)
              .map((r) => (
                <ReviewItem key={r._id} review={r} isOwn={false} />
              ))}
            {reviews.length === 0 && (
              <p className="text-sm text-ink-soft">No reviews yet — be the first to share your experience.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Delivery window</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <Clock size={15} />
              {dairy.deliveryTime?.start} – {dairy.deliveryTime?.end}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Subscription plans</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(dairy.subscriptionPlans || []).map((p) => (
                <span key={p} className="rounded-full bg-dawn-light/50 px-2.5 py-1 text-xs font-medium capitalize text-dawn-dark">
                  {p}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">Contact</h3>
            <p className="mt-2 text-sm text-ink-soft">{dairy.phone}</p>
            <p className="text-sm text-ink-soft">{dairy.email}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}