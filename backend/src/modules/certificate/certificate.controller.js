import * as certificateService from "./certificate.service.js";

export const generateCertificate = async (req, res) => {
  try {
    const data = await certificateService.generateCertificate({
      studentId: req.body.studentId || req.user?._id,
      courseId: req.body.courseId,
      studentName:
        req.body.studentName ||
        req.user?.username ||
        req.user?.email,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCertificateByCourseStudent = async (req, res) => {
  try {
    const data = await certificateService.getCertificateByCourseStudent(
      req.params.courseId,
      req.params.studentId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const data = await certificateService.getCertificateById(
      req.params.certificateId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const getCertificateByCode = async (req, res) => {
  try {
    const data = await certificateService.getCertificateByCode(req.params.code);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};