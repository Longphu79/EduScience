import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import {
  certificateUnwrap,
  getCertificateByCode,
} from "../services/certificate.service";

function formatDate(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "N/A";
  }
}

function getDisplayStudentName(certificate) {
  return certificate?.studentName || "Student";
}

function CertificateShowcase({ certificate }) {
  const displayStudentName = getDisplayStudentName(certificate);
  const courseTitle = certificate?.courseTitle || "Completed Course";

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_32%)]" />

      <div className="relative p-5 md:p-8 lg:p-10">
        <div className="rounded-[28px] border border-dashed border-blue-200 bg-slate-50/70 px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-700 shadow-sm">
              Publicly Verified
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
              <p className="text-base text-slate-500">Presented to</p>

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
              <div className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
                Authentic certificate verified
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600">
                Issued by EduScience
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicCertificatePage() {
  const { code } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  useEffect(() => {
    let isMounted = true;

    async function loadCertificate() {
      try {
        setLoading(true);
        const res = await getCertificateByCode(code);
        const data = certificateUnwrap(res);

        if (isMounted) {
          setCertificate(data);
        }
      } catch (error) {
        if (isMounted) {
          setToast({
            message: error?.message || "Không tải được chứng chỉ công khai",
            kind: "error",
          });
          setCertificate(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (code) {
      loadCertificate();
    } else {
      setLoading(false);
      setCertificate(null);
    }

    return () => {
      isMounted = false;
    };
  }, [code]);

  const statusText = useMemo(() => {
    return certificate
      ? "Certificate verified successfully"
      : "Verification unavailable";
  }, [certificate]);

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
            Public Certificate
          </h1>
          <p className="mt-2 text-slate-600">
            Xác thực chứng chỉ hoàn thành khóa học
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {statusText}
          </div>

          <Link to="/">
            <Button type="button">Trang chủ</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Đang tải chứng chỉ...
        </div>
      ) : certificate ? (
        <CertificateShowcase certificate={certificate} />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Không tìm thấy chứng chỉ
          </h2>
          <p className="mt-3 text-slate-600">
            Link chứng chỉ không hợp lệ hoặc chứng chỉ đã không còn tồn tại.
          </p>

          <div className="mt-6">
            <Link to="/">
              <Button type="button">Về trang chủ</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}