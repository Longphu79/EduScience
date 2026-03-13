import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCertificateByCourseStudent,
  generateCertificate,
} from "../services/certificate.service";
import Toast from "../../../shared/components/Toast";

export default function CertificatePage() {
  const { courseId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await getCertificateByCourseStudent(courseId);

        const data = response?.data?.data || response?.data || response;
        setCertificate(data);
      } catch {
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCertificate();
    }
  }, [courseId]);

  const handleGenerateCertificate = async () => {
    try {
      setGenerating(true);
      const response = await generateCertificate({ courseId });
      const data = response?.data?.data || response?.data || response;

      setCertificate(data);
      setToast({
        show: true,
        message: "Tạo chứng chỉ thành công",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo chứng chỉ",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p>Đang tải chứng chỉ...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Certificate</h1>

        {!certificate ? (
          <div className="mt-6 space-y-4">
            <p className="text-slate-600">
              Chưa có chứng chỉ cho khóa học này.
            </p>

            <button
              type="button"
              onClick={handleGenerateCertificate}
              disabled={generating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {generating ? "Đang tạo..." : "Tạo chứng chỉ"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3 text-slate-700">
            <p>
              <strong>Mã chứng chỉ:</strong>{" "}
              {certificate.certificateCode || certificate.code}
            </p>
            <p>
              <strong>Học viên:</strong> {certificate.studentName || "N/A"}
            </p>
            <p>
              <strong>Khóa học:</strong> {certificate.courseTitle || "N/A"}
            </p>
            <p>
              <strong>Ngày hoàn thành:</strong>{" "}
              {certificate.completionDate
                ? new Date(certificate.completionDate).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
            <p>
              <strong>Ngày cấp:</strong>{" "}
              {certificate.issuedAt
                ? new Date(certificate.issuedAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}