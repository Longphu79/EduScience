import * as assignmentService from "./assignment.service.js";

export const createAssignment = async (req, res) => {
  try {
    const data = await assignmentService.createAssignment(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAssignmentsByCourse = async (req, res) => {
  try {
    const data = await assignmentService.getAssignmentsByCourse(
      req.params.courseId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const data = await assignmentService.getAssignmentById(
      req.params.assignmentId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const data = await assignmentService.submitAssignment(
      req.params.assignmentId,
      req.body
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resubmitAssignment = async (req, res) => {
  try {
    const data = await assignmentService.resubmitAssignment(
      req.params.assignmentId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    const data = await assignmentService.getStudentSubmissions(
      req.params.studentId,
      req.params.courseId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const data = await assignmentService.getSubmissionsByAssignment(
      req.params.assignmentId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const data = await assignmentService.gradeSubmission(
      req.params.submissionId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const data = await assignmentService.updateAssignment(
      req.params.assignmentId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const data = await assignmentService.deleteAssignment(
      req.params.assignmentId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};