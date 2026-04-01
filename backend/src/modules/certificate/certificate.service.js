import Certificate from "./certificate.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../user/user.model.js";
import { awardXp, XP_RULES } from "../gamification/gamification.service.js";

function generateCertificateCode(courseId, studentId) {
    const coursePart = String(courseId).slice(-6).toUpperCase();
    const studentPart = String(studentId).slice(-6).toUpperCase();
    const timePart = Date.now();
    return `CERT-${coursePart}-${studentPart}-${timePart}`;
}

function getDisplayStudentName(user, fallbackName = "") {
    return (
        fallbackName ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email ||
        "Student"
    );
}

function getDisplayInstructorName(user) {
    return (
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email ||
        "Instructor"
    );
}

export const generateCertificate = async ({
    studentId,
    courseId,
    studentName,
}) => {
    if (!studentId || !courseId) {
        throw new Error("studentId and courseId are required");
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    if (Number(enrollment.progress || 0) < 100 && !enrollment.completed) {
        throw new Error("Course not completed");
    }

    const existed = await Certificate.findOne({ studentId, courseId })
        .populate("studentId")
        .populate("courseId")
        .populate("instructorId");

    if (existed) {
        return existed;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    const student = await User.findById(studentId);
    const instructor = await User.findById(course.instructorId);

    const cert = await Certificate.create({
        certificateCode: generateCertificateCode(courseId, studentId),
        studentId,
        courseId,
        instructorId: course.instructorId,
        studentName: getDisplayStudentName(student, studentName),
        instructorName: getDisplayInstructorName(instructor),
        courseTitle: course.title || "Completed Course",
        completionDate:
            enrollment.completedAt || enrollment.updatedAt || new Date(),
        issuedAt: new Date(),
    });

    await awardXp({
        studentId,
        type: "earn_certificate",
        xpEarned: XP_RULES.EARN_CERTIFICATE,
        sourceId: cert._id,
        sourceType: "Certificate",
        meta: { courseId },
    });

    return Certificate.findById(cert._id)
        .populate("studentId")
        .populate("courseId")
        .populate("instructorId");
};

export const getCertificateByCourseStudent = async (courseId, studentId) => {
    const cert = await Certificate.findOne({ courseId, studentId })
        .populate("studentId")
        .populate("courseId")
        .populate("instructorId");

    if (!cert) {
        throw new Error("Certificate not found");
    }

    return cert;
};

export const getCertificateById = async (certificateId) => {
    const cert = await Certificate.findById(certificateId)
        .populate("studentId")
        .populate("courseId")
        .populate("instructorId");

    if (!cert) {
        throw new Error("Certificate not found");
    }

    return cert;
};

export const getCertificateByCode = async (certificateCode) => {
    const cert = await Certificate.findOne({ certificateCode })
        .populate("studentId")
        .populate("courseId")
        .populate("instructorId");

    if (!cert) {
        throw new Error("Certificate not found");
    }

    return cert;
};
