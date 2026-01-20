import "../../features/auth/styles/controls.css";

export default function Toast({ kind = "error", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast ${kind}`}>
      <div className="toast__msg">{message}</div>
      <button className="toast__x" onClick={onClose} type="button">
        ×
      </button>
    </div>
  );
}
