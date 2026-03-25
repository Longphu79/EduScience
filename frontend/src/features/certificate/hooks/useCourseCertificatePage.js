import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  generateCertificate,
  getCertificateByCourseStudent,
} from "../services/certificate.service";
import {
  getCertificateLink,
  getDisplayStudentName,
} from "../utils/certificate.helpers";

export default function useCourseCertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCertificateByCourseStudent(
          courseId,
          user?._id
        );
        setCertificate(data);
      } catch {
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    }

    if (courseId && user?._id) load();
  }, [courseId, user]);

  async function handleGenerate() {
    setGenerating(true);
    const data = await generateCertificate({
      courseId,
      studentId: user?._id,
      studentName: user?.fullName,
    });
    setCertificate(data);
    setGenerating(false);
  }

  return {
    certificate,
    loading,
    generating,
    publicLink: getCertificateLink(certificate?.certificateCode),
    studentName: getDisplayStudentName(certificate, user),
    handleGenerate,
  };
}