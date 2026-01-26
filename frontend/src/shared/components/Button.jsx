import "../styles/controls.css";

export default function Button({
    children,
    variant = "primary",
    loading,
    ...props
}) {
    return (
        <button
            className={`btn ${variant}`}
            disabled={loading || props.disabled}
            {...props}
        >
            <span className={`btn__text ${loading ? "is-loading" : ""}`}>
                {children}
            </span>
            {loading ? <span className="btn__spinner" /> : null}
        </button>
    );
}
