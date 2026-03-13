import Review from "./review.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

async function recalcCourseReview(courseId) {
  const reviews = await Review.find({ courseId });

  const totalReviews = reviews.length;
  const rating = totalReviews
    ? Number(
        (
          reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      )
    : 0;

  await Course.findByIdAndUpdate(courseId, {
    rating,
    totalReviews,
  });
}

export const getReviewsByCourse = async (courseId) => {
  return Review.find({ courseId })
    .populate("studentId", "username email avatarUrl")
    .sort({ createdAt: -1 });
};

export const createReview = async (payload) => {
  const course = await Course.findById(payload.courseId);
  if (!course) throw new Error("Course not found");

  const enrolled = await Enrollment.findOne({
    courseId: payload.courseId,
    studentId: payload.studentId,
  });
  if (!enrolled) throw new Error("You must enroll before reviewing");

  const review = await Review.create({
    courseId: payload.courseId,
    studentId: payload.studentId,
    rating: Number(payload.rating) || 5,
    comment: payload.comment?.trim() || "",
  });

  await recalcCourseReview(payload.courseId);
  return review;
};

export const updateReview = async (reviewId, payload) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  review.rating = Number(payload.rating) || review.rating;
  review.comment =
    typeof payload.comment === "string" ? payload.comment.trim() : review.comment;

  await review.save();
  await recalcCourseReview(review.courseId);

  return review;
};

export const deleteReview = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  const courseId = review.courseId;
  await Review.findByIdAndDelete(reviewId);
  await recalcCourseReview(courseId);

  return { success: true };
};