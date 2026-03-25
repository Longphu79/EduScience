import "../styles/edit-course-page.css";

export default function CourseSectionCard({
  title,
  description,
  children,
}) {
  return (
    <section className="edit-course-section-card">
      <div className="edit-course-section-card__header">
        <h2 className="edit-course-section-card__title">{title}</h2>
        {description ? (
          <p className="edit-course-section-card__description">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}