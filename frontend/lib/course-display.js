import { formatCurrency } from "@/lib/format";

const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

export const getCoursePriceLabel = (course) =>
  course?.isFree ? "Free" : formatCurrency(course?.salePrice ?? course?.price ?? 0);

export const getCourseLevelLabel = (level) => titleCase(level || "beginner");

export const getCourseDurationLabel = (course) =>
  course?.duration ? `${course.duration}h on-demand` : "Self-paced";

export const getCourseRatingLabel = (course) =>
  `${Number(course?.rating ?? 0).toFixed(1)} rating`;

export const deriveCourseOutcomes = (course) => {
  const collected = [];

  for (const lesson of course?.lessons || []) {
    for (const objective of lesson.objectives || []) {
      const normalized = objective?.trim();
      if (normalized && !collected.includes(normalized)) {
        collected.push(normalized);
      }
    }
  }

  if (collected.length > 0) {
    return collected.slice(0, 6);
  }

  return [
    `Build practical confidence in ${course?.category || "the subject"}`,
    `Follow a ${getCourseLevelLabel(course?.level).toLowerCase()}-friendly lesson path`,
    "Review structured lessons with preview access before purchase",
    "Study with lesson-by-lesson resources and discussion context",
  ];
};

export const getCourseIncludedItems = (course) => {
  const previewLessons = (course?.lessons || []).filter((lesson) => lesson.isPreview).length;
  const resourceCount = (course?.lessons || []).reduce(
    (sum, lesson) => sum + (lesson.resources?.length || 0),
    0,
  );

  return [
    `${course?.totalLessons || 0} structured lessons`,
    getCourseDurationLabel(course),
    previewLessons > 0 ? `${previewLessons} preview lessons` : "Locked lesson sequence",
    resourceCount > 0 ? `${resourceCount} attached learning resources` : "Resources added as lessons expand",
    "Lesson discussion in the learning workspace",
    "Progress tracking across the course",
  ];
};

export const getCurriculumStats = (lessons = []) => ({
  previewLessons: lessons.filter((lesson) => lesson.isPreview).length,
  totalResources: lessons.reduce((sum, lesson) => sum + (lesson.resources?.length || 0), 0),
  totalObjectives: lessons.reduce((sum, lesson) => sum + (lesson.objectives?.length || 0), 0),
  totalMinutes: lessons.reduce(
    (sum, lesson) => sum + (lesson.estimatedCompletionMinutes || lesson.duration || 0),
    0,
  ),
});
