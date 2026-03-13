import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

export const assignmentUnwrap = (res) => {
  return res?.data ?? res ?? null;
};

export const createAssignment = async (payload) => {
  const course = await Course.findById(payload.courseId);
  if (!course) throw new Error("Course not found");

  return Assignment.create({
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",
    courseId: payload.courseId,
    lessonId: payload.lessonId || null,
    instructorId: payload.instructorId,
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

export const getAssignmentsByCourse = async (courseId) => {
  return Assignment.find({
    courseId,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const getAssignmentById = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

export const submitAssignment = async (assignmentId, payload) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

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

  return AssignmentSubmission.create({
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

export const getStudentSubmissions = async (studentId, courseId) => {
  return AssignmentSubmission.find({ studentId, courseId })
    .populate("assignmentId")
    .sort({ createdAt: -1 });
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  return AssignmentSubmission.find({ assignmentId })
    .populate("studentId", "username email")
    .populate("gradedBy", "username email")
    .sort({ createdAt: -1 });
};

export const gradeSubmission = async (submissionId, payload) => {
  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  submission.grade = Number(payload.grade) || null;
  submission.feedback = payload.feedback?.trim() || "";
  submission.status = "graded";
  submission.gradedAt = new Date();
  submission.gradedBy = payload.gradedBy || null;

  await submission.save();
  return submission;
};

export const updateAssignment = async (assignmentId, payload) => {
  const updatePayload = { ...payload };

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

  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    updatePayload,
    { new: true }
  );

  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

export const deleteAssignment = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await AssignmentSubmission.deleteMany({ assignmentId });
  await Assignment.findByIdAndDelete(assignmentId);

  return { success: true };
};