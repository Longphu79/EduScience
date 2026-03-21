import React from "react";
import { Link } from "react-router-dom";

export default function LessonHeader({
  courseId,
  courseTitle,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__hero`}>
      <div className={`${pageClassName}__hero-row`}>
        <div>
          <p className={`${pageClassName}__eyebrow`}>Instructor Dashboard</p>
          <h1 className={`${pageClassName}__title`}>Manage Lessons</h1>
          <p className={`${pageClassName}__course`}>
            Course:{" "}
            <span className={`${pageClassName}__course-name`}>
              {courseTitle || "Unknown course"}
            </span>
          </p>
        </div>

        <div className={`${pageClassName}__hero-actions`}>
          <HeaderLink to="/instructor/courses" pageClassName={pageClassName}>
            Back to Courses
          </HeaderLink>

          <HeaderLink
            to={`/instructor/courses/${courseId}/edit`}
            pageClassName={pageClassName}
          >
            Edit Course
          </HeaderLink>

          <HeaderLink
            to={`/instructor/courses/${courseId}/materials`}
            pageClassName={pageClassName}
          >
            Manage Materials
          </HeaderLink>

          <HeaderLink
            to={`/instructor/courses/${courseId}/quizzes`}
            pageClassName={pageClassName}
          >
            Manage Quizzes
          </HeaderLink>

          <HeaderLink
            to={`/instructor/courses/${courseId}/assignments`}
            pageClassName={pageClassName}
          >
            Manage Assignments
          </HeaderLink>

          <HeaderLink
            to={`/instructor/courses/${courseId}/students`}
            pageClassName={pageClassName}
          >
            Manage Students
          </HeaderLink>
        </div>
      </div>
    </section>
  );
}

function HeaderLink({ to, children, pageClassName = "" }) {
  return (
    <Link to={to} className={`${pageClassName}__header-link`}>
      {children}
    </Link>
  );
}