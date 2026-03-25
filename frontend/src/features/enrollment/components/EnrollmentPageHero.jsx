import React from "react";

export default function EnrollmentPageHero({
  eyebrow,
  title,
  description,
  actions = null,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__hero`}>
      <div className={`${pageClassName}__hero-row`}>
        <div>
          {eyebrow ? (
            <div className={`${pageClassName}__eyebrow`}>{eyebrow}</div>
          ) : null}

          <h1 className={`${pageClassName}__title`}>{title}</h1>

          {description ? (
            <p className={`${pageClassName}__subtitle`}>{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className={`${pageClassName}__hero-actions`}>{actions}</div>
        ) : null}
      </div>
    </section>
  );
}