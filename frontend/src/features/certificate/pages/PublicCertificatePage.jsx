import { useMemo } from "react";
import CertificateDetailsPanel from "../components/CertificateDetailsPanel";
import CertificateEmptyState from "../components/CertificateEmptyState";
import CertificateHeroCard from "../components/CertificateHeroCard";
import CertificatePreviewCard from "../components/CertificatePreviewCard";
import CertificateStatusPanel from "../components/CertificateStatusPanel";
import CertificateLinkPanel from "../components/CertificateLinkPanel";
import usePublicCertificatePage from "../hooks/usePublicCertificatePage";
import "../styles/certificate-components.css";
import "../styles/certificate-pages.css";

export default function PublicCertificatePage() {
  const { certificate, loading } = usePublicCertificatePage();

  const safePublicLink = useMemo(() => {
    if (!certificate?.certificateCode) return "";
    return `${window.location.origin}/certificate/${certificate.certificateCode}`;
  }, [certificate]);

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
        <div className="certificate-page__state-card">
          Đang tải chứng chỉ công khai...
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="certificate-page">
        <CertificateEmptyState title="Không tìm thấy chứng chỉ" />
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <CertificateHeroCard
        title="Public Certificate"
        subtitle={`Issued to ${certificate?.studentName || "Student"}`}
        statusText="Verified"
        statusVariant="success"
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
            title="Verification status"
            paragraphs={[
              "This is a public certificate page.",
              "Use the link below to share or verify this certificate.",
            ]}
            statusTitle="Verified"
            statusText={certificate?.certificateCode || "Certificate is valid"}
            variant="info"
          />

          <CertificateLinkPanel
            title="Public verification link"
            link={safePublicLink}
            onCopy={handleCopyLink}
          />
        </aside>
      </div>
    </div>
  );
}