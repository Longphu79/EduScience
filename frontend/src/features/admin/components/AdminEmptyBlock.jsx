export default function AdminEmptyBlock({ title, description }) {
  return (
    <div className="admin-course-detail-empty-block">
      <h3 className="admin-course-detail-empty-block__title">{title}</h3>
      <p className="admin-course-detail-empty-block__description">
        {description}
      </p>
    </div>
  );
}