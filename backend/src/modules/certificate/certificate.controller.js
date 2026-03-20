import * as certificateService from "./certificate.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const generateCertificate = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can generate certificate",
      });
    }

    const data = await certificateService.generateCertificate({
      studentId:
        requesterRole === "admin" && req.body.studentId
          ? req.body.studentId
          : requesterId,
      courseId: req.body.courseId,
      studentName:
        req.body.studentName ||
        req.user?.fullName ||
        req.user?.username ||
        req.user?.email,
    });

    return sendSuccess(res, {
      statusCode: 201,
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

    return sendError(res, {
      statusCode: status,
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
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "admin" && String(requesterId) !== String(studentId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view this certificate",
      });
    }

    const data = await certificateService.getCertificateByCourseStudent(
      courseId,
      studentId
    );

    return sendSuccess(res, {
      message: "Get certificate successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await certificateService.getCertificateById(
      req.params.certificateId
    );

    const isOwner =
      String(data.studentId?._id || data.studentId) === String(requesterId);
    const isAdmin = requesterRole === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view this certificate",
      });
    }

    return sendSuccess(res, {
      message: "Get certificate by id successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getCertificateByCode = async (req, res) => {
  try {
    const data = await certificateService.getCertificateByCode(req.params.code);

    return sendSuccess(res, {
      message: "Get public certificate successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Certificate not found" ? 404 : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};