import "../styles/controls.css";

export default function Toast({
  kind = "error",
  type,
  message,
  onClose,
}) {
  if (!message) return null;

  const toastType = type || kind || "error";

  return (
    <div className={`toast ${toastType}`}>
      <div className="toast__msg">{message}</div>
      <button className="toast__x" onClick={onClose} type="button">
        ×
      </button>
    </div>
  );
}