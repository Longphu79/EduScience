export default function CourseFormField({
  className = "",
  label,
  hint,
  children,
  pageClass = "create-course-page",
}) {
  return (
    <div className={`${pageClass}__field ${className}`.trim()}>
      <label className={`${pageClass}__field-label`}>{label}</label>
      {children}
      {hint ? <p className={`${pageClass}__field-hint`}>{hint}</p> : null}
    </div>
  );
}