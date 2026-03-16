export default function Button({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}