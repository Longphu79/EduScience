import { formatDate } from "../utils/certificate.helpers";
import "../styles/certificate-components.css";

export default function CertificatePreviewCard({
  certificate,
  studentName,
  variant = "private",
}) {
  const courseTitle = certificate?.courseTitle || "Completed Course";
  const instructorName = certificate?.instructorName || "Instructor";

  const config =
    variant === "public"
      ? {
          badgeText: "Publicly Verified",
          badgeClass: "certificate-preview-card__badge--public",
          borderClass: "certificate-preview-card__frame--public",
          overlayClass: "certificate-preview-card__overlay--public",
          footerPrimary: "Authentic certificate verified",
          footerPrimaryClass:
            "certificate-preview-card__footer-pill--public-primary",
          footerSecondary: "Issued by EduScience",
        }
      : {
          badgeText: "Verified Certificate",
          badgeClass: "certificate-preview-card__badge--private",
          borderClass: "certificate-preview-card__frame--private",
          overlayClass: "certificate-preview-card__overlay--private",
          footerPrimary: "Issued by EduScience",
          footerPrimaryClass:
            "certificate-preview-card__footer-pill--private-primary",
          footerSecondary: "Verified public certificate",
        };

  return (
    <div className="certificate-preview-card certificate-print-area">
      <div
        className={`certificate-preview-card__overlay ${config.overlayClass}`}
      />

      <div className="certificate-preview-card__inner">
        <div
          className={`certificate-preview-card__frame ${config.borderClass}`}
        >
          <div className="certificate-preview-card__content">
            <div
              className={`certificate-preview-card__badge ${config.badgeClass}`}
            >
              {config.badgeText}
            </div>

            <div className="certificate-preview-card__heading">
              <p className="certificate-preview-card__brand">EduScience</p>
              <h1 className="certificate-preview-card__title">CERTIFICATE</h1>
              <p className="certificate-preview-card__subtitle">
                of Completion
              </p>
            </div>

            <div className="certificate-preview-card__body">
              <p className="certificate-preview-card__lead">
                {variant === "public"
                  ? "Presented to"
                  : "This certificate is proudly presented to"}
              </p>

              <h2 className="certificate-preview-card__student-name">
                {studentName}
              </h2>

              <p className="certificate-preview-card__description">
                for successfully completing the course
              </p>

              <div className="certificate-preview-card__course-box">
                <p className="certificate-preview-card__course-title">
                  {courseTitle}
                </p>
              </div>

              <p className="certificate-preview-card__instructor">
                Instructor:{" "}
                <span className="certificate-preview-card__instructor-name">
                  {instructorName}
                </span>
              </p>
            </div>

            <div className="certificate-preview-card__meta-grid">
              <div className="certificate-preview-card__meta-card">
                <div className="certificate-preview-card__meta-label">
                  Certificate code
                </div>
                <div className="certificate-preview-card__meta-value certificate-preview-card__meta-value--break">
                  {certificate?.certificateCode || "N/A"}
                </div>
              </div>

              <div className="certificate-preview-card__meta-card">
                <div className="certificate-preview-card__meta-label">
                  Completion date
                </div>
                <div className="certificate-preview-card__meta-value certificate-preview-card__meta-value--large">
                  {formatDate(certificate?.completionDate)}
                </div>
              </div>

              <div className="certificate-preview-card__meta-card">
                <div className="certificate-preview-card__meta-label">
                  Issued at
                </div>
                <div className="certificate-preview-card__meta-value certificate-preview-card__meta-value--large">
                  {formatDate(certificate?.issuedAt)}
                </div>
              </div>
            </div>

            <div className="certificate-preview-card__footer">
              <div
                className={`certificate-preview-card__footer-pill ${config.footerPrimaryClass}`}
              >
                {config.footerPrimary}
              </div>
              <div className="certificate-preview-card__footer-pill certificate-preview-card__footer-pill--secondary">
                {config.footerSecondary}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}