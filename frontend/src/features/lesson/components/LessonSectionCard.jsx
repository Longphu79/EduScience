import React from "react";

export default function LessonSectionCard({
  title,
  description,
  children,
  action = null,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__section-card`}>
      <div className={`${pageClassName}__section-head`}>
        <div>
          <h2 className={`${pageClassName}__section-title`}>{title}</h2>
          {description ? (
            <p className={`${pageClassName}__section-desc`}>{description}</p>
          ) : null}
        </div>

        {action ? <div>{action}</div> : null}
      </div>

      {children}
    </section>
  );
}