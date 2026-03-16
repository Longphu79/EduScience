export function RatingStars({ rating = 0 }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < safeRating;
        return (
          <span
            key={index}
            className={filled ? "text-amber-400" : "text-slate-300"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}