"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  AspectRatio,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCertificate,
  IconCircleCheck,
  IconExternalLink,
  IconNotebook,
  IconStar,
} from "@tabler/icons-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import {
  backendBrowserApiFetch,
  backendBrowserPostJson,
  backendBrowserPutJson,
} from "@/lib/web-api";
import { formatDateTime } from "@/lib/format";

function LearningContent({ slug }) {
  const videoProgressRef = useRef(new Map());
  const videoNoticeRef = useRef(new Set());
  const [courseData, setCourseData] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [bookmarkDraft, setBookmarkDraft] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [error, setError] = useState("");
  const [progressSaving, setProgressSaving] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [notebookSaving, setNotebookSaving] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);

  const selectedLesson = useMemo(
    () => courseData?.lessons?.find((lesson) => lesson._id === selectedLessonId) ?? null,
    [courseData, selectedLessonId],
  );
  const selectedLessonCanComment = Boolean(
    selectedLesson && (selectedLesson.isUnlocked || selectedLesson.isCompleted),
  );

  const loadCourse = async (preferredLessonId) => {
    const data = await backendBrowserApiFetch(`/api/learning/course/${slug}`);
    const preferredLesson = data.lessons?.find(
      (lesson) =>
        lesson._id === preferredLessonId &&
        (lesson.isUnlocked || lesson.isCompleted),
    );
    setCourseData(data);
    const nextLessonId =
      preferredLesson?._id ||
      data.enrollment?.currentLessonId ||
      data.lessons?.find((lesson) => lesson.isUnlocked || lesson.isCompleted)?._id ||
      data.lessons?.[0]?._id ||
      null;
    setSelectedLessonId(nextLessonId);
    setReviewRating(data.review?.rating || 5);
    setReviewComment(data.review?.comment || "");
    return data;
  };

  useEffect(() => {
    loadCourse().catch((loadError) => setError(loadError.message));
  }, [slug]);

  useEffect(() => {
    if (!selectedLessonId || !courseData) {
      return;
    }

    const lesson = courseData.lessons?.find((item) => item._id === selectedLessonId);

    if (!lesson || (!lesson.isUnlocked && !lesson.isCompleted && !lesson.isPreview)) {
      setComments([]);
      return;
    }

    backendBrowserApiFetch(`/api/lesson/${selectedLessonId}/comments`)
      .then(setComments)
      .catch((loadError) => setError(loadError.message));
  }, [courseData, selectedLessonId]);

  useEffect(() => {
    setNoteDraft(selectedLesson?.studentNote || "");
    setBookmarkDraft(Boolean(selectedLesson?.isBookmarked));
  }, [selectedLesson]);

  const handleMarkCompleted = async (explicitCompleted) => {
    if (!selectedLesson || !courseData) {
      return;
    }

    const completedValue =
      typeof explicitCompleted === "boolean"
        ? explicitCompleted
        : !selectedLesson.isCompleted;

    setProgressSaving(true);
    setError("");

    try {
      const progressPayload = await backendBrowserPutJson(
        `/api/learning/courses/${courseData.course._id}/lessons/${selectedLesson._id}/progress`,
        { completed: completedValue },
      );
      const nextData = await loadCourse(
        completedValue ? progressPayload.currentLessonId : selectedLesson._id,
      );
      const updatedLesson =
        nextData.lessons.find((lesson) => lesson._id === selectedLesson._id) || null;
      notifications.show({
        color: "blue",
        title: updatedLesson?.isCompleted ? "Lesson completed" : "Lesson reopened",
        message: updatedLesson?.isCompleted
          ? "Progress has been updated and your next step is ready."
          : "This lesson is marked back to in progress.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setProgressSaving(false);
    }
  };

  const handleVideoTimeUpdate = (event) => {
    if (!selectedLesson || selectedLesson.isCompleted) {
      return;
    }

    const previousTime = videoProgressRef.current.get(selectedLesson._id) || 0;
    const nextTime = event.currentTarget.currentTime;

    if (nextTime > previousTime) {
      videoProgressRef.current.set(selectedLesson._id, nextTime);
    }
  };

  const handleVideoSeeking = (event) => {
    if (!selectedLesson || selectedLesson.isCompleted) {
      return;
    }

    const watchedTime = videoProgressRef.current.get(selectedLesson._id) || 0;
    const allowedTime = watchedTime + 5;

    if (event.currentTarget.currentTime > allowedTime) {
      event.currentTarget.currentTime = watchedTime;

      if (!videoNoticeRef.current.has(selectedLesson._id)) {
        notifications.show({
          color: "blue",
          title: "Sequential playback is on",
          message: "Finish the current part before jumping too far ahead in the lesson.",
        });
        videoNoticeRef.current.add(selectedLesson._id);
      }
    }
  };

  const handleVideoEnded = async () => {
    if (!selectedLesson?.isCompleted) {
      await handleMarkCompleted(true);
    }
  };

  const handlePostComment = async () => {
    if (!selectedLesson || !commentBody.trim()) {
      return;
    }

    setCommentSaving(true);
    setError("");

    try {
      await backendBrowserPostJson(
        `/api/lesson/${selectedLesson._id}/comments`,
        { body: commentBody },
      );
      setCommentBody("");
      const nextComments = await backendBrowserApiFetch(
        `/api/lesson/${selectedLesson._id}/comments`,
      );
      setComments(nextComments);
      notifications.show({
        color: "blue",
        title: "Comment posted",
        message: "Your lesson discussion reply is now visible in the thread.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setCommentSaving(false);
    }
  };

  const handleSaveNotebook = async () => {
    if (!selectedLesson || !courseData) {
      return;
    }

    setNotebookSaving(true);
    setError("");

    try {
      await backendBrowserPutJson(
        `/api/learning/courses/${courseData.course._id}/lessons/${selectedLesson._id}/notebook`,
        { note: noteDraft, isBookmarked: bookmarkDraft },
      );
      await loadCourse(selectedLesson._id);
      notifications.show({
        color: "grape",
        title: "Notebook saved",
        message: bookmarkDraft
          ? "This lesson is bookmarked and your note has been saved."
          : "Your lesson note has been saved.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setNotebookSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!courseData) {
      return;
    }

    setReviewSaving(true);
    setError("");

    try {
      await backendBrowserPutJson(`/api/learning/courses/${courseData.course._id}/review`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      await loadCourse(selectedLessonId);
      notifications.show({
        color: "green",
        title: "Review saved",
        message: "Your course feedback has been recorded.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setReviewSaving(false);
    }
  };

  if (!courseData) {
    return (
      <Stack align="center" py="xl">
        <Loader color="blue" />
        <Text c="dimmed">Loading learning workspace...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" py="xl">
      <Card radius="lg" padding="xl" className="glass-card">
        <Group justify="space-between" align="flex-start">
          <div>
            <Badge variant="filled">
              Learning space
            </Badge>
            <Title order={1} mt="md">
              {courseData.course.title}
            </Title>
            <Text c="dimmed" mt="sm" maw={780}>
              {courseData.course.shortDescription}
            </Text>
            <Group mt="lg" gap="sm" wrap="wrap">
              {courseData.certificate ? (
                <Badge color="green" variant="light" radius="lg">
                  Certificate ready
                </Badge>
              ) : null}
              {courseData.review ? (
                <Badge color="blue" variant="light" radius="lg">
                  Review submitted
                </Badge>
              ) : null}
              {courseData.retention?.bookmarkedLessons ? (
                <Badge color="grape" variant="light" radius="lg">
                  {courseData.retention.bookmarkedLessons} bookmarked
                </Badge>
              ) : null}
            </Group>
          </div>
          <Card radius="lg" padding="lg" bg="dark.8" c="white">
            <Text c="gray.4">Progress</Text>
            <Title order={2}>{courseData.enrollment.progress}%</Title>
            <Progress
              value={courseData.enrollment.progress}
              radius="lg"
              mt="sm"
            />
          </Card>
        </Group>
      </Card>

      {courseData.certificate ? (
        <Card radius="lg" padding="xl" className="glass-card">
          <Group justify="space-between" align="flex-start">
            <div>
              <Badge color="green" variant="filled">
                Completion milestone
              </Badge>
              <Title order={2} mt="md">
                You finished this course
              </Title>
              <Text c="dimmed" mt="sm" maw={760}>
                Your completion payload is ready. Use the certificate details below and leave a
                review if you have not done that yet.
              </Text>
            </div>
            <ActionIcon size={48} radius="lg" color="green" variant="light">
              <IconCertificate size={24} />
            </ActionIcon>
          </Group>
          <Grid mt="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper radius="lg" p="md" withBorder>
                <Text c="dimmed" size="sm">
                  Certificate code
                </Text>
                <Text fw={700} mt="sm">
                  {courseData.certificate.code}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper radius="lg" p="md" withBorder>
                <Text c="dimmed" size="sm">
                  Issued at
                </Text>
                <Text fw={700} mt="sm">
                  {formatDateTime(courseData.certificate.issuedAt)}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper radius="lg" p="md" withBorder>
                <Text c="dimmed" size="sm">
                  Learner
                </Text>
                <Text fw={700} mt="sm">
                  {courseData.certificate.learnerName}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Card>
      ) : null}

      {error ? <Alert color="red">{error}</Alert> : null}

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card radius="lg" padding="xl" className="glass-card">
            <Title order={3}>Curriculum</Title>
            <Stack mt="lg">
              {courseData.lessons.map((lesson) => (
                <Paper
                  key={lesson._id}
                  radius="lg"
                  p="md"
                  withBorder
                  onClick={() => {
                    if (lesson.isUnlocked || lesson.isCompleted) {
                      setSelectedLessonId(lesson._id);
                    }
                  }}
                  style={{
                    cursor:
                      lesson.isUnlocked || lesson.isCompleted
                        ? "pointer"
                        : "not-allowed",
                    opacity:
                      lesson.isUnlocked || lesson.isCompleted ? 1 : 0.58,
                    borderColor:
                      lesson._id === selectedLessonId ? "var(--accent)" : undefined,
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text fw={700}>{lesson.title}</Text>
                      <Text c="dimmed" size="sm">
                        {lesson.duration || 0} min
                      </Text>
                    </div>
                    <Group gap="sm">
                      {lesson.isBookmarked ? (
                        <Badge color="grape" variant="light">
                          saved
                        </Badge>
                      ) : null}
                      <Badge
                        color={
                          lesson.isCompleted
                            ? "green"
                            : lesson.isUnlocked
                              ? "blue"
                              : "gray"
                        }
                        variant="light"
                      >
                        {lesson.isCompleted
                          ? "completed"
                          : lesson.isUnlocked
                            ? "current"
                            : "locked"}
                      </Badge>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Stack gap="lg">
            <Card radius="lg" padding="xl" className="glass-card">
              <Badge variant="light">Lesson detail</Badge>
              <Title order={2} mt="sm">
                {selectedLesson?.title}
              </Title>
              <Text c="dimmed" mt="sm">
                {selectedLesson?.description}
              </Text>
              <Group mt="md" gap="sm">
                <Badge variant="light">
                  {selectedLesson?.estimatedCompletionMinutes || selectedLesson?.duration || 0} min
                </Badge>
                {selectedLesson?.isCompleted ? (
                  <Badge color="green" variant="light">
                    Completed
                  </Badge>
                ) : null}
              </Group>

              <Stack mt="lg" gap="md">
                {selectedLesson?.videoUrl ? (
                  <div>
                    <Text fw={700} mb="sm">
                      Video lesson
                    </Text>
                    <AspectRatio ratio={16 / 9}>
                      <video
                        src={selectedLesson.videoUrl}
                        controls
                        poster={courseData.course.thumbnail || undefined}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onSeeking={handleVideoSeeking}
                        onEnded={handleVideoEnded}
                        style={{ width: "100%", height: "100%", borderRadius: "var(--mantine-radius-md)", background: "#020617" }}
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <Paper radius="lg" p="md" withBorder>
                    <Text c="dimmed">No lesson video is available yet for this lesson.</Text>
                  </Paper>
                )}

                <div>
                  <Text fw={700}>Objectives</Text>
                  <Stack mt="sm" gap="sm">
                    {(selectedLesson?.objectives || []).map((item) => (
                      <Paper key={item} radius="lg" p="md" withBorder>
                        <Text>{item}</Text>
                      </Paper>
                    ))}
                  </Stack>
                </div>
                <div>
                  <Text fw={700}>Instructor notes</Text>
                  <Text c="dimmed" mt="sm">
                    {selectedLesson?.notes || "No notes yet."}
                  </Text>
                </div>
                <Card radius="lg" padding="lg" withBorder>
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={700}>My notebook</Text>
                      <Text c="dimmed" size="sm" mt={4}>
                        Save personal study notes and bookmark this lesson to return later.
                      </Text>
                    </div>
                    <ActionIcon
                      size={42}
                      radius="lg"
                      variant="light"
                      color={bookmarkDraft ? "grape" : "gray"}
                      onClick={() => setBookmarkDraft((prev) => !prev)}
                    >
                      {bookmarkDraft ? (
                        <IconBookmarkFilled size={20} />
                      ) : (
                        <IconBookmark size={20} />
                      )}
                    </ActionIcon>
                  </Group>
                  <Textarea
                    mt="md"
                    minRows={4}
                    radius="lg"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.currentTarget.value)}
                    placeholder="Capture key takeaways, questions, or action items here."
                  />
                  <Group justify="space-between" mt="md">
                    <Text c="dimmed" size="sm">
                      {selectedLesson?.noteUpdatedAt
                        ? `Last saved ${formatDateTime(selectedLesson.noteUpdatedAt)}`
                        : "No personal note saved yet."}
                    </Text>
                    <Button
                      radius="lg"
                      variant="light"
                      leftSection={<IconNotebook size={16} />}
                      onClick={handleSaveNotebook}
                      loading={notebookSaving}
                    >
                      Save notebook
                    </Button>
                  </Group>
                </Card>
                <div>
                  <Text fw={700}>Resources</Text>
                  <Stack mt="sm">
                    {(selectedLesson?.resources || []).map((resource) => (
                      <Paper key={`${resource.title}-${resource.url}`} radius="lg" p="md" withBorder>
                        <Group justify="space-between">
                          <Text fw={600}>{resource.title}</Text>
                          <Group gap="sm">
                            <Badge color="dark" variant="outline">
                              {resource.type}
                            </Badge>
                            <Link href={resource.url} target="_blank">
                              <ActionIcon variant="light" radius="lg">
                                <IconExternalLink size={16} />
                              </ActionIcon>
                            </Link>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </div>
                <Button
                  radius="lg"
                  leftSection={<IconCircleCheck size={16} />}
                  onClick={handleMarkCompleted}
                  loading={progressSaving}
                  disabled={!selectedLesson?.isUnlocked && !selectedLesson?.isCompleted}
                >
                  {selectedLesson?.isCompleted ? "Mark lesson incomplete" : "Mark lesson complete"}
                </Button>
              </Stack>
            </Card>

            {courseData.retention?.canReview ? (
              <Card radius="lg" padding="xl" className="glass-card">
                <Badge color="green" variant="light">
                  Completion feedback
                </Badge>
                <Title order={2} mt="sm">
                  Leave a course review
                </Title>
                <Text c="dimmed" mt="sm">
                  Reviews close the learning loop and help improve the public decision surface.
                </Text>
                <Group mt="lg" gap="sm">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <ActionIcon
                      key={value}
                      size={42}
                      radius="lg"
                      variant={value <= reviewRating ? "filled" : "light"}
                      color={value <= reviewRating ? "yellow" : "gray"}
                      onClick={() => setReviewRating(value)}
                    >
                      <IconStar size={18} />
                    </ActionIcon>
                  ))}
                </Group>
                <Textarea
                  mt="lg"
                  minRows={4}
                  radius="lg"
                  label="Review comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.currentTarget.value)}
                  placeholder="What was useful, what could be stronger, and how did the course help?"
                />
                <Group justify="space-between" mt="md">
                  <Text c="dimmed" size="sm">
                    {courseData.review?.updatedAt
                      ? `Last updated ${formatDateTime(courseData.review.updatedAt)}`
                      : "You can update this review later."}
                  </Text>
                  <Button
                    radius="lg"
                    leftSection={<IconStar size={16} />}
                    onClick={handleSubmitReview}
                    loading={reviewSaving}
                  >
                    Save review
                  </Button>
                </Group>
              </Card>
            ) : null}

            <Card radius="lg" padding="xl" className="glass-card">
              <Badge color="blue" variant="light">
                Discussion
              </Badge>
              <Title order={2} mt="sm">
                Lesson comments
              </Title>
              {!selectedLessonCanComment ? (
                <Alert color="blue" mt="lg" title="Discussion unlocks with lesson progress">
                  Complete the previous lesson first. The next lesson discussion opens only after the
                  sequence is unlocked.
                </Alert>
              ) : null}
              <Stack gap="md" mt="lg">
                <Textarea
                  minRows={3}
                  radius="lg"
                  label="Add a comment"
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.currentTarget.value)}
                  disabled={!selectedLessonCanComment}
                />
                <Button
                  radius="lg"
                  variant="light"
                  onClick={handlePostComment}
                  loading={commentSaving}
                  disabled={!selectedLessonCanComment}
                >
                  Post comment
                </Button>
                {comments.map((comment) => (
                  <Paper key={comment._id} radius="lg" p="lg" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text fw={700}>{comment.authorDisplayName}</Text>
                        <Text c="dimmed" size="sm">
                          {comment.authorRole}
                        </Text>
                      </div>
                      <Text c="dimmed" size="sm">
                        {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      </Text>
                    </Group>
                    <Divider my="sm" />
                    <Text>{comment.body}</Text>
                  </Paper>
                ))}
                {comments.length === 0 ? (
                  <Paper radius="lg" p="lg" withBorder>
                    <Text c="dimmed">
                      No comments yet for this lesson. Start the thread with a question or takeaway.
                    </Text>
                  </Paper>
                ) : null}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export default function LearningPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? use(params) : params;

  return (
    <AuthGuard allowedRoles={["student"]}>
      <LearningContent slug={resolvedParams.slug} />
    </AuthGuard>
  );
}
