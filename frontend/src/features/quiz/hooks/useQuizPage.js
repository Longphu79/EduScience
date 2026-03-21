import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  getAttemptReviewById,
  getAttemptsByStudentCourse,
  getQuizById,
  submitQuizAttempt,
} from "../services/quiz.service";
import {
  buildInitialAnswers,
  getAttemptSummary,
  getQuestionId,
  getQuizId,
  normalizeAttemptList,
  normalizeAttemptReview,
  normalizeQuizItem,
  quizUnwrap,
} from "../utils/quiz.helpers";

function hasAnyAnswered(answers = {}) {
  return Object.values(answers).some(
    (value) => Array.isArray(value) && value.length > 0
  );
}

export default function useQuizPage() {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const [showReview, setShowReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  const [submitSummary, setSubmitSummary] = useState(null);
  const [showSubmitResult, setShowSubmitResult] = useState(false);

  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState("");

  const [reviewSource, setReviewSource] = useState(null);
  const [quizMode, setQuizMode] = useState("taking");

  const studentId = user?._id || user?.id || user?.userId || "";
  const forceRetake = searchParams.get("retake") === "1";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const quizRes = await getQuizById(quizId, { hideAnswers: true });
      const normalizedQuiz = normalizeQuizItem(quizUnwrap(quizRes) || {});

      setQuiz(normalizedQuiz);
      setAnswers(buildInitialAnswers(normalizedQuiz.questions || []));
      setTimeLeft(
        normalizedQuiz.timeLimit > 0 ? normalizedQuiz.timeLimit * 60 : null
      );

      setSubmitSummary(null);
      setShowSubmitResult(false);
      setShowReview(false);
      setReviewData(null);
      setReviewSource(null);
      setPendingNavigationPath("");

      if (studentId && courseId) {
        try {
          const attemptsRes = await getAttemptsByStudentCourse(courseId);
          const attemptList = normalizeAttemptList(quizUnwrap(attemptsRes));

          const quizAttempts = attemptList.filter(
            (attempt) => String(getQuizId(attempt)) === String(quizId)
          );

          setAttempts(quizAttempts);

          if (forceRetake) {
            setQuizMode("taking");
          } else {
            setQuizMode(quizAttempts.length > 0 ? "result" : "taking");
          }
        } catch (attemptError) {
          console.error("Load my attempts error:", attemptError);
          setAttempts([]);
          setQuizMode("taking");
        }
      } else {
        setAttempts([]);
        setQuizMode("taking");
      }
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được quiz",
        kind: "error",
      });
      setQuiz(null);
      setAttempts([]);
      setQuizMode("taking");
    } finally {
      setLoading(false);
    }
  }, [courseId, forceRetake, quizId, studentId]);

  useEffect(() => {
    if (quizId) {
      loadData();
    }
  }, [quizId, loadData]);

  const latestAttempt = useMemo(() => attempts[0] || null, [attempts]);

  const latestSummary = useMemo(() => {
    return getAttemptSummary(latestAttempt, quiz);
  }, [latestAttempt, quiz]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) return;
    if (submitting) return;
    if (showReview) return;
    if (showSubmitResult) return;
    if (quizMode !== "taking") return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, submitting, showReview, showSubmitResult, quizMode]);

  const handleSelectOption = useCallback((question, optionValue) => {
    const questionId = getQuestionId(question);
    if (!questionId) return;

    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const questionType = question?.type || "single";

      let nextValues = [];

      if (questionType === "multiple") {
        nextValues = current.includes(optionValue)
          ? current.filter((item) => item !== optionValue)
          : [...current, optionValue];
      } else {
        nextValues = [optionValue];
      }

      return {
        ...prev,
        [questionId]: nextValues,
      };
    });
  }, []);

  const finishQuiz = useCallback(
    async ({
      showResultModal = true,
      successMessage = "Nộp quiz thành công",
    } = {}) => {
      if (!quiz || submitting) return false;

      try {
        setSubmitting(true);

        const payloadAnswers = (quiz.questions || []).map((question) => {
          const questionId = getQuestionId(question);
          const selectedOptionIndexes = Array.isArray(answers[questionId])
            ? answers[questionId]
            : [];

          return {
            questionId,
            selectedOptionIndexes,
          };
        });

        const response = await submitQuizAttempt(quizId, {
          answers: payloadAnswers,
        });

        const normalizedReview = normalizeAttemptReview(
          quizUnwrap(response),
          quiz
        );
        const summary = getAttemptSummary(normalizedReview, quiz);

        setAttempts((prev) => normalizeAttemptList([normalizedReview, ...prev]));
        setReviewData(normalizedReview);
        setSubmitSummary(summary);

        setQuizMode("result");
        setReviewSource(null);
        setShowReview(false);
        setShowSubmitResult(showResultModal);

        if (successMessage) {
          setToast({
            message: successMessage,
            kind: "success",
          });
        }

        return true;
      } catch (error) {
        setToast({
          message: error?.message || "Không thể nộp quiz",
          kind: "error",
        });
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [answers, quiz, quizId, submitting]
  );

  const handleSubmit = useCallback(async () => {
    return finishQuiz({
      showResultModal: true,
      successMessage: "Nộp quiz thành công",
    });
  }, [finishQuiz]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (quizMode !== "taking") return;
    if (submitting) return;

    finishQuiz({
      showResultModal: true,
      successMessage: "Hết thời gian, hệ thống đã tự nộp bài.",
    });
  }, [finishQuiz, quizMode, submitting, timeLeft]);

  const handleOpenLatestReview = useCallback(
    async (source = "detail") => {
      if (!latestAttempt?._id && !latestAttempt?.id) return;

      try {
        setReviewLoading(true);
        setReviewSource(source);
        setShowReview(true);

        const response = await getAttemptReviewById(
          latestAttempt._id || latestAttempt.id
        );

        const normalizedReview = normalizeAttemptReview(
          quizUnwrap(response),
          quiz
        );

        setReviewData(normalizedReview);
      } catch (error) {
        setShowReview(false);
        setReviewData(null);
        setToast({
          message: error?.message || "Không tải được review",
          kind: "error",
        });
      } finally {
        setReviewLoading(false);
      }
    },
    [latestAttempt, quiz]
  );

  const resetQuizState = useCallback(() => {
    if (!quiz) return;

    setAnswers(buildInitialAnswers(quiz.questions || []));
    setTimeLeft(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : null);
    setShowReview(false);
    setReviewData(null);
    setSubmitSummary(null);
    setShowSubmitResult(false);
    setReviewSource(null);
    setQuizMode("taking");
    setPendingNavigationPath("");
  }, [quiz]);

  const handleRetry = useCallback(() => {
    if (!quiz) return;

    if (quizMode === "taking" && hasAnyAnswered(answers)) {
      setRetryConfirmOpen(true);
      return;
    }

    resetQuizState();
  }, [answers, quiz, quizMode, resetQuizState]);

  const confirmRetry = useCallback(() => {
    setRetryConfirmOpen(false);
    resetQuizState();
  }, [resetQuizState]);

  const shouldBlockNavigation = useMemo(() => {
    if (loading || submitting || leaveLoading) return false;
    if (quizMode !== "taking") return false;
    if (showReview || showSubmitResult) return false;
    return hasAnyAnswered(answers);
  }, [
    answers,
    leaveLoading,
    loading,
    quizMode,
    showReview,
    showSubmitResult,
    submitting,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!shouldBlockNavigation) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlockNavigation]);

  const requestNavigate = useCallback(
    (nextPath) => {
      if (!nextPath) return;

      if (shouldBlockNavigation) {
        setPendingNavigationPath(nextPath);
        setLeaveConfirmOpen(true);
        return;
      }

      navigate(nextPath);
    },
    [navigate, shouldBlockNavigation]
  );

  const confirmLeave = useCallback(async () => {
    try {
      setLeaveLoading(true);

      if (hasAnyAnswered(answers)) {
        const submitted = await finishQuiz({
          showResultModal: false,
          successMessage: "Đã kết thúc và nộp bài hiện tại.",
        });

        if (!submitted) {
          return;
        }
      }

      const nextPath = pendingNavigationPath;

      setLeaveConfirmOpen(false);
      setPendingNavigationPath("");

      if (nextPath) {
        navigate(nextPath);
      }
    } finally {
      setLeaveLoading(false);
    }
  }, [answers, finishQuiz, navigate, pendingNavigationPath]);

  const cancelLeave = useCallback(() => {
    setLeaveConfirmOpen(false);
    setPendingNavigationPath("");
  }, []);

  const handleBackToQuizList = useCallback(() => {
    requestNavigate(`/learn/${courseId}?tab=quizzes`);
  }, [courseId, requestNavigate]);

  const handleBackToCourse = useCallback(() => {
    requestNavigate(`/learn/${courseId}`);
  }, [courseId, requestNavigate]);

  const handleCloseReview = useCallback(() => {
    setShowReview(false);
    setReviewData(null);

    if (reviewSource === "result") {
      setShowSubmitResult(true);
    }
  }, [reviewSource]);

  return {
    courseId,
    quizId,
    quiz,
    attempts,
    latestAttempt,
    latestSummary,
    answers,
    timeLeft,
    loading,
    submitting,
    leaveLoading,
    toast,
    setToast,

    showReview,
    setShowReview,
    reviewLoading,
    reviewData,
    setReviewData,

    submitSummary,
    showSubmitResult,
    setShowSubmitResult,

    leaveConfirmOpen,
    retryConfirmOpen,

    reviewSource,
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
    requestNavigate,
  };
}