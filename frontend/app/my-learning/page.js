"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconArrowRight,
  IconBookmark,
  IconCertificate,
  IconClock,
  IconMessageCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PublicShell } from "@/components/public-shell";
import { formatDateTime } from "@/lib/format";
import {
  backendBrowserApiFetch,
  backendBrowserPostJson,
} from "@/lib/web-api";

const getStatusColor = (item) => (item.completed ? "green" : "blue");

function MyLearningContent() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reminderDrafts, setReminderDrafts] = useState({});
  const [savingReminder, setSavingReminder] = useState({});

  const loadCourses = async () => {
    setLoading(true);

    try {
      const response = await backendBrowserApiFetch("/api/learning/courses");
      setCourses(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses().catch((loadError) => setError(loadError.message));
  }, []);

  const completedCourses = courses.filter((item) => item.completed);
  const inProgressCourses = courses.filter((item) => !item.completed);
  const totalBookmarks = courses.reduce(
    (sum, item) => sum + (item.bookmarkedLessons || 0),
    0,
  );
  const reviewedCourses = courses.filter((item) => item.review).length;
  const focusCourse = inProgressCourses[0] || courses[0] || null;

  if (loading) {
    return (
      <PublicShell>
        <Stack align="center" py="xl">
          <Loader color="blue" />
          <Text c="dimmed">Loading learning dashboard...</Text>
        </Stack>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Stack py="xl" gap="xl">
        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
            <Stack gap="lg">
              <div>
                <Badge color="blue" variant="filled" w="fit-content">
                  Student dashboard
                </Badge>
                <Title order={1} mt="md">
                  My learning
                </Title>
                <Title order={2} mt="md" size={52} lh={1.04} maw={720}>
                  Return to the right lesson quickly, then close the loop with review and certificate work.
                </Title>
                <Text size="lg" c="dimmed" mt="md" maw={700}>
                  This desktop-first dashboard is built around the real learning API, reminders,
                  bookmarks, course completion, and learning-player routes.
                </Text>
              </div>

              {focusCourse ? (
                <Card radius="lg" padding="xl" bg="dark.8" c="white">
                  <Badge color="blue" variant="light" w="fit-content">
                    Focus course
                  </Badge>
                  <Title order={2} mt="sm">
                    {focusCourse.course.title}
                  </Title>
                  <Text c="gray.3" mt="sm">
                    {focusCourse.completed
                      ? "Completion assets are ready. Review the course or open your certificate."
                      : focusCourse.nextLessonTitle
                        ? `Next lesson: ${focusCourse.nextLessonTitle}`
                        : "Resume your next unpublished step in the player."}
                  </Text>

                  <Group gap="sm" wrap="wrap" mt="lg">
                    <Badge radius="lg" color="blue" variant="light">
                      {focusCourse.progress}% progress
                    </Badge>
                    <Badge radius="lg" color="teal" variant="light">
                      {focusCourse.completedLessons}/{focusCourse.totalLessons} lessons
                    </Badge>
                    {focusCourse.bookmarkedLessons ? (
                      <Badge radius="lg" color="grape" variant="light">
                        {focusCourse.bookmarkedLessons} bookmarked
                      </Badge>
                    ) : null}
                  </Group>

                  <Progress value={focusCourse.progress} radius="lg" color="blue" mt="lg" />

                  <Group gap="sm" mt="lg" wrap="wrap">
                    <Link href={`/learn/${focusCourse.course.slug}`}>
                      <Button
                        radius="lg"
                        color="blue"
                        leftSection={<IconPlayerPlay size={16} />}
                        rightSection={<IconArrowRight size={16} />}
                      >
                        {focusCourse.completed ? "Open completion view" : "Continue learning"}
                      </Button>
                    </Link>
                    {focusCourse.certificate ? (
                      <Badge radius="lg" color="green" variant="light">
                        Certificate ready
                      </Badge>
                    ) : null}
                  </Group>
                </Card>
              ) : null}
            </Stack>

            <Stack gap="lg">
              <SimpleGrid cols={2} spacing="md">
                {[
                  { label: "Enrolled", value: courses.length },
                  { label: "Completed", value: completedCourses.length },
                  { label: "Bookmarked", value: totalBookmarks },
                  { label: "Reviewed", value: reviewedCourses },
                ].map((item) => (
                  <Card key={item.label} radius="md" padding="xl" className="glass-card">
                    <Text c="dimmed">{item.label}</Text>
                    <Title order={2} mt="sm">
                      {item.value}
                    </Title>
                  </Card>
                ))}
              </SimpleGrid>

              <Card radius="lg" padding="xl" className="glass-card">
                <Group justify="space-between" align="center">
                  <div>
                    <Badge color="dark" variant="outline">
                      Study agenda
                    </Badge>
                    <Title order={3} mt="sm">
                      Upcoming reminders
                    </Title>
                  </div>
                  <ThemeIcon radius="lg" color="blue" size={44}>
                    <IconClock size={20} />
                  </ThemeIcon>
                </Group>

                <Stack gap="md" mt="lg">
                  {courses
                    .filter((item) => item.reminder)
                    .sort(
                      (left, right) =>
                        new Date(left.reminder.remindAt).getTime() -
                        new Date(right.reminder.remindAt).getTime(),
                    )
                    .slice(0, 3)
                    .map((item) => (
                      <Paper key={item.enrollmentId} radius="lg" p="md" withBorder>
                        <Text fw={700}>{item.course.title}</Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          {formatDateTime(item.reminder.remindAt)}
                        </Text>
                        <Text size="sm" mt="xs">
                          {item.reminder.message || "Study reminder saved."}
                        </Text>
                      </Paper>
                    ))}
                  {courses.some((item) => item.reminder) ? null : (
                    <Text c="dimmed" size="sm">
                      No reminders yet. Use the course detail rows below to schedule study follow-up.
                    </Text>
                  )}
                </Stack>
              </Card>
            </Stack>
          </SimpleGrid>
        </Paper>

        {error ? <Alert color="red">{error}</Alert> : null}

        <Card radius="lg" padding="xl" className="glass-card">
          <Group justify="space-between" align="end" wrap="wrap">
            <div>
              <Badge color="blue" variant="light">
                Learning inventory
              </Badge>
              <Title order={2} mt="sm">
                All enrolled courses
              </Title>
            </div>
            <Text c="dimmed">Desktop overview for progress, reminders, and jump-back actions.</Text>
          </Group>

          {courses.length ? (
            <ScrollArea mt="lg">
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Course</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Progress</Table.Th>
                    <Table.Th>Reminder</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {courses.map((item) => (
                    <Table.Tr key={item.enrollmentId}>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text fw={700}>{item.course.title}</Text>
                          <Text size="sm" c="dimmed">
                            {item.nextLessonTitle
                              ? `Next lesson: ${item.nextLessonTitle}`
                              : "Course completed"}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="wrap">
                          <Badge color={getStatusColor(item)} variant="light">
                            {item.completed ? "Completed" : "In progress"}
                          </Badge>
                          {item.review ? (
                            <Badge color="grape" variant="light">
                              Reviewed
                            </Badge>
                          ) : null}
                          {item.certificate ? (
                            <Badge color="green" variant="light">
                              Certificate
                            </Badge>
                          ) : null}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={6}>
                          <Text size="sm" fw={700}>
                            {item.progress}%
                          </Text>
                          <Progress value={item.progress} radius="lg" color="blue" />
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        {item.reminder ? (
                          <Stack gap={4}>
                            <Text size="sm" fw={700}>
                              {formatDateTime(item.reminder.remindAt)}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {item.reminder.message}
                            </Text>
                          </Stack>
                        ) : (
                          <Text size="sm" c="dimmed">
                            None scheduled
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Link href={`/learn/${item.course.slug}`}>
                          <Button radius="lg" color="dark">
                            {item.completed ? "Open" : "Continue"}
                          </Button>
                        </Link>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Alert color="blue" radius="lg" mt="lg">
              No enrolled courses yet.
            </Alert>
          )}
        </Card>

        <Card radius="lg" padding="xl" className="glass-card">
          <Group justify="space-between" align="end" wrap="wrap">
            <div>
              <Badge color="blue" variant="light">
                Course detail rail
              </Badge>
              <Title order={2} mt="sm">
                Reminders, completion signals, and retention details
              </Title>
            </div>
            <Text c="dimmed">Use these panels to QA reminder save flows and completion badges.</Text>
          </Group>

          <Accordion mt="lg" variant="separated" radius="lg">
            {courses.map((item) => (
              <Accordion.Item key={item.enrollmentId} value={item.enrollmentId}>
                <Accordion.Control>
                  <Group justify="space-between" align="center" wrap="wrap">
                    <div>
                      <Text fw={700}>{item.course.title}</Text>
                      <Text size="sm" c="dimmed">
                        Last activity {formatDateTime(item.lastActivityAt)}
                      </Text>
                    </div>
                    <Group gap="xs" wrap="wrap">
                      <Badge color={getStatusColor(item)} variant="light">
                        {item.completed ? "Completed" : "In progress"}
                      </Badge>
                      <Badge color="blue" variant="light">
                        {item.progress}% progress
                      </Badge>
                      {item.bookmarkedLessons ? (
                        <Badge color="grape" variant="light" leftSection={<IconBookmark size={12} />}>
                          {item.bookmarkedLessons}
                        </Badge>
                      ) : null}
                      {item.review ? (
                        <Badge color="teal" variant="light" leftSection={<IconMessageCircle size={12} />}>
                          Review saved
                        </Badge>
                      ) : null}
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
                    <Stack gap="md">
                      <Paper radius="lg" p="md" withBorder>
                        <Text fw={700}>Course state</Text>
                        <Text c="dimmed" mt="xs">
                          {item.completed
                            ? "Certificate is unlocked and the learner can revisit final lessons."
                            : item.nextLessonTitle
                              ? `Resume with ${item.nextLessonTitle}`
                              : "Resume learning from the next published lesson."}
                        </Text>
                        <Group gap="sm" mt="md" wrap="wrap">
                          <Badge color="blue" variant="light">
                            {item.completedLessons}/{item.totalLessons} lessons
                          </Badge>
                          {item.certificate ? (
                            <Badge color="green" variant="light" leftSection={<IconCertificate size={12} />}>
                              Certificate ready
                            </Badge>
                          ) : null}
                        </Group>
                      </Paper>

                      <Link href={`/learn/${item.course.slug}`}>
                        <Button
                          radius="lg"
                          color="dark"
                          leftSection={<IconPlayerPlay size={16} />}
                          rightSection={<IconArrowRight size={16} />}
                        >
                          {item.completed ? "Open completion view" : "Continue learning"}
                        </Button>
                      </Link>
                    </Stack>

                    <Stack gap="md">
                      <DateTimePicker
                        label="Set reminder"
                        radius="lg"
                        value={reminderDrafts[item.course._id]?.remindAt || null}
                        onChange={(value) =>
                          setReminderDrafts((prev) => ({
                            ...prev,
                            [item.course._id]: {
                              ...(prev[item.course._id] || {}),
                              remindAt: value,
                            },
                          }))
                        }
                      />
                      <Textarea
                        label="Message"
                        minRows={3}
                        radius="lg"
                        value={reminderDrafts[item.course._id]?.message || ""}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          setReminderDrafts((prev) => ({
                            ...prev,
                            [item.course._id]: {
                              ...(prev[item.course._id] || {}),
                              message: value,
                            },
                          }));
                        }}
                      />
                      <Button
                        radius="lg"
                        color="blue"
                        loading={savingReminder[item.course._id]}
                        onClick={async () => {
                          const draft = reminderDrafts[item.course._id];

                          if (!draft?.remindAt) {
                            setError("Chọn thời điểm nhắc nhở trước đã.");
                            return;
                          }

                          setSavingReminder((prev) => ({ ...prev, [item.course._id]: true }));
                          setError("");

                          try {
                            await backendBrowserPostJson(
                              `/api/learning/courses/${item.course._id}/reminder`,
                              {
                                remindAt:
                                  draft.remindAt instanceof Date
                                    ? draft.remindAt.toISOString()
                                    : draft.remindAt,
                                message: draft.message,
                              },
                            );
                            await loadCourses();
                            setReminderDrafts((prev) => ({ ...prev, [item.course._id]: {} }));
                          } catch (saveError) {
                            setError(saveError.message);
                          } finally {
                            setSavingReminder((prev) => ({ ...prev, [item.course._id]: false }));
                          }
                        }}
                      >
                        Save reminder
                      </Button>
                    </Stack>
                  </SimpleGrid>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>
      </Stack>
    </PublicShell>
  );
}

export default function MyLearningPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <MyLearningContent />
    </AuthGuard>
  );
}
