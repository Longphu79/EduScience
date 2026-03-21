import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";

function ActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

export default function LearnCourseActions({
  progress = 0,
  courseId,
  currentLesson,
  currentLessonCompleted,
  actionLoading,
  certificate,
  certificateLoading,
  onOpenInstructorChat,
  onCompleteLesson,
  onGenerateCertificate,
  pageClassName = "",
  completeLabel = "Hoàn thành bài học",
  completedLabel = "Đã hoàn thành bài học",
}) {
  const safeProgress = Number(progress || 0);
  const canGenerateCertificate =
    safeProgress >= 100 && !certificate && !!courseId;
  const canViewCertificate = safeProgress >= 100 && !!certificate && !!courseId;

  return (
    <div className={`${pageClassName}__hero-actions`}>
      <Button
        type="button"
        onClick={onOpenInstructorChat}
        className="bg-gradient-to-r from-violet-600 to-blue-600 text-white"
      >
        Nhắn tin với instructor
      </Button>

      <Button
        type="button"
        onClick={onCompleteLesson}
        loading={actionLoading}
        disabled={!currentLesson || currentLessonCompleted}
      >
        {currentLessonCompleted ? completedLabel : completeLabel}
      </Button>

      {canViewCertificate ? (
        <>
          <ActionLink to={`/learn/${courseId}/certificate`}>
            View Certificate
          </ActionLink>

          {certificate?.certificateCode ? (
            <ActionLink to={`/certificate/${certificate.certificateCode}`}>
              Public Certificate
            </ActionLink>
          ) : null}
        </>
      ) : null}

      {canGenerateCertificate ? (
        <Button
          type="button"
          onClick={onGenerateCertificate}
          loading={certificateLoading}
        >
          Generate Certificate
        </Button>
      ) : null}
    </div>
  );
}