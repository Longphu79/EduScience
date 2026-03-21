import {
  formatDateTime,
  getDisplayStudentName,
} from "../utils/certificate.helpers";
import "../styles/certificate-components.css";

export default function CertificateDetailsPanel({
  certificate,
  user = null,
  title = "Certificate details",
}) {
  return (
    <div className="certificate-panel">
      <div className="certificate-panel__title">{title}</div>

      <div className="certificate-panel__details-grid">
        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">Student name</div>
          <div className="certificate-panel__detail-value">
            {getDisplayStudentName(certificate, user)}
          </div>
        </div>

        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">Instructor name</div>
          <div className="certificate-panel__detail-value">
            {certificate?.instructorName || "Instructor"}
          </div>
        </div>

        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">
            Certificate code
          </div>
          <div className="certificate-panel__detail-value certificate-panel__detail-value--break">
            {certificate?.certificateCode || "N/A"}
          </div>
        </div>

        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">Course title</div>
          <div className="certificate-panel__detail-value">
            {certificate?.courseTitle || "N/A"}
          </div>
        </div>

        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">
            Completion date
          </div>
          <div className="certificate-panel__detail-value">
            {formatDateTime(certificate?.completionDate)}
          </div>
        </div>

        <div className="certificate-panel__detail-card">
          <div className="certificate-panel__detail-label">Issued at</div>
          <div className="certificate-panel__detail-value">
            {formatDateTime(certificate?.issuedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}