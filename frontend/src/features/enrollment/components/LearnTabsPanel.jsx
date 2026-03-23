import MaterialsTab from "../../material/components/MaterialsTab";
import QuizList from "../../quiz/components/QuizList";
import AssignmentList from "../../assignment/components/AssignmentList";
import { getLessonId } from "../utils/enrollment.helpers";

const TAB_OPTIONS = [
  { key: "lessons", label: "Bài học" },
  { key: "materials", label: "Tài liệu" },
  { key: "quizzes", label: "Quiz" },
  { key: "assignments", label: "Bài tập" },
];

function LessonTabCard({
  lesson,
  index,
  isActive,
  isCompleted,
  onSelectLesson,
  pageClassName = "",
}) {
  const content = (
    <div className={`${pageClassName}__lesson-card-row`}>
      <div className={`${pageClassName}__lesson-card-main`}>
        <p className={`${pageClassName}__lesson-card-index`}>Bài {index + 1}</p>

        <p className={`${pageClassName}__lesson-card-title`}>
          {lesson?.title || "Bài học"}
        </p>

        <p className={`${pageClassName}__lesson-card-text`}>
          {lesson?.description || "Chưa có mô tả."}
        </p>
      </div>

      <div className={`${pageClassName}__lesson-card-badges`}>
        {isActive ? (
          <span
            className={`${pageClassName}__lesson-card-badge ${pageClassName}__lesson-card-badge--active`}
          >
            Đang chọn
          </span>
        ) : null}

        {isCompleted ? (
          <span
            className={`${pageClassName}__lesson-card-badge ${pageClassName}__lesson-card-badge--done`}
          >
            Completed
          </span>
        ) : null}
      </div>
    </div>
  );

  if (typeof onSelectLesson === "function") {
    return (
      <button
        type="button"
        onClick={() => onSelectLesson(lesson)}
        className={`${pageClassName}__lesson-card ${
          isActive ? `${pageClassName}__lesson-card--active` : ""
        } text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`${pageClassName}__lesson-card ${
        isActive ? `${pageClassName}__lesson-card--active` : ""
      }`}
    >
      {content}
    </div>
  );
}

export default function LearnTabsPanel({
  activeTab,
  onChangeTab,
  onSelectLesson,
  courseId,
  lessons = [],
  currentLesson,
  completedLessonIds = [],
  assignments = [],
  submissionsMap = {},
  assignmentLoading = false,
  pageClassName = "",
}) {
  const currentLessonId = String(getLessonId(currentLesson));
  const completedLessonIdSet = new Set(
    (Array.isArray(completedLessonIds) ? completedLessonIds : []).map(String)
  );

  function renderLessonsTab() {
    if (!lessons.length) {
      return (
        <div className={`${pageClassName}__video-empty`}>
          Chưa có bài học nào trong khóa học này.
        </div>
      );
    }

    return (
      <div className={`${pageClassName}__tab-content`}>
        {lessons.map((lesson, index) => {
          const lessonId = String(getLessonId(lesson));
          const isActive = lessonId === currentLessonId;
          const isCompleted = completedLessonIdSet.has(lessonId);

          return (
            <LessonTabCard
              key={lessonId || index}
              lesson={lesson}
              index={index}
              isActive={isActive}
              isCompleted={isCompleted}
              onSelectLesson={onSelectLesson}
              pageClassName={pageClassName}
            />
          );
        })}
      </div>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "materials":
        return <MaterialsTab courseId={courseId} />;

      case "quizzes":
        return <QuizList courseId={courseId} />;

      case "assignments":
        return (
          <AssignmentList
            items={assignments}
            submissionsMap={submissionsMap}
            courseId={courseId}
            loading={assignmentLoading}
          />
        );

      case "lessons":
      default:
        return renderLessonsTab();
    }
  }

  return (
    <section className={`${pageClassName}__tabs-panel`}>
      <div className={`${pageClassName}__tabs-head`}>
        <div className={`${pageClassName}__tabs-list`}>
          {TAB_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChangeTab(tab.key)}
                className={`${pageClassName}__tab-btn ${
                  isActive ? `${pageClassName}__tab-btn--active` : ""
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {renderActiveTab()}
    </section>
  );
}