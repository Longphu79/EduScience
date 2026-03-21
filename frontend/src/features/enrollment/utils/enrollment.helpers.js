const VALID_TABS = ["lessons", "materials", "quizzes", "assignments"];

export function getSafeTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "lessons";
}

export function getUserId(user) {
  return user?._id || user?.id || user?.userId || null;
}

export function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

export function getLessonId(lesson) {
  if (!lesson) return "";
  if (typeof lesson === "string") return lesson;
  return lesson._id || lesson.id || lesson.lessonId || "";
}

export function getEnrollmentId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || item.enrollmentId || "";
}

export function getQuizAttemptId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || item.attemptId || "";
}

export function getSubmissionId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || item.submissionId || "";
}

function getLessonOrderValue(lesson) {
  if (!lesson || typeof lesson !== "object") return Number.MAX_SAFE_INTEGER;

  const raw =
    lesson.order ??
    lesson.position ??
    lesson.index ??
    lesson.lessonOrder ??
    lesson.sortOrder ??
    Number.MAX_SAFE_INTEGER;

  const num = Number(raw);
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
}

export function sortLessons(lessons = []) {
  if (!Array.isArray(lessons)) return [];

  return [...lessons].sort((a, b) => {
    const diff = getLessonOrderValue(a) - getLessonOrderValue(b);
    if (diff !== 0) return diff;

    const aTitle = String(a?.title || "");
    const bTitle = String(b?.title || "");
    return aTitle.localeCompare(bTitle);
  });
}

export function getCurrentLessonFromEnrollment(course, enrollment) {
  const lessons = sortLessons(
    Array.isArray(course?.lessonIds) ? course.lessonIds : []
  );

  if (!lessons.length) return null;

  const candidateIds = [
    getLessonId(enrollment?.currentLesson),
    getLessonId(enrollment?.currentLessonId),
    getLessonId(enrollment?.lastLessonId),
    getLessonId(enrollment?.lastCompletedLesson),
  ].filter(Boolean);

  for (const candidateId of candidateIds) {
    const found = lessons.find(
      (lesson) => String(getLessonId(lesson)) === String(candidateId)
    );
    if (found) return found;
  }

  const completedLessonIds = Array.isArray(enrollment?.completedLessons)
    ? enrollment.completedLessons.map((item) => String(getLessonId(item)))
    : [];

  const firstIncomplete = lessons.find(
    (lesson) => !completedLessonIds.includes(String(getLessonId(lesson)))
  );

  return firstIncomplete || lessons[0] || null;
}

export function getSafeImage(image) {
  if (!image) return "";

  if (typeof image === "string") return image;

  return (
    image.url ||
    image.secure_url ||
    image.src ||
    image.path ||
    image.thumbnail ||
    image.imageUrl ||
    ""
  );
}

export function getSafeCourseId(source) {
  if (!source) return "";

  if (typeof source.courseId === "string") return source.courseId;

  if (source.courseId && typeof source.courseId === "object") {
    if (typeof source.courseId._id === "string") return source.courseId._id;
    if (typeof source.courseId.id === "string") return source.courseId.id;
  }

  if (source.course && typeof source.course === "object") {
    if (typeof source.course._id === "string") return source.course._id;
    if (typeof source.course.id === "string") return source.course.id;
  }

  const looksLikeCourse =
    !!source.title ||
    !!source.slug ||
    !!source.lessonIds ||
    !!source.thumbnail ||
    !!source.shortDescription;

  if (looksLikeCourse) {
    if (typeof source._id === "string") return source._id;
    if (typeof source.id === "string") return source.id;
  }

  return "";
}

export function getCoursePublishState(course) {
  const status = String(
    course?.publishStatus ||
      course?.status ||
      (course?.isPublished ? "published" : "draft")
  ).toLowerCase();

  if (status.includes("publish")) {
    return {
      label: "Published",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  }

  if (status.includes("archive")) {
    return {
      label: "Archived",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }

  if (status.includes("pending")) {
    return {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
    };
  }

  return {
    label: "Draft",
    className: "bg-rose-100 text-rose-700 border border-rose-200",
  };
}

export function formatPriceVND(value) {
  const amount = Number(value || 0);
  return `₫${amount.toLocaleString("vi-VN")}`;
}

export function formatLessonDuration(lesson) {
  const raw =
    lesson?.duration ??
    lesson?.durationInMinutes ??
    lesson?.videoDuration ??
    lesson?.length ??
    0;

  const totalMinutes = Number(raw);

  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return "Chưa cập nhật";
  }

  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)} phút`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (minutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
}

export function isYouTubeUrl(url = "") {
  if (!url || typeof url !== "string") return false;
  return /youtu\.be|youtube\.com/i.test(url);
}

export function getYoutubeEmbedUrl(url = "") {
  if (!url || typeof url !== "string") return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);

      const videoId =
        parsed.searchParams.get("v") ||
        (pathParts[0] === "embed" ? pathParts[1] : "") ||
        (pathParts[0] === "shorts" ? pathParts[1] : "");

      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return url;
  } catch {
    return url;
  }
}

export function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getSubmissionStatusMeta(status) {
  const normalized = String(status || "submitted").toLowerCase();

  if (normalized.includes("graded")) {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (normalized.includes("late")) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  if (normalized.includes("reject")) {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-indigo-100 text-indigo-700 border border-indigo-200";
}

export function getStatusMeta(progress = 0, completed = false) {
  const safeProgress = Number(progress || 0);

  if (completed || safeProgress >= 100) {
    return {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  }

  if (safeProgress > 0) {
    return {
      label: "In progress",
      className: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    };
  }

  return {
    label: "Not started",
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  };
}

export function getStudentIdFromItem(item) {
  if (!item) return "";

  if (typeof item?.studentId === "string") return item.studentId;
  if (typeof item?.student === "string") return item.student;

  return (
    item?.studentId?._id ||
    item?.studentId?.id ||
    item?.student?._id ||
    item?.student?.id ||
    ""
  );
}

export function getStudentName(student) {
  if (!student) return "Unknown student";
  if (typeof student === "string") return student;

  return (
    student.fullName ||
    student.name ||
    student.username ||
    student.email ||
    "Unknown student"
  );
}

export function getStudentDisplayName(student) {
  return getStudentName(student);
}

export function getCourseFromEnrollment(item) {
  if (!item) return null;

  if (item.__course) return item.__course;
  if (item.courseId && typeof item.courseId === "object") return item.courseId;
  if (item.course && typeof item.course === "object") return item.course;

  if (item.title || item.thumbnail || item.description) {
    return item;
  }

  return null;
}

export function normalizeCourseProgressItem(item) {
  const course = getCourseFromEnrollment(item) || {};
  const courseId = getSafeCourseId(item) || getSafeCourseId(course);
  const progress = clampProgress(item?.progress || 0);

  const completedLessons = Array.isArray(item?.completedLessons)
    ? item.completedLessons.length
    : Number(item?.completedLessons || item?.completedLessonCount || 0);

  const totalLessons = Number(
    item?.totalLessons ||
      item?.totalLessonCount ||
      (Array.isArray(course?.lessonIds) ? course.lessonIds.length : 0)
  );

  const completed = !!item?.completed || progress >= 100;

  return {
    ...item,
    __course: course,
    __courseId: courseId,
    __title: course?.title || item?.title || item?.courseTitle || "Khóa học",
    __description:
      course?.shortDescription ||
      course?.description ||
      item?.shortDescription ||
      item?.description ||
      "Continue your learning journey.",
    __thumbnail:
      getSafeImage(course?.thumbnail) ||
      getSafeImage(course?.image) ||
      getSafeImage(item?.thumbnail) ||
      getSafeImage(item?.image),
    __progress: progress,
    __completedLessons: completedLessons,
    __totalLessons: totalLessons,
    __completed: completed,
  };
}

export function normalizeStudentProgressItem(item) {
  if (!item) {
    return {
      __rowId: "",
      __student: null,
      __studentId: "",
      __studentName: "Unknown student",
      __progress: 0,
      __enrolledAt: null,
      __email: "",
      __completed: false,
    };
  }

  if (Object.prototype.hasOwnProperty.call(item, "__rowId")) {
    return item;
  }

  const student =
    item?.studentId && typeof item.studentId === "object"
      ? item.studentId
      : item?.student && typeof item.student === "object"
      ? item.student
      : null;

  const safeProgress = clampProgress(item?.progress ?? item?.progressPercent ?? 0);
  const studentId = getStudentIdFromItem(item);

  const rowId =
    getEnrollmentId(item) ||
    studentId ||
    `${item?.createdAt || item?.enrolledAt || "row"}-${safeProgress}`;

  return {
    ...item,
    __rowId: rowId,
    __student: student,
    __studentId: studentId,
    __studentName: getStudentName(student),
    __progress: safeProgress,
    __enrolledAt: item?.enrolledAt || item?.createdAt || null,
    __email: student?.email || "",
    __completed: !!item?.completed || safeProgress >= 100,
  };
}