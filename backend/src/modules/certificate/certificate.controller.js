import * as certificateService from "./certificate.service.js";

export const generateCertificate = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can generate certificate",
      });
    }

    const data = await certificateService.generateCertificate({
      studentId: requesterRole === "admin" && req.body.studentId
        ? req.body.studentId
        : requesterId,
      courseId: req.body.courseId,
      studentName:
        req.body.studentName || req.user?.username || req.user?.email,
    });

    res.status(201).json({
      success: true,
      message: "Generate certificate successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Enrollment not found"
        ? 404
        : err.message === "Course not found"
        ? 404
        : err.message === "Course not completed"
        ? 400
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCertificateByCourseStudent = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId, studentId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this certificate",
      });
    }

    const data = await certificateService.getCertificateByCourseStudent(
      courseId,
      studentId
    );

    res.status(200).json({
      success: true,
      message: "Get certificate successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await certificateService.getCertificateById(
      req.params.certificateId
    );

    const isOwner = String(data.studentId?._id || data.studentId) === String(requesterId);
    const isAdmin = requesterRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this certificate",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get certificate by id successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCertificateByCode = async (req, res) => {
  try {
    const data = await certificateService.getCertificateByCode(req.params.code);

    res.status(200).json({
      success: true,
      message: "Get public certificate successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};