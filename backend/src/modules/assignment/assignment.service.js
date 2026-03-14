import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

async function ensureCourseOwnership(courseId, { requesterId, requesterRole } = {}) {
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

export const assignmentUnwrap = (res) => {
  return res?.data ?? res ?? null;
};

export const createAssignment = async (
  payload,
  { requesterId, requesterRole } = {}
) => {
  if (!payload?.courseId) {
    throw new Error("courseId is required");
  }

  await ensureCourseOwnership(payload.courseId, {
    requesterId,
    requesterRole,
  });

  return await Assignment.create({
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",
    courseId: payload.courseId,
    lessonId: payload.lessonId || null,
    instructorId: requesterRole === "admin"
      ? payload.instructorId || requesterId
      : requesterId,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    allowResubmit: payload.allowResubmit !== false,
    maxScore: Number(payload.maxScore) || 100,
    attachmentUrls: Array.isArray(payload.attachmentUrls)
      ? payload.attachmentUrls
      : [],
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : true,
  });
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

  return await AssignmentSubmission.create({
    assignmentId,
    studentId: payload.studentId,
    courseId: assignment.courseId,
    submissionText: payload.submissionText?.trim() || "",
    fileUrls: Array.isArray(payload.fileUrls) ? payload.fileUrls : [],
    status: "submitted",
  });
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

  submission.submissionText = payload.submissionText?.trim() || "";
  submission.fileUrls = Array.isArray(payload.fileUrls) ? payload.fileUrls : [];
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
      .sort({ createdAt: -1 });
  }

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  if (String(course.instructorId) !== String(requesterId)) {
    throw new Error("You are not allowed to view these submissions");
  }

  return await AssignmentSubmission.find({ studentId, courseId })
    .populate("assignmentId")
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

  const maxScore = Number(assignment.maxScore) || 100;
  const normalizedGrade = Math.max(
    0,
    Math.min(maxScore, Number(payload.grade) || 0)
  );

  submission.grade = normalizedGrade;
  submission.feedback = payload.feedback?.trim() || "";
  submission.status = "graded";
  submission.gradedAt = new Date();
  submission.gradedBy = payload.gradedBy || requesterId || null;

  await submission.save();
  return submission;
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

  const updatePayload = { ...payload };

  delete updatePayload.instructorId;
  delete updatePayload.courseId;
  delete updatePayload._id;

  if (typeof payload.title === "string") {
    updatePayload.title = payload.title.trim();
  }

  if (typeof payload.description === "string") {
    updatePayload.description = payload.description.trim();
  }

  if (payload.dueDate) {
    updatePayload.dueDate = new Date(payload.dueDate);
  }

  if (payload.maxScore !== undefined) {
    updatePayload.maxScore = Number(payload.maxScore) || 100;
  }

  if (Array.isArray(payload.attachmentUrls)) {
    updatePayload.attachmentUrls = payload.attachmentUrls;
  }

  if (payload.allowResubmit !== undefined) {
    updatePayload.allowResubmit = !!payload.allowResubmit;
  }

  if (payload.isPublished !== undefined) {
    updatePayload.isPublished = !!payload.isPublished;
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

  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

export const deleteAssignment = async (
  assignmentId,
  { requesterId, requesterRole } = {}
) => {
  await ensureAssignmentOwnership(assignmentId, {
    requesterId,
    requesterRole,
  });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await AssignmentSubmission.deleteMany({ assignmentId });
  await Assignment.findByIdAndDelete(assignmentId);

  return { success: true };
};