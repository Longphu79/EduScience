import React from "react";

export default function AdminPageHero({
  title,
  description,
  actions = null,
}) {
  return (
    <section className="admin-page-hero">
      <div className="admin-page-hero__glow admin-page-hero__glow--one" />
      <div className="admin-page-hero__glow admin-page-hero__glow--two" />

      <div className="admin-page-hero__content">
        <div className="admin-page-hero__left">
          <div className="admin-page-hero__eyebrow">Admin control center</div>

          <h1 className="admin-page-hero__title">{title}</h1>

          {description ? (
            <p className="admin-page-hero__description">{description}</p>
          ) : null}

          <div className="admin-page-hero__meta">
            <div className="admin-page-hero__meta-card">
              <span className="admin-page-hero__meta-label">
                Real-time oversight
              </span>
              <strong className="admin-page-hero__meta-value">
                Users, courses, revenue
              </strong>
            </div>

            <div className="admin-page-hero__meta-card">
              <span className="admin-page-hero__meta-label">
                Admin workflow
              </span>
              <strong className="admin-page-hero__meta-value">
                Review, approve, optimize
              </strong>
            </div>
          </div>
        </div>

        {actions ? (
          <div className="admin-page-hero__actions">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}