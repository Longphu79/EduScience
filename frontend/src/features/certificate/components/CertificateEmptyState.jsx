import "../styles/certificate-components.css";

export default function CertificateEmptyState({
  title = "No certificate found",
  text = "Certificate is not available.",
  actions = null,
}) {
  return (
    <div className="certificate-empty-state">
      <div className="certificate-empty-state__icon">🎓</div>

      <h2 className="certificate-empty-state__title">{title}</h2>

      <p className="certificate-empty-state__text">{text}</p>

      {actions && (
        <div className="certificate-empty-state__actions">
          {actions}
        </div>
      )}
    </div>
  );
}