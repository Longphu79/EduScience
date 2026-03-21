import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import QuizPageHero from "../components/QuizPageHero";
import QuizQuestionCard from "../components/QuizQuestionCard";
import ReviewAnswerModal from "../components/ReviewAnswerModal";
import LeaveQuizConfirmModal from "../components/LeaveQuizConfirmModal";
import RetryConfirmModal from "../components/RetryConfirmModal";
import SubmitResultModal from "../components/SubmitResultModal";
import useQuizPage from "../hooks/useQuizPage";
import { getQuestionId } from "../utils/quiz.helpers";
import "../styles/quiz-page.css";

export default function QuizPage() {
  const {
    quiz,
    attempts,
    latestAttempt,
    answers,
    timeLeft,
    loading,
    submitting,
    leaveLoading,
    toast,
    setToast,
    showReview,
    reviewLoading,
    reviewData,
    setReviewData,
    submitSummary,
    showSubmitResult,
    setShowSubmitResult,
    leaveConfirmOpen,
    retryConfirmOpen,
    quizMode,
    handleSelectOption,
    handleSubmit,
    handleOpenLatestReview,
    handleRetry,
    confirmRetry,
    confirmLeave,
    cancelLeave,
    setRetryConfirmOpen,
    handleBackToQuizList,
    handleBackToCourse,
    handleCloseReview,
  } = useQuizPage();

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Đang tải quiz...
          </div>
        </div>
      </div>
    );
  }

  if (!quiz?._id) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Không tìm thấy quiz.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-page__container space-y-6">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <LeaveQuizConfirmModal
          open={leaveConfirmOpen}
          loading={leaveLoading}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />

        <RetryConfirmModal
          open={retryConfirmOpen}
          onConfirm={confirmRetry}
          onCancel={() => setRetryConfirmOpen(false)}
        />

        <SubmitResultModal
          open={showSubmitResult}
          summary={submitSummary}
          onClose={() => setShowSubmitResult(false)}
          onReview={() => {
            setShowSubmitResult(false);
            handleOpenLatestReview("result");
          }}
        />

        <ReviewAnswerModal
          open={showReview}
          loading={reviewLoading}
          reviewData={reviewData}
          onClose={() => {
            setReviewData(null);
            handleCloseReview();
          }}
        />

        <QuizPageHero
          quiz={quiz}
          attempts={attempts}
          latestAttempt={latestAttempt}
          timeLeft={quizMode === "taking" ? timeLeft : null}
          onBackToQuizzes={handleBackToQuizList}
          onBackToCourse={handleBackToCourse}
        />

        {quizMode === "taking" ? (
          <>
            <div className="space-y-4">
              {(quiz.questions || []).map((question, index) => {
                const questionId = getQuestionId(question);

                return (
                  <QuizQuestionCard
                    key={questionId || index}
                    question={question}
                    index={index}
                    selectedOptionIndexes={answers[questionId] || []}
                    disabled={submitting || timeLeft === 0}
                    onSelectOption={handleSelectOption}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
              >
                Submit Quiz
              </Button>

              <Button type="button" onClick={handleRetry}>
                Reset Answers
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => handleOpenLatestReview("detail")}>
                Xem đáp án
              </Button>

              <Button type="button" onClick={handleRetry}>
                Làm lại quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}