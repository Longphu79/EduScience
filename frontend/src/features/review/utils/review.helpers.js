function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function sortByDateDesc(list = [], getDate) {
  return [...list].sort((a, b) => {
    const aTime = new Date(getDate(a) || 0).getTime();
    const bTime = new Date(getDate(b) || 0).getTime();
    return bTime - aTime;
  });
}

export function reviewUnwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export function getReviewId(review = {}) {
  return String(review?._id || review?.id || review?.reviewId || "");
}

export function getCourseId(review = {}) {
  return String(
    review?.courseId?._id ||
      review?.courseId ||
      review?.course?._id ||
      review?.course ||
      ""
  );
}

export function getReviewAuthorName(review = {}) {
  return (
    review?.userId?.fullName ||
    review?.userId?.name ||
    review?.userId?.username ||
    review?.userId?.email ||
    review?.user?.fullName ||
    review?.user?.name ||
    review?.user?.username ||
    review?.user?.email ||
    "Người dùng"
  );
}

export function normalizeReviewItem(review = {}) {
  return {
    ...review,
    _id: getReviewId(review),
    id: getReviewId(review),
    courseId: getCourseId(review),
    rating: Math.max(0, Math.min(5, toNumber(review?.rating, 0))),
    comment: review?.comment || "",
    authorName: getReviewAuthorName(review),
    createdAt: review?.createdAt || null,
    updatedAt: review?.updatedAt || null,
  };
}

export function normalizeReviewList(payload) {
  const data = Array.isArray(payload) ? payload : reviewUnwrap(payload);

  if (!Array.isArray(data)) return [];

  return sortByDateDesc(
    data.map((item) => normalizeReviewItem(item)),
    (item) => item?.createdAt
  );
}

export function formatReviewDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("vi-VN");
}

export function getReviewRatingLabel(rating) {
  const safeRating = Math.max(0, Math.min(5, toNumber(rating, 0)));
  if (!safeRating) return "Chưa đánh giá";
  return `${safeRating} sao`;
}