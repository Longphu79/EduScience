import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";
import {
  certificateUnwrap,
  generateCertificate,
  getCertificateByCourseStudent,
} from "../services/certificate.service";

function formatDate(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "N/A";
  }
}

function getDisplayStudentName(certificate, user) {
  return (
    certificate?.studentName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Student"
  );
}

function getCertificateLink(code) {
  return `${window.location.origin}/certificate/${code}`;
}

function CertificateCard({ certificate, user }) {
  const displayStudentName = getDisplayStudentName(certificate, user);
  const courseTitle = certificate?.courseTitle || "Completed Course";

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_32%)]" />

      <div className="relative p-5 md:p-8 lg:p-10">
        <div className="rounded-[28px] border border-dashed border-blue-200 bg-slate-50/70 px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-700 shadow-sm">
              Verified Certificate
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium uppercase tracking-[0.4em] text-slate-400">
                EduScience
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                CERTIFICATE
              </h1>
              <p className="mt-2 text-xl text-slate-600 md:text-2xl">
                of Completion
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-base text-slate-500">
                This certificate is proudly presented to
              </p>

              <h2 className="break-words text-3xl font-extrabold text-blue-600 md:text-5xl">
                {displayStudentName}
              </h2>

              <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                for successfully completing the course
              </p>

              <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="break-words text-2xl font-black text-slate-950 md:text-4xl">
                  {courseTitle}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Certificate code
                </div>
                <div className="mt-3 break-all text-sm font-extrabold text-slate-900 md:text-base">
                  {certificate?.certificateCode || "N/A"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Completion date
                </div>
                <div className="mt-3 text-xl font-black text-slate-900">
                  {formatDate(certificate?.completionDate)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Issued at
                </div>
                <div className="mt-3 text-xl font-black text-slate-900">
                  {formatDate(certificate?.issuedAt)}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
              <div className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                Issued by EduScience
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600">
                Verified public certificate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseCertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const studentId = useMemo(
    () => user?._id || user?.id || user?.userId || null,
    [user]
  );

  const loadCertificate = useCallback(async () => {
    if (!courseId || !studentId) {
      setCertificate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCertificateByCourseStudent(courseId, studentId);
      setCertificate(certificateUnwrap(res));
    } catch {
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, studentId]);

  useEffect(() => {
    loadCertificate();
  }, [loadCertificate]);

  async function handleGenerateCertificate() {
    try {
      if (!courseId) {
        throw new Error("Thiếu thông tin khóa học");
      }

      setGenerating(true);

      const res = await generateCertificate({
        courseId,
        studentName:
          user?.fullName || user?.name || user?.username || user?.email,
      });

      const data = certificateUnwrap(res);
      setCertificate(data);

      setToast({
        message: "Tạo chứng chỉ thành công",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể tạo chứng chỉ",
        kind: "error",
      });
    } finally {
      setGenerating(false);
    }
  }

  const publicLink = certificate?.certificateCode
    ? getCertificateLink(certificate.certificateCode)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Course Certificate
          </h1>
          <p className="mt-2 text-slate-600">
            Xem và xác thực chứng chỉ hoàn thành khóa học của bạn
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`/learn/${courseId}`}>
            <Button type="button">Quay lại khóa học</Button>
          </Link>

          {!certificate ? (
            <Button
              type="button"
              onClick={handleGenerateCertificate}
              loading={generating}
              disabled={generating}
            >
              Generate Certificate
            </Button>
          ) : (
            <>
              <a href={publicLink} target="_blank" rel="noreferrer">
                <Button type="button">Open Public Link</Button>
              </a>

              <Button type="button" onClick={() => window.print()}>
                Print Certificate
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Đang tải chứng chỉ...
        </div>
      ) : certificate ? (
        <>
          <CertificateCard certificate={certificate} user={user} />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-sm font-semibold text-slate-500">
                  Public verification link
                </div>
                <div className="mt-2 break-all rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {publicLink}
                </div>
              </div>

              <Button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicLink);
                    setToast({
                      message: "Đã sao chép link chứng chỉ",
                      kind: "success",
                    });
                  } catch {
                    setToast({
                      message: "Không thể sao chép link",
                      kind: "error",
                    });
                  }
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-black text-slate-950">
              Chưa có chứng chỉ cho khóa học này
            </h2>
            <p className="mt-3 text-slate-600">
              Nếu bạn đã hoàn thành khóa học, hãy nhấn nút bên dưới để tạo chứng
              chỉ.
            </p>

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGenerateCertificate}
                loading={generating}
                disabled={generating}
              >
                Generate Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}