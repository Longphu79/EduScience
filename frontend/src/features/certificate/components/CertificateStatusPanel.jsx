import "../styles/certificate-components.css";

export default function CertificateStatusPanel({
  title = "Trạng thái xác thực",
  paragraphs = [],
  statusTitle = "Verified",
  statusText = "",
  variant = "info",
}) {
  return (
    <div className="certificate-panel">
      <div className="certificate-panel__title">{title}</div>

      <div className="certificate-panel__text-stack">
        {paragraphs.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      <div
        className={`certificate-panel__status-box certificate-panel__status-box--${variant}`}
      >
        <div className="certificate-panel__status-title">{statusTitle}</div>
        <div className="certificate-panel__status-text">{statusText}</div>
      </div>
    </div>
  );
}