export default function Button({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
}) {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const variantClassMap = {
    primary:
      "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-95",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
    success:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  const sizeClassMap = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${
        variantClassMap[variant] || variantClassMap.primary
      } ${sizeClassMap[size] || sizeClassMap.md} ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}