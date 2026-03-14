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
    .populate("studentId", "username email fullName name avatarUrl")
    .sort({ createdAt: -1 });
};

export const createReview = async (payload) => {
  if (!payload?.courseId || !payload?.studentId) {
    throw new Error("courseId and studentId are required");
  }

  const course = await Course.findById(payload.courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (String(course.instructorId) === String(payload.studentId)) {
    throw new Error("Instructor cannot review own course");
  }

  const enrolled = await Enrollment.findOne({
    courseId: payload.courseId,
    studentId: payload.studentId,
  });

  if (!enrolled) {
    throw new Error("You must enroll before reviewing");
  }

  const existed = await Review.findOne({
    courseId: payload.courseId,
    studentId: payload.studentId,
  });

  if (existed) {
    throw new Error("You already reviewed this course");
  }

  const rating = Number(payload.rating);

  const review = await Review.create({
    courseId: payload.courseId,
    studentId: payload.studentId,
    rating: Number.isNaN(rating) ? 5 : Math.min(5, Math.max(1, rating)),
    comment: payload.comment?.trim() || "",
  });

  await recalcCourseReview(payload.courseId);

  return Review.findById(review._id).populate(
    "studentId",
    "username email fullName name avatarUrl"
  );
};

export const updateReview = async (
  reviewId,
  payload,
  { requesterId, requesterRole } = {}
) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  if (
    requesterRole !== "admin" &&
    String(review.studentId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to update this review");
  }

  if (payload.rating !== undefined) {
    const rating = Number(payload.rating);
    if (!Number.isNaN(rating)) {
      review.rating = Math.min(5, Math.max(1, rating));
    }
  }

  if (typeof payload.comment === "string") {
    review.comment = payload.comment.trim();
  }

  await review.save();
  await recalcCourseReview(review.courseId);

  return Review.findById(review._id).populate(
    "studentId",
    "username email fullName name avatarUrl"
  );
};

export const deleteReview = async (
  reviewId,
  { requesterId, requesterRole } = {}
) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  if (
    requesterRole !== "admin" &&
    String(review.studentId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to delete this review");
  }

  const courseId = review.courseId;

  await Review.findByIdAndDelete(reviewId);
  await recalcCourseReview(courseId);

  return { success: true };
};