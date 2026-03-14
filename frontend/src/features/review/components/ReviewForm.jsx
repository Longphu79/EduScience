import { useState } from "react";
import Button from "../../../shared/components/Button";

export default function ReviewForm({ courseId, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!courseId || typeof onSubmit !== "function") return;

    try {
      setSubmitting(true);

      await onSubmit({
        courseId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <h4 className="text-lg font-bold text-slate-900">Viết đánh giá</h4>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Rating
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
        >
          <option value={5}>5 sao</option>
          <option value={4}>4 sao</option>
          <option value={3}>3 sao</option>
          <option value={2}>2 sao</option>
          <option value={1}>1 sao</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Comment
        </label>
        <textarea
          placeholder="Nhận xét của bạn"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
        />
      </div>

      <div className="mt-4">
        <Button type="submit" loading={submitting} disabled={submitting}>
          Gửi đánh giá
        </Button>
      </div>
    </form>
  );
}