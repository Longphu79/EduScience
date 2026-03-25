import "../styles/certificate-components.css";

export default function CertificateHeroCard({
  title,
  subtitle,
  statusText = "",
  statusVariant = "default",
  actions = null,
}) {
  return (
    <div className="certificate-hero-card print-hide">
      <div className="certificate-hero-card__layout">
        <div>
          <h1 className="certificate-hero-card__title">{title}</h1>
          <p className="certificate-hero-card__subtitle">{subtitle}</p>
        </div>

        <div className="certificate-hero-card__actions">
          {statusText ? (
            <div
              className={`certificate-hero-card__status certificate-hero-card__status--${statusVariant}`}
            >
              {statusText}
            </div>
          ) : null}

          {actions}
        </div>
      </div>
    </div>
  );
}