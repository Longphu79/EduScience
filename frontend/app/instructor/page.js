"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBook2,
  IconChartBar,
  IconCoin,
  IconExternalLink,
  IconMessageCircle,
  IconPencil,
  IconRocket,
} from "@tabler/icons-react";

import { DataTableCard } from "@/components/data-table-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { backendBrowserApiFetch } from "@/lib/web-api";

const KPI_TONES = [
  "management-kpi-card--blue",
  "management-kpi-card--orange",
  "management-kpi-card--green",
  "management-kpi-card--purple",
  "management-kpi-card--yellow",
  "management-kpi-card--teal",
];

const KPI_ICONS = [
  IconBook2,
  IconRocket,
  IconCoin,
  IconMessageCircle,
  IconChartBar,
  IconPencil,
];

export default function InstructorOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [payoutWorkspace, setPayoutWorkspace] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      backendBrowserApiFetch("/api/instructor/overview"),
      backendBrowserApiFetch("/api/instructor/courses"),
      backendBrowserApiFetch("/api/instructor/payouts/workspace"),
    ])
      .then(([overviewData, courseData, payoutData]) => {
        setOverview(overviewData);
        setCourses(courseData);
        setPayoutWorkspace(payoutData);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const statusSummary = useMemo(
    () =>
      courses.reduce(
        (acc, course) => {
          acc[course.status] = (acc[course.status] || 0) + 1;
          acc.enrollments += course.totalEnrollments || 0;
          acc.reviews += course.totalReviews || 0;
          return acc;
        },
        { published: 0, draft: 0, archived: 0, enrollments: 0, reviews: 0 },
      ),
    [courses],
  );

  const topCourses = [...courses]
    .sort((left, right) => (right.totalEnrollments || 0) - (left.totalEnrollments || 0))
    .slice(0, 5);

  const metrics = overview
    ? [
        { label: "Tổng khoá học", value: overview.summary.totalCourses },
        { label: "Đã publish", value: overview.summary.publishedCourses },
        {
          label: "Số dư payout",
          value: formatCurrency(overview.summary.availablePayoutBalance),
        },
        { label: "Bình luận học viên", value: overview.summary.studentCommentCount },
        { label: "Tổng enrollments", value: statusSummary.enrollments },
        { label: "Khóa draft", value: statusSummary.draft },
      ]
    : [];

  const activityBars = topCourses.length
    ? topCourses.map((course) => ({
        label: course.title,
        height: Math.max(24, Math.min(180, (course.totalEnrollments || 0) * 18)),
      }))
    : [
        { label: "Mon", height: 48 },
        { label: "Tue", height: 92 },
        { label: "Wed", height: 70 },
        { label: "Thu", height: 140 },
        { label: "Fri", height: 110 },
      ];

  return (
    <Stack gap="lg" className="management-page">
      <Paper p="xl" radius="md" className="management-panel management-panel--soft">
        <div className="management-panel__header">
          <div>
            <Badge color="blue" variant="light">
              Dashboard
            </Badge>
            <Title order={1} mt="md">
              Instructor overview
            </Title>
            <Text c="dimmed" mt="sm" maw={900}>
              Bố cục quản trị desktop-first kiểu operations dashboard: nhìn nhanh KPI, tín hiệu
              học viên, tiến độ publish và payout readiness trong cùng một màn.
            </Text>
          </div>

          <Group gap="sm" wrap="wrap">
            <Link href="/instructor/authoring">
              <Button radius="md" color="blue" leftSection={<IconPencil size={16} />}>
                Open authoring
              </Button>
            </Link>
            <Link href="/instructor/courses">
              <Button radius="md" variant="light" leftSection={<IconChartBar size={16} />}>
                Review course health
              </Button>
            </Link>
            <Link href="/instructor/payouts">
              <Button radius="md" variant="light" leftSection={<IconCoin size={16} />}>
                Open payouts
              </Button>
            </Link>
          </Group>
        </div>
      </Paper>

      {error ? <Alert color="red">{error}</Alert> : null}

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
        {metrics.map((item, index) => {
          const Icon = KPI_ICONS[index] || IconBook2;
          const tone = KPI_TONES[index % KPI_TONES.length];

          return (
            <Paper key={item.label} className={`management-kpi-card ${tone}`}>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="sm" c="dimmed">
                    {item.label}
                  </Text>
                  <Title order={2} mt="sm">
                    {item.value}
                  </Title>
                </div>
                <ThemeIcon size={42} radius="md" color="blue" variant="light">
                  <Icon size={18} />
                </ThemeIcon>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Paper p="xl" radius="md" className="management-panel">
          <div className="management-panel__header">
            <div>
              <Text fw={700}>Publishing velocity</Text>
              <Text c="dimmed" size="sm" mt={4}>
                7 ngày gần nhất
              </Text>
            </div>
            <Badge color="blue" variant="light">
              Draft {statusSummary.draft}
            </Badge>
          </div>
          <div className="management-mini-chart__line" />
        </Paper>

        <Paper p="xl" radius="md" className="management-panel">
          <div className="management-panel__header">
            <div>
              <Text fw={700}>Enrollment momentum</Text>
              <Text c="dimmed" size="sm" mt={4}>
                So sánh khoá học nổi bật
              </Text>
            </div>
            <Badge color="green" variant="light">
              Published {statusSummary.published}
            </Badge>
          </div>
          <div className="management-mini-chart">
            {activityBars.map((bar) => (
              <Stack key={bar.label} gap={8} align="center" style={{ flex: 1 }}>
                <div
                  className="management-mini-chart__bar"
                  style={{ height: `${bar.height}px`, width: "100%" }}
                />
                <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
                  {bar.label}
                </Text>
              </Stack>
            ))}
          </div>
        </Paper>
      </SimpleGrid>

      <DataTableCard
        title="Recent student comments"
        description="Comment theo lesson/session để instructor QA và follow-up nhanh."
        records={overview?.recentComments || []}
        summary={`${overview?.summary?.studentCommentCount || 0} comment signals`}
        emptyState="Student lesson comments will show up here once discussion volume increases."
        columns={[
          {
            key: "authorDisplayName",
            label: "Student",
            width: 220,
            render: (item) => (
              <Stack gap={2}>
                <Text fw={700}>{item.authorDisplayName}</Text>
                <Text c="dimmed" size="sm">
                  {item.course}
                </Text>
              </Stack>
            ),
          },
          {
            key: "lessonTitle",
            label: "Lesson",
            render: (item) => item.lessonTitle || "Lesson thread",
          },
          {
            key: "body",
            label: "Comment",
            width: 520,
            render: (item) => (
              <Text c="dimmed" lineClamp={2}>
                {item.body}
              </Text>
            ),
          },
        ]}
      />

      <DataTableCard
        title="Publishing queue"
        description="Hàng đợi thao tác theo workflow vận hành thay cho action center cũ."
        records={courses}
        summary={`${statusSummary.draft} drafts pending • ${payoutWorkspace?.requests?.length || 0} payout requests`}
        emptyState="No courses found."
        columns={[
          {
            key: "title",
            label: "Course",
            width: 280,
            render: (course) => (
              <Stack gap={2}>
                <Text fw={700}>{course.title}</Text>
                <Text c="dimmed" size="sm">
                  {course.category || "Uncategorized"} • {course.level}
                </Text>
              </Stack>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (course) => (
              <Badge color={course.status === "published" ? "green" : "blue"} variant="light">
                {course.status}
              </Badge>
            ),
          },
          {
            key: "readiness",
            label: "Readiness",
            render: (course) => (
              <Stack gap={2}>
                <Text>{course.totalLessons || 0} lessons</Text>
                <Text c="dimmed" size="sm">
                  {course.totalEnrollments || 0} enrollments
                </Text>
              </Stack>
            ),
          },
          {
            key: "payout",
            label: "Payout",
            render: () =>
              payoutWorkspace?.payoutAccount?.accountNumber ? "Bank linked" : "Account missing",
          },
          {
            key: "actions",
            label: "Actions",
            width: 120,
            render: (course) => (
              <Group gap="xs" wrap="nowrap">
                <Link href={`/instructor/authoring?courseId=${course._id}`}>
                  <ActionIcon size="lg" radius="md" variant="light" color="blue" aria-label="Edit course">
                    <IconPencil size={16} />
                  </ActionIcon>
                </Link>
                {course.slug ? (
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <ActionIcon size="lg" radius="md" color="blue" aria-label="View public page">
                      <IconExternalLink size={16} />
                    </ActionIcon>
                  </Link>
                ) : null}
              </Group>
            ),
          },
        ]}
      />

      <DataTableCard
        title="Top course reach"
        description="Bảng khoá học nổi bật để quét nhanh enrollment, review và public QA."
        records={topCourses}
        summary={`${topCourses.length} highlighted courses`}
        emptyState="No courses yet. Create the first one from the authoring workspace."
        columns={[
          {
            key: "title",
            label: "Course",
            width: 280,
            render: (course) => (
              <Stack gap={2}>
                <Text fw={700}>{course.title}</Text>
                <Text c="dimmed" size="sm">
                  {course.category || "Uncategorized"} • {course.level}
                </Text>
              </Stack>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (course) => (
              <Badge color={course.status === "published" ? "green" : "blue"} variant="light">
                {course.status}
              </Badge>
            ),
          },
          {
            key: "enrollments",
            label: "Enrollments",
            render: (course) => course.totalEnrollments || 0,
          },
          {
            key: "reviews",
            label: "Reviews",
            render: (course) => course.totalReviews || 0,
          },
          {
            key: "updatedAt",
            label: "Last updated",
            render: (course) => formatDateTime(course.updatedAt),
          },
          {
            key: "actions",
            label: "Actions",
            width: 120,
            render: (course) => (
              <Group gap="xs" wrap="nowrap">
                <Link href={`/instructor/authoring?courseId=${course._id}`}>
                  <ActionIcon size="lg" radius="md" variant="light" color="blue" aria-label="Edit course">
                    <IconPencil size={16} />
                  </ActionIcon>
                </Link>
                {course.slug ? (
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <ActionIcon size="lg" radius="md" color="blue" aria-label="View public page">
                      <IconExternalLink size={16} />
                    </ActionIcon>
                  </Link>
                ) : null}
              </Group>
            ),
          },
        ]}
      />
    </Stack>
  );
}
