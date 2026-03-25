import Button from "../../../shared/components/Button";
import "../styles/certificate-components.css";

export default function CertificateLinkPanel({
  title = "Public verification link",
  link = "",
  copyLabel = "Copy Link",
  openLabel = "Open Public Page",
  showPrint = false,
  onCopy,
  onPrint,
}) {
  return (
    <div className="certificate-panel">
      <div className="certificate-panel__title">{title}</div>

      <div className="certificate-panel__link-box">{link || "N/A"}</div>

      <div className="certificate-panel__actions">
        <Button type="button" onClick={onCopy}>
          {copyLabel}
        </Button>

        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            <Button type="button">{openLabel}</Button>
          </a>
        ) : null}

        {showPrint ? (
          <Button type="button" onClick={onPrint}>
            Print Certificate
          </Button>
        ) : null}
      </div>
    </div>
  );
}