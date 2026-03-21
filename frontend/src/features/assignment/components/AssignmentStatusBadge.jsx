import "../styles/assignment-components.css";

export default function AssignmentStatusBadge({
  label,
  variant = "default",
  small = false,
}) {
  const sizeClass = small
    ? "assignment-status-badge--small"
    : "assignment-status-badge--normal";

  return (
    <span
      className={`assignment-status-badge assignment-status-badge--${variant} ${sizeClass}`}
    >
      {label}
    </span>
  );
}