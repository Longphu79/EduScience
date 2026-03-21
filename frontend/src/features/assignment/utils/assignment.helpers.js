export function formatDateTimeVN(value, fallback = "N/A") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleString("vi-VN");
}

export function getAssignmentId(item) {
  if (!item) return "";

  if (typeof item.assignmentId === "object" && item.assignmentId?._id) {
    return String(item.assignmentId._id);
  }

  return String(item._id || item.id || item.assignmentId || "");
}

export function getSubmissionId(item) {
  if (!item) return "";
  return String(item._id || item.id || "");
}

export function getAssignmentIdFromSubmission(item) {
  if (!item) return "";

  if (item.assignmentId && typeof item.assignmentId === "object") {
    return String(item.assignmentId._id || item.assignmentId.id || "");
  }

  return String(item.assignmentId || "");
}

export function getStudentDisplayName(submission) {
  return (
    submission?.studentId?.username ||
    submission?.studentId?.fullName ||
    submission?.studentId?.name ||
    submission?.studentId?.email ||
    "Student"
  );
}

export function getStudentEmail(submission) {
  return submission?.studentId?.email || "N/A";
}

export function getSubmissionSubmittedAt(submission) {
  return (
    submission?.resubmittedAt ||
    submission?.submittedAt ||
    submission?.createdAt ||
    null
  );
}

export function getLatestSubmissionInfo(submission) {
  return formatDateTimeVN(getSubmissionSubmittedAt(submission));
}

export function getFileNameFromUrl(url = "", fallback = "File") {
  try {
    const normalized = String(url || "").trim();
    if (!normalized) return fallback;

    const pathname = new URL(normalized).pathname;
    const lastPart = pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(lastPart || fallback);
  } catch {
    const parts = String(url || "").split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || fallback);
  }
}

export function normalizeAssignmentItem(item = {}) {
  const id = getAssignmentId(item);

  return {
    ...item,
    _id: id,
    id,
    title: item.title || "",
    description: item.description || "",
    dueDate: item.dueDate || "",
    maxScore:
      typeof item.maxScore === "number" ? item.maxScore : Number(item.maxScore) || 100,
    allowResubmit: item.allowResubmit ?? true,
    isPublished: !!item.isPublished,
    isOverdue: !!item.isOverdue,
    attachmentUrls: Array.isArray(item.attachmentUrls) ? item.attachmentUrls : [],
  };
}

export function normalizeAssignmentList(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeAssignmentItem);
}

export function normalizeSubmissionItem(item = {}) {
  const id = getSubmissionId(item);

  return {
    ...item,
    _id: id,
    id,
    assignmentId:
      typeof item.assignmentId === "object"
        ? item.assignmentId
        : item.assignmentId || "",
    status: item.status || "submitted",
    grade:
      item.grade === null || item.grade === undefined
        ? null
        : Number(item.grade),
    feedback: item.feedback || "",
    submissionText: item.submissionText || "",
    fileUrls: Array.isArray(item.fileUrls) ? item.fileUrls : [],
    submittedAt: item.submittedAt || "",
    resubmittedAt: item.resubmittedAt || "",
    createdAt: item.createdAt || "",
  };
}

export function normalizeSubmissionList(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeSubmissionItem);
}

export function buildSubmissionMap(submissions = []) {
  const map = {};

  for (const item of submissions) {
    const assignmentId = getAssignmentIdFromSubmission(item);
    if (assignmentId) {
      map[assignmentId] = item;
    }
  }

  return map;
}

export function getAssignmentStatusMeta(item) {
  if (item?.isOverdue) {
    return {
      label: "Overdue",
      variant: "overdue",
      cardTone: "assignment-manage-list__card--overdue",
    };
  }

  if (item?.isPublished) {
    return {
      label: "Published",
      variant: "published",
      cardTone: "assignment-manage-list__card--published",
    };
  }

  return {
    label: "Draft",
    variant: "draft",
    cardTone: "assignment-manage-list__card--draft",
  };
}

export function getSubmissionStatusMeta(status, allowResubmit = false) {
  if (status === "graded") {
    return {
      label: "Đã chấm",
      variant: "graded",
      helperText: "Instructor đã chấm bài và để lại nhận xét.",
      actionText: allowResubmit ? "Xem / Nộp lại" : "Xem kết quả",
    };
  }

  if (status === "resubmitted") {
    return {
      label: "Đã nộp lại",
      variant: "resubmitted",
      helperText: "Bạn đã nộp lại bài, đang chờ chấm.",
      actionText: "Xem bài",
    };
  }

  if (status === "overdue") {
    return {
      label: "Quá hạn",
      variant: "overdue",
      helperText: "Bài nộp này đã quá hạn.",
      actionText: "Xem bài",
    };
  }

  if (status === "submitted") {
    return {
      label: "Đã nộp",
      variant: "submitted",
      helperText: "Bạn đã nộp bài và đang chờ instructor chấm.",
      actionText: "Xem bài",
    };
  }

  return {
    label: "Chưa nộp",
    variant: "missing",
    helperText: "Bạn chưa nộp bài tập này.",
    actionText: "Làm bài",
  };
}

export function buildAssignmentFormInitialState() {
  return {
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
    allowResubmit: true,
    isPublished: true,
  };
}

export function buildAssignmentFormFromItem(item) {
  const normalized = normalizeAssignmentItem(item);

  return {
    title: normalized.title,
    description: normalized.description,
    dueDate: normalized.dueDate ? normalized.dueDate.slice(0, 16) : "",
    maxScore: normalized.maxScore ?? 100,
    allowResubmit: normalized.allowResubmit ?? true,
    isPublished: !!normalized.isPublished,
  };
}

export function buildAssignmentSavePayload({
  courseId,
  form,
  selectedAttachmentFiles = [],
  keptAttachmentUrls = [],
}) {
  return {
    courseId,
    title: String(form?.title || "").trim(),
    description: String(form?.description || "").trim(),
    dueDate: form?.dueDate || null,
    maxScore: Number(form?.maxScore) || 100,
    allowResubmit: !!form?.allowResubmit,
    isPublished: !!form?.isPublished,
    attachments: Array.isArray(selectedAttachmentFiles)
      ? selectedAttachmentFiles
      : [],
    keptAttachmentUrls: Array.isArray(keptAttachmentUrls)
      ? keptAttachmentUrls
      : [],
  };
}

export function validateAssignmentForm(form) {
  if (!String(form?.title || "").trim()) {
    return "Vui lòng nhập tiêu đề assignment";
  }

  const maxScore = Number(form?.maxScore);
  if (Number.isNaN(maxScore) || maxScore < 0) {
    return "Điểm tối đa không hợp lệ";
  }

  return "";
}

export function validateAssignmentSubmission({
  submissionText,
  selectedFiles = [],
}) {
  const hasText = String(submissionText || "").trim().length > 0;
  const hasFiles = Array.isArray(selectedFiles) && selectedFiles.length > 0;

  if (!hasText && !hasFiles) {
    return "Vui lòng nhập nội dung bài nộp hoặc chọn file";
  }

  return "";
}

export function validateGradePayload(score, maxScore) {
  if (score === "" || score === null || score === undefined) {
    return "Vui lòng nhập điểm hợp lệ";
  }

  const numericScore = Number(score);
  if (Number.isNaN(numericScore)) {
    return "Vui lòng nhập điểm hợp lệ";
  }

  if (numericScore < 0 || numericScore > Number(maxScore || 100)) {
    return `Điểm phải nằm trong khoảng 0 - ${Number(maxScore || 100)}`;
  }

  return "";
}

export function buildAssignmentResultsSummary(submissions = []) {
  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter((item) => item.status === "graded").length;
  const overdueCount = submissions.filter((item) => item.status === "overdue").length;
  const gradedItems = submissions.filter((item) => typeof item.grade === "number");

  const averageGrade = gradedItems.length
    ? Math.round(
        gradedItems.reduce((sum, item) => sum + Number(item.grade || 0), 0) /
          gradedItems.length
      )
    : 0;

  return {
    totalSubmissions,
    gradedCount,
    overdueCount,
    averageGrade,
  };
}