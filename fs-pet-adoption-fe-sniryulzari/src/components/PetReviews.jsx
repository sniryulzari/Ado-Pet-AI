import { useState, useContext } from "react";
import { FaStar, FaRegStar, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { UsersContext } from "../Context/Context-Users";
import { addReview, deleteReview } from "../api/pets";
import { toast } from "../utils/toast";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${readonly ? " star-btn--readonly" : ""}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          {(hovered || value) >= n
            ? <FaStar className="star-filled" />
            : <FaRegStar className="star-empty" />}
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, currentUserId, petId, onDelete }) {
  const isOwn = review.userId === currentUserId || review.userId?._id === currentUserId;

  const handleDelete = async () => {
    try {
      await deleteReview(petId, review._id);
      onDelete(review._id);
      toast.success("Review deleted.");
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <motion.div
      className="review-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="review-card__top">
        <div className="review-card__avatar">{review.userName?.charAt(0).toUpperCase()}</div>
        <div className="review-card__meta">
          <span className="review-card__name">{review.userName}</span>
          <StarRating value={review.rating} readonly />
        </div>
        {isOwn && (
          <button className="review-card__delete" onClick={handleDelete} aria-label="Delete review">
            <FaTrash size="0.8em" />
          </button>
        )}
      </div>
      <p className="review-card__comment">"{review.comment}"</p>
      <span className="review-card__date">
        {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    </motion.div>
  );
}

export default function PetReviews({ petId, initialReviews = [], canReview = false, currentUserId }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { isLoggedIn }        = useContext(UsersContext);

  const alreadyReviewed = reviews.some(
    (r) => r.userId === currentUserId || r.userId?._id === currentUserId
  );

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    setLoading(true);
    try {
      const res = await addReview(petId, { rating, comment });
      setReviews(res.data);
      setRating(0);
      setComment("");
      setShowForm(false);
      toast.success("Review submitted! 🐾");
    } catch (err) {
      toast.error(err?.response?.data || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  return (
    <div className="pet-reviews">
      <div className="pet-reviews__header">
        <h3 className="pet-reviews__title">
          Reviews
          {avgRating && (
            <span className="pet-reviews__avg">
              <FaStar className="star-filled" /> {avgRating} ({reviews.length})
            </span>
          )}
        </h3>

        {isLoggedIn && canReview && !alreadyReviewed && !showForm && (
          <button className="reviews-write-btn" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <p className="review-form__label">Your rating</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            className="review-form__textarea"
            placeholder="Share your experience with this pet…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
          />
          <div className="review-form__actions">
            <button type="button" className="review-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="review-form__submit" disabled={!rating || !comment.trim() || loading}>
              {loading ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="pet-reviews__empty">No reviews yet.{canReview ? " Be the first!" : ""}</p>
      ) : (
        <AnimatePresence>
          <div className="pet-reviews__list">
            {reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                currentUserId={currentUserId}
                petId={petId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
