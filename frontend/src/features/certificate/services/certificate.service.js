import request from "../../../services/request";

export const getCertificateByCourseStudent = (courseId, studentId = "me") =>
  request.get(`/certificate/course/${courseId}/student/${studentId}`);

export const generateCertificate = (payload) =>
  request.post("/certificate/generate", payload);

export const getPublicCertificate = (code) =>
  request.get(`/certificate/public/${code}`);