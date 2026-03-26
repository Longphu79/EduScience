import { useEffect } from "react";

export default function Toast({
  kind = "error",
  type,
  message,
  onClose,
  duration = 3200,
  position = "action-zone",
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
    inline: "relative w-full",
    "top-center":
      "fixed top-5 left-1/2 -translate-x-1/2 w-[min(92vw,560px)] z-[9999]",
    "top-right":
      "fixed top-5 right-5 w-[min(92vw,420px)] z-[9999]",
    "bottom-center":
      "fixed bottom-8 left-1/2 -translate-x-1/2 w-[min(92vw,560px)] z-[9999]",
    "bottom-right":
      "fixed bottom-8 right-5 w-[min(92vw,420px)] z-[9999]",
    "action-zone":
      "fixed right-6 bottom-28 w-[min(92vw,430px)] z-[9999]",
  };

  if (!message) return null;

  const isSuccess = toastType === "success";

  return (
    <div className={positionClassMap[position] || positionClassMap["action-zone"]}>
      <div
        className="shadow-2xl"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          borderRadius: "16px",
          padding: "14px 16px",
          border: isSuccess
            ? "1px solid rgba(34,197,94,0.24)"
            : "1px solid rgba(248,113,113,0.24)",
          background: isSuccess
            ? "rgba(240,253,244,0.96)"
            : "rgba(255,250,250,0.96)",
          boxShadow:
            "0 16px 40px rgba(15,23,42,0.14), 0 6px 20px rgba(15,23,42,0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: "15px",
            lineHeight: 1.5,
            fontWeight: 600,
            color: isSuccess ? "#166534" : "#991b1b",
            wordBreak: "break-word",
          }}
        >
          {message}
        </div>

        <button
          onClick={onClose}
          type="button"
          style={{
            border: "none",
            background: "transparent",
            color: isSuccess ? "#166534" : "#991b1b",
            fontSize: "22px",
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
            marginTop: "-1px",
            opacity: 0.72,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}