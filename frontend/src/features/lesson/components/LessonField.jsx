import React from "react";

export default function LessonField({
  label,
  children,
  hint,
  pageClassName = "",
}) {
  return (
    <div>
      <label className={`${pageClassName}__field-label`}>{label}</label>
      {children}
      {hint ? (
        <p className={`${pageClassName}__field-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}