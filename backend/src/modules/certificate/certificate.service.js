import Certificate from "./certificate.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../user/user.model.js";

function generateCertificateCode(courseId, studentId) {
  return `CERT-${String(courseId).slice(-6).toUpperCase()}-${String(studentId)
    .slice(-6)
    .toUpperCase()}-${Date.now()}`;
}

export const generateCertificate = async ({ studentId, courseId, studentName }) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) throw new Error("Enrollment not found");
  if (Number(enrollment.progress) < 100 && !enrollment.completed) {
    throw new Error("Course not completed");
  }

  const existed = await Certificate.findOne({ studentId, courseId });
  if (existed) return existed;

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const user = await User.findById(studentId);

  const cert = await Certificate.create({
    certificateCode: generateCertificateCode(courseId, studentId),
    studentId,
    courseId,
    instructorId: course.instructorId,
    studentName: studentName || user?.username || user?.email || "Student",
    courseTitle: course.title,
    completionDate: enrollment.updatedAt || new Date(),
    issuedAt: new Date(),
  });

  return cert;
};

export const getCertificateByCourseStudent = async (courseId, studentId) => {
  const cert = await Certificate.findOne({ courseId, studentId });
  if (!cert) throw new Error("Certificate not found");
  return cert;
};

export const getCertificateById = async (certificateId) => {
  const cert = await Certificate.findById(certificateId);
  if (!cert) throw new Error("Certificate not found");
  return cert;
};

export const getCertificateByCode = async (certificateCode) => {
  const cert = await Certificate.findOne({ certificateCode });
  if (!cert) throw new Error("Certificate not found");
  return cert;
};