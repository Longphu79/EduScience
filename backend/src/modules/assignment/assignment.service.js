import fs from "fs";
import path from "path";
import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

const ASSIGNMENT_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "assignments"
);

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function normalizeUrlList(value) {
  return ensureArray(value)
    .flatMap((item) => {
      if (typeof item !== "string") return [String(item || "").trim()];

      const trimmed = item.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x || "").trim());
        }
      } catch {
        // ignore JSON parse error
      }

      if (trimmed.includes(",")) {
        return trimmed.split(",").map((x) => x.trim());
      }

      return [trimmed];
    })
    .filter(Boolean);
}

function safeDeleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("safeDeleteFile error:", error.message);
  }
}

function urlToLocalAssignmentPath(url = "") {
  const normalized = String(url || "").trim();
  if (!normalized) return null;

  const marker = "/uploads/assignments/";
  const markerIndex = normalized.indexOf(marker);

  if (markerIndex === -1) return null;

  const fileName = normalized.slice(markerIndex + marker.length).trim();
  if (!fileName) return null;

  return path.join(ASSIGNMENT_UPLOAD_DIR, fileName);
}

function cleanupRemovedFiles(previousUrls = [], nextUrls = []) {
  const prev = new Set(normalizeUrlList(previousUrls));
  const next = new Set(normalizeUrlList(nextUrls));

  for (const url of prev) {
    if (!next.has(url)) {
      const localPath = urlToLocalAssignmentPath(url);
      safeDeleteFile(localPath);
    }
  }
}

function cleanupAllFiles(urls = []) {
  for (const url of normalizeUrlList(urls)) {
    const localPath = urlToLocalAssignmentPath(url);
    safeDeleteFile(localPath);
  }
}

async function ensureCourseOwnership(
  courseId,
  { requesterId, requesterRole } = {}
) {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to manage assignments of this course");
  }

  return course;
}

async function ensureAssignmentOwnership(
  assignmentId,
  { requesterId, requesterRole } = {}
) {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (
    requesterRole !== "admin" &&
    String(assignment.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to manage this assignment");
  }

  return assignment;
}

export const createAssignment = async (
  payload,
  { requesterId, requesterRole } = {}
) => {
  if (!payload?.courseId) {
    throw new Error("courseId is required");
  }

  if (!payload?.title || !String(payload.title).trim()) {
    throw new Error("title is required");
  }

  await ensureCourseOwnership(payload.courseId, {
    requesterId,
    requesterRole,
  });

  const created = await Assignment.create({
    title: String(payload.title).trim(),
    description: String(payload.description || "").trim(),
    courseId: payload.courseId,
    lessonId: payload.lessonId || null,
    instructorId:
      requesterRole === "admin"
        ? payload.instructorId || requesterId
        : requesterId,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    allowResubmit: payload.allowResubmit !== false,
    maxScore: Number(payload.maxScore) || 100,
    attachmentUrls: normalizeUrlList(payload.attachmentUrls),
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : true,
  });

  return created;
};

export const getAssignmentsByCourse = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const baseQuery = { courseId };

  if (!user) {
    return await Assignment.find({
      ...baseQuery,
      isPublished: true,
    }).sort({ createdAt: -1 });
  }

  if (user.role === "student") {
    const enrolled = await Enrollment.findOne({
      courseId,
      studentId: user._id,
    });

    if (!enrolled) {
      throw new Error("You are not allowed to view assignments of this course");
    }

    return await Assignment.find({
      ...baseQuery,
      isPublished: true,
    }).sort({ createdAt: -1 });
  }

  if (
    user.role === "instructor" &&
    String(course.instructorId) === String(user._id)
  ) {
    return await Assignment.find(baseQuery).sort({ createdAt: -1 });
  }

  if (user.role === "admin") {
    return await Assignment.find(baseQuery).sort({ createdAt: -1 });
  }

  return await Assignment.find({
    ...baseQuery,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const getAssignmentById = async (assignmentId, user) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  const course = await Course.findById(assignment.courseId);
  if (!course) throw new Error("Course not found");

  if (!user) {
    if (!assignment.isPublished) {
      throw new Error("You are not allowed to view this assignment");
    }
    return assignment;
  }

  if (user.role === "admin") return assignment;

  if (
    user.role === "instructor" &&
    String(course.instructorId) === String(user._id)
  ) {
    return assignment;
  }

  if (user.role === "student") {
    const enrolled = await Enrollment.findOne({
      courseId: assignment.courseId,
      studentId: user._id,
    });

    if (!enrolled) {
      throw new Error("You are not allowed to view this assignment");
    }

    if (!assignment.isPublished) {
      throw new Error("You are not allowed to view this assignment");
    }

    return assignment;
  }

  if (!assignment.isPublished) {
    throw new Error("You are not allowed to view this assignment");
  }

  return assignment;
};

export const submitAssignment = async (assignmentId, payload) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  if (!assignment.isPublished) {
    throw new Error("Assignment is not available");
  }

  const enrollment = await Enrollment.findOne({
    courseId: assignment.courseId,
    studentId: payload.studentId,
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  const existingSubmission = await AssignmentSubmission.findOne({
    assignmentId,
    studentId: payload.studentId,
  });

  if (existingSubmission) {
    throw new Error("You have already submitted this assignment");
  }

  const created = await AssignmentSubmission.create({
    assignmentId,
    studentId: payload.studentId,
    courseId: assignment.courseId,
    submissionText: String(payload.submissionText || "").trim(),
    fileUrls: normalizeUrlList(payload.fileUrls),
    status: "submitted",
  });

  return created;
};

export const resubmitAssignment = async (assignmentId, payload) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  if (!assignment.allowResubmit) {
    throw new Error("Resubmission is not allowed for this assignment");
  }

  const enrollment = await Enrollment.findOne({
    courseId: assignment.courseId,
    studentId: payload.studentId,
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  const submission = await AssignmentSubmission.findOne({
    assignmentId,
    studentId: payload.studentId,
  });

  if (!submission) {
    throw new Error("No submission found to resubmit");
  }

  const nextFileUrls = normalizeUrlList(payload.fileUrls);

  cleanupRemovedFiles(submission.fileUrls || [], nextFileUrls);

  submission.submissionText = String(payload.submissionText || "").trim();
  submission.fileUrls = nextFileUrls;
  submission.status = "resubmitted";
  submission.resubmittedAt = new Date();

  await submission.save();
  return submission;
};

export const getStudentSubmissions = async (
  studentId,
  courseId,
  { requesterId, requesterRole } = {}
) => {
  if (requesterRole === "admin" || String(requesterId) === String(studentId)) {
    return await AssignmentSubmission.find({ studentId, courseId })
      .populate("assignmentId")
      .populate("gradedBy", "username email fullName")
      .sort({ createdAt: -1 });
  }

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  if (String(course.instructorId) !== String(requesterId)) {
    throw new Error("You are not allowed to view these submissions");
  }

  return await AssignmentSubmission.find({ studentId, courseId })
    .populate("assignmentId")
    .populate("gradedBy", "username email fullName")
    .sort({ createdAt: -1 });
};

export const getSubmissionsByAssignment = async (
  assignmentId,
  { requesterId, requesterRole } = {}
) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  if (
    requesterRole !== "admin" &&
    String(assignment.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to view submissions of this assignment");
  }

  return await AssignmentSubmission.find({ assignmentId })
    .populate("studentId", "username email fullName")
    .populate("gradedBy", "username email fullName")
    .sort({ createdAt: -1 });
};

export const gradeSubmission = async (
  submissionId,
  payload,
  { requesterId, requesterRole } = {}
) => {
  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  const assignment = await Assignment.findById(submission.assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  if (
    requesterRole !== "admin" &&
    String(assignment.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to grade this submission");
  }

  if (payload?.grade === undefined || payload?.grade === null || payload?.grade === "") {
    throw new Error("grade is required");
  }

  const maxScore = Number(assignment.maxScore) || 100;
  const rawGrade = Number(payload.grade);

  if (Number.isNaN(rawGrade)) {
    throw new Error("grade must be a valid number");
  }

  const normalizedGrade = Math.max(0, Math.min(maxScore, rawGrade));

  submission.grade = normalizedGrade;
  submission.feedback = String(payload.feedback || "").trim();
  submission.status = "graded";
  submission.gradedAt = new Date();
  submission.gradedBy = payload.gradedBy || requesterId || null;

  await submission.save();

  return await AssignmentSubmission.findById(submission._id)
    .populate("studentId", "username email fullName")
    .populate("gradedBy", "username email fullName");
};

export const updateAssignment = async (
  assignmentId,
  payload,
  { requesterId, requesterRole } = {}
) => {
  const existingAssignment = await ensureAssignmentOwnership(assignmentId, {
    requesterId,
    requesterRole,
  });

  const previousAttachmentUrls = normalizeUrlList(
    existingAssignment.attachmentUrls
  );

  const updatePayload = {};

  if (payload.title !== undefined) {
    updatePayload.title = String(payload.title || "").trim();
  }

  if (payload.description !== undefined) {
    updatePayload.description = String(payload.description || "").trim();
  }

  if (payload.dueDate !== undefined) {
    updatePayload.dueDate =
      payload.dueDate === "" || payload.dueDate === null
        ? null
        : new Date(payload.dueDate);
  }

  if (payload.maxScore !== undefined) {
    updatePayload.maxScore = Number(payload.maxScore) || 100;
  }

  if (payload.attachmentUrls !== undefined) {
    updatePayload.attachmentUrls = normalizeUrlList(payload.attachmentUrls);
  }

  if (payload.allowResubmit !== undefined) {
    updatePayload.allowResubmit =
      payload.allowResubmit === true || payload.allowResubmit === "true";
  }

  if (payload.isPublished !== undefined) {
    updatePayload.isPublished =
      payload.isPublished === true || payload.isPublished === "true";
  }

  if (payload.lessonId !== undefined) {
    updatePayload.lessonId = payload.lessonId || null;
  }

  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  cleanupRemovedFiles(previousAttachmentUrls, assignment.attachmentUrls || []);

  return assignment;
};

export const deleteAssignment = async (
  assignmentId,
  { requesterId, requesterRole } = {}
) => {
  const assignment = await ensureAssignmentOwnership(assignmentId, {
    requesterId,
    requesterRole,
  });

  const submissions = await AssignmentSubmission.find({ assignmentId });

  cleanupAllFiles(assignment.attachmentUrls || []);

  for (const submission of submissions) {
    cleanupAllFiles(submission.fileUrls || []);
  }

  await AssignmentSubmission.deleteMany({ assignmentId });
  await Assignment.findByIdAndDelete(assignmentId);

  return { success: true };
};