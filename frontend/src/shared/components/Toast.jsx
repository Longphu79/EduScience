import { useEffect } from "react";

export default function Toast({
  kind = "error",
  type,
  message,
  onClose,
  duration = 2600,
  position = "top-center",
}) {
  const toastType = type || kind || "error";

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const positionClassMap = {
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  if (!message) return null;

  return (
    <div
      className={`fixed z-[9999] w-[min(92vw,520px)] ${
        positionClassMap[position] || positionClassMap["top-center"]
      }`}
    >
      <div className={`toast ${toastType} shadow-xl`}>
        <div className="toast__msg">{message}</div>
        <button className="toast__x" onClick={onClose} type="button">
          ×
        </button>
      </div>
    </div>
  );
}