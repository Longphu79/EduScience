import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicCertificate } from "../services/certificate.service";
import Toast from "../../../shared/components/Toast";

export default function PublicCertificatePage() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await getPublicCertificate(code);

        const data = response?.data?.data || response?.data || response;
        setCertificate(data);
      } catch (error) {
        setToast({
          show: true,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không tìm thấy chứng chỉ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchCertificate();
    }
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p>Đang tải chứng chỉ...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        )}
        <p>Không có dữ liệu chứng chỉ.</p>
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
        <h1 className="text-2xl font-bold text-slate-900">
          Public Certificate Verification
        </h1>

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
      </div>
    </div>
  );
}