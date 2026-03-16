import { useId } from "react";
import "../styles/controls.css";

export default function TextField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    error,
    right,
}) {
    const id = useId();

    return (
        <div className="field">
            <label className="field__label" htmlFor={id}>
                {label}
            </label>
            <div className={`field__control ${error ? "is-error" : ""}`}>
                <input
                    id={id}
                    className="field__input"
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />
                {right ? <div className="field__right">{right}</div> : null}
            </div>
            {error ? <div className="field__error">{error}</div> : null}
        </div>
    );
}
