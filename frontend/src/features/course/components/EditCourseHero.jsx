import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";

export default function EditCourseHero({ courseId }) {
  return (
    <section className="edit-course-page__hero">
      <div className="edit-course-page__hero-layout">
        <div>
          <div className="edit-course-page__eyebrow">Instructor Dashboard</div>
          <h1 className="edit-course-page__title">Edit Course</h1>
          <p className="edit-course-page__subtitle">
            Update course information and continue managing related content.
          </p>
        </div>

        <div className="edit-course-page__hero-actions">
          <Link to={`/instructor/courses/${courseId}/lessons`}>
            <Button type="button">Lessons</Button>
          </Link>

          <Link to={`/instructor/courses/${courseId}/materials`}>
            <Button type="button">Materials</Button>
          </Link>

          <Link to={`/instructor/courses/${courseId}/quizzes`}>
            <Button type="button">Quizzes</Button>
          </Link>

          <Link to={`/instructor/courses/${courseId}/assignments`}>
            <Button type="button">Assignments</Button>
          </Link>

          <Link to={`/instructor/courses/${courseId}/students`}>
            <Button type="button">Students</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}