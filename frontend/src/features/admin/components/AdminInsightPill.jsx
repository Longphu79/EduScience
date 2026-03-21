import { Link } from "react-router-dom";
import "../styles/admin-insight-pill.css";

export default function AdminInsightPill({
  label,
  value,
  hint,
  to,
  tone = "slate",
}) {
  const content = (
    <div className={`admin-insight-pill admin-insight-pill--${tone}`}>
      <div className="admin-insight-pill__label">{label}</div>
      <div className="admin-insight-pill__value">{value}</div>
      {hint ? <div className="admin-insight-pill__hint">{hint}</div> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="admin-insight-pill__link">
        {content}
      </Link>
    );
  }

  return content;
}