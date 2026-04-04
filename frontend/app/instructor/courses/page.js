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
  Title,
} from "@mantine/core";
import { IconExternalLink, IconPencil, IconPlus } from "@tabler/icons-react";

import { DataTableCard } from "@/components/data-table-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { backendBrowserApiFetch } from "@/lib/web-api";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [health, setHealth] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      backendBrowserApiFetch("/api/instructor/courses"),
      backendBrowserApiFetch("/api/instructor/courses/health"),
    ])
      .then(([courseData, healthData]) => {
        setCourses(courseData);
        setHealth(healthData);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const summary = useMemo(
    () =>
      courses.reduce(
        (acc, course) => {
          acc.total += 1;
          acc[course.status] = (acc[course.status] || 0) + 1;
          return acc;
        },
        { total: 0, published: 0, draft: 0, archived: 0 },
      ),
    [courses],
  );

  return (
    <Stack gap="lg" className="management-page">
      <Paper p="xl" radius="md" className="management-panel management-panel--soft">
        <div className="management-panel__header">
          <div>
            <Badge color="blue" variant="light">
              Inventory
            </Badge>
            <Title order={1} mt="md">
              Course management
            </Title>
            <Text c="dimmed" mt="sm" maw={900}>
              Giao diện table-first giống sample: filter bar, action buttons, health cards và bảng
              khoá học để instructor rà public QA nhanh trên desktop.
            </Text>
          </div>

          <Group gap="sm" wrap="wrap">
            <Link href="/instructor/authoring">
              <Button radius="md" color="blue" leftSection={<IconPlus size={16} />}>
                Create course
              </Button>
            </Link>
            <Link href="/instructor">
              <Button radius="md" variant="light">
                Back to overview
              </Button>
            </Link>
          </Group>
        </div>
      </Paper>

      {error ? <Alert color="red">{error}</Alert> : null}

      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
        {[
          { label: "Tổng khoá học", value: summary.total, tone: "management-kpi-card--blue" },
          { label: "Published", value: summary.published, tone: "management-kpi-card--green" },
          { label: "Draft", value: summary.draft, tone: "management-kpi-card--yellow" },
          { label: "Archived", value: summary.archived, tone: "management-kpi-card--purple" },
        ].map((item) => (
          <Paper key={item.label} className={`management-kpi-card ${item.tone}`}>
            <Text size="sm" c="dimmed">
              {item.label}
            </Text>
            <Title order={2} mt="sm">
              {item.value}
            </Title>
          </Paper>
        ))}
      </SimpleGrid>

      <DataTableCard
        title="Course health"
        description="Tín hiệu vận hành cho từng khoá: completion, comments, preview readiness."
        records={health}
        summary={`${health.length} monitored courses`}
        emptyState="No course health metrics available."
        columns={[
          {
            key: "title",
            label: "Course",
            width: 260,
            render: (metric) => (
              <Stack gap={2}>
                <Title order={3}>{metric.title}</Title>
                <Text c="dimmed" size="sm">
                  {metric.slug}
                </Text>
              </Stack>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (metric) => (
              <Badge color={metric.status === "published" ? "green" : "blue"} variant="light">
                {metric.status}
              </Badge>
            ),
          },
          {
            key: "engagement",
            label: "Engagement",
            render: (metric) => (
              <Stack gap={2}>
                <Text>{metric.totalEnrollments} students</Text>
                <Text c="dimmed" size="sm">
                  {metric.recentComments} comments
                </Text>
              </Stack>
            ),
          },
          {
            key: "completionRate",
            label: "Completion",
            render: (metric) => `${metric.completionRate}%`,
          },
          {
            key: "healthFlags",
            label: "Flags",
            width: 250,
            render: (metric) => (
              <Group gap="xs" wrap="wrap">
                {metric.healthFlags.map((flag) => (
                  <Badge key={flag} variant="outline" color="blue">
                    {flag.replace("-", " ")}
                  </Badge>
                ))}
                {metric.previewReady ? (
                  <Badge color="green" variant="light">
                    Preview ready
                  </Badge>
                ) : null}
              </Group>
            ),
          },
          {
            key: "lastActivity",
            label: "Updated",
            render: (metric) => formatDateTime(metric.lastActivity),
          },
        ]}
      />

      <DataTableCard
        title="Course inventory"
        description="Bảng khoá học kiểu quản trị để scan status, pricing, engagement và thao tác nhanh."
        records={courses}
        summary={`${courses.length} total courses`}
        emptyState="No courses found yet."
        columns={[
          {
            key: "title",
            label: "Course",
            width: 280,
            render: (course) => (
              <Stack gap={2}>
                <Text fw={700}>{course.title}</Text>
                <Text c="dimmed" size="sm">
                  {course.slug}
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
            key: "category",
            label: "Category",
            render: (course) => (
              <Stack gap={2}>
                <Text>{course.category || "Uncategorized"}</Text>
                <Text c="dimmed" size="sm">
                  {course.level}
                </Text>
              </Stack>
            ),
          },
          {
            key: "stats",
            label: "Stats",
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
            key: "price",
            label: "Price",
            render: (course) => formatCurrency(course.salePrice ?? course.price),
          },
          {
            key: "updatedAt",
            label: "Updated",
            render: (course) => formatDateTime(course.updatedAt),
          },
          {
            key: "actions",
            label: "Actions",
            width: 120,
            render: (course) => (
              <Group gap="xs" wrap="nowrap">
                <Link href={`/instructor/authoring?courseId=${course._id}`}>
                  <ActionIcon size="lg" radius="md" variant="light" color="blue" aria-label="Edit details">
                    <IconPencil size={16} />
                  </ActionIcon>
                </Link>
                {course.slug ? (
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <ActionIcon size="lg" radius="md" color="blue" aria-label="Preview course page">
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
