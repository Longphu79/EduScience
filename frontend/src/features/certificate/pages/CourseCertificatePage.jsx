import { useMemo } from "react";
import Button from "../../../shared/components/Button";
import CertificateDetailsPanel from "../components/CertificateDetailsPanel";
import CertificateEmptyState from "../components/CertificateEmptyState";
import CertificateHeroCard from "../components/CertificateHeroCard";
import CertificateLinkPanel from "../components/CertificateLinkPanel";
import CertificatePreviewCard from "../components/CertificatePreviewCard";
import CertificateStatusPanel from "../components/CertificateStatusPanel";
import useCourseCertificatePage from "../hooks/useCourseCertificatePage";
import "../styles/certificate-components.css";
import "../styles/certificate-pages.css";

export default function CourseCertificatePage() {
  const {
    certificate,
    loading,
    generating,
    publicLink,
    studentName,
    handleGenerate,
  } = useCourseCertificatePage();

  const safePublicLink = useMemo(() => {
    if (publicLink) return publicLink;
    if (certificate?.certificateCode) {
      return `${window.location.origin}/certificate/${certificate.certificateCode}`;
    }
    return "";
  }, [publicLink, certificate]);

  async function handleCopyLink() {
    if (!safePublicLink) {
      window.alert("Chưa có public link để sao chép");
      return;
    }

    try {
      await navigator.clipboard.writeText(safePublicLink);
      window.alert("Đã sao chép link chứng chỉ");
    } catch {
      const input = document.createElement("input");
      input.value = safePublicLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      window.alert("Đã sao chép link chứng chỉ");
    }
  }

  if (loading) {
    return (
      <div className="certificate-page">
        <div className="certificate-page__state-card">Đang tải chứng chỉ...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="certificate-page">
        <CertificateEmptyState
          title="Chưa có chứng chỉ"
          text="Bạn chưa có chứng chỉ cho khóa học này."
          actions={
            <Button onClick={handleGenerate} loading={generating}>
              Generate Certificate
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <CertificateHeroCard
        title="Course Certificate"
        subtitle={`Certificate for ${studentName || certificate?.studentName || "Student"}`}
        statusText="Verified"
        statusVariant="success"
        actions={
          <Button type="button" onClick={() => window.print()}>
            Print
          </Button>
        }
      />

      <div className="certificate-page__grid">
        <div className="certificate-page__main">
          <CertificatePreviewCard certificate={certificate} />
          <CertificateDetailsPanel
            certificate={certificate}
            title="Certificate details"
          />
        </div>

        <aside className="certificate-page__sidebar">
          <CertificateStatusPanel
            title="Trạng thái xác thực"
            paragraphs={[
              "Chứng chỉ này đã được tạo sau khi hoàn thành khóa học.",
              "Bạn có thể dùng liên kết công khai bên dưới để xác minh.",
            ]}
            statusTitle="Verified"
            statusText={certificate?.certificateCode || "Certificate is valid"}
            variant="info"
          />

          <CertificateLinkPanel
            title="Public verification link"
            link={safePublicLink}
            onCopy={handleCopyLink}
            showPrint
            onPrint={() => window.print()}
          />
        </aside>
      </div>
    </div>
  );
}