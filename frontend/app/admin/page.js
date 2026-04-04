"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
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

import { backendBrowserApiFetch } from "@/lib/web-api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [payoutQueue, setPayoutQueue] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      backendBrowserApiFetch("/api/admin/overview"),
      backendBrowserApiFetch("/api/admin/payout-requests"),
      backendBrowserApiFetch("/api/admin/moderation/queue"),
      backendBrowserApiFetch("/api/admin/payout-ledger"),
    ])
      .then(([overviewData, payoutData, moderationData, ledgerData]) => {
        setOverview(overviewData);
        setPayoutQueue(payoutData);
        setModerationQueue(moderationData);
        setLedger(ledgerData);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const cards = overview
    ? [
        {
          label: "Tổng khoá học",
          value: overview.summary.totalCourses,
          tone: "management-kpi-card--blue",
        },
        {
          label: "Instructor",
          value: overview.summary.instructorCount,
          tone: "management-kpi-card--orange",
        },
        {
          label: "Student",
          value: overview.summary.studentCount,
          tone: "management-kpi-card--green",
        },
        {
          label: "Payout requested",
          value: formatCurrency(overview.summary.payoutTotalRequested),
          tone: "management-kpi-card--purple",
        },
      ]
    : [];

  return (
    <Stack gap="lg" className="management-page">
      <Paper p="xl" radius="md" className="management-panel management-panel--soft">
        <div className="management-panel__header">
          <div>
            <Badge color="blue" variant="light">
              Admin dashboard
            </Badge>
            <Title order={1} mt="md">
              Admin overview
            </Title>
            <Text c="dimmed" mt="sm" maw={920}>
              Dashboard vận hành cho moderation, payout và tình trạng platform theo cùng layout với
              instructor shell.
            </Text>
          </div>
          <Group gap="sm" wrap="wrap">
            <Link href="/admin/authoring">
              <Button radius="md" color="blue">
                Open authoring
              </Button>
            </Link>
            <Link href="/admin/payouts">
              <Button radius="md" variant="light">
                Open payout queue
              </Button>
            </Link>
          </Group>
        </div>
      </Paper>

      {error ? <Alert color="red">{error}</Alert> : null}

      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
        {cards.map((item) => (
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

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Paper p="xl" radius="md" className="management-panel">
          <Title order={3}>Operational priorities</Title>
          <Stack mt="lg" gap="md">
            <Paper radius="md" p="md" withBorder>
              <Text fw={700}>Payout queue pressure</Text>
              <Text c="dimmed" mt={4}>
                {payoutQueue?.summary?.pending || 0} pending và {payoutQueue?.summary?.processing || 0} processing requests.
              </Text>
            </Paper>
            <Paper radius="md" p="md" withBorder>
              <Text fw={700}>Course moderation focus</Text>
              <Text c="dimmed" mt={4}>
                {overview?.summary?.draftCourses || 0} draft và {overview?.summary?.archivedCourses || 0} archived cần rà tiếp.
              </Text>
            </Paper>
            <Paper radius="md" p="md" withBorder>
              <Text fw={700}>Pending payouts value</Text>
              <Text c="dimmed" mt={4}>
                {formatCurrency(overview?.summary?.payoutTotalRequested || 0)} đang nằm trong hàng đợi payout.
              </Text>
            </Paper>
          </Stack>
        </Paper>

        <Paper p="xl" radius="md" className="management-panel">
          <Title order={3}>Moderation queue</Title>
          <Text c="dimmed" mt="sm">
            Draft và archived courses đang chờ admin review.
          </Text>
          <Stack mt="lg" gap="md">
            {moderationQueue.length === 0 ? (
              <Paper radius="md" p="md" withBorder>
                <Text c="dimmed">No moderated items right now.</Text>
              </Paper>
            ) : null}
            {moderationQueue.slice(0, 4).map((item) => (
              <Paper key={item.courseId} radius="md" p="md" withBorder>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={700}>{item.title}</Text>
                    <Text c="dimmed" size="sm">
                      {item.instructor} • {item.category}
                    </Text>
                  </div>
                  <Badge color={item.status === "draft" ? "blue" : "gray"} variant="light">
                    {item.status}
                  </Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper p="xl" radius="md" className="management-panel">
        <div className="management-panel__header">
          <div>
            <Title order={3}>Recent payout requests</Title>
            <Text c="dimmed" mt="xs">
              Các payout request mới nhất để admin finance rà nhanh trước khi vào queue chi tiết.
            </Text>
          </div>
          <Badge color="blue" variant="light">
            {overview?.recentPayouts?.length || 0} recent items
          </Badge>
        </div>
        <Stack mt="lg" gap="md">
          {(overview?.recentPayouts || []).map((item) => (
            <Paper key={item._id} radius="md" p="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700}>{item.payoutCode}</Text>
                  <Text c="dimmed" size="sm">
                    {item.instructorName} • {item.status} • {formatDateTime(item.createdAt)}
                  </Text>
                </div>
                <Text fw={700}>{formatCurrency(item.amount)}</Text>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>

      {ledger ? (
        <Paper p="xl" radius="md" className="management-panel">
          <div className="management-panel__header">
            <div>
              <Title order={3}>Payout ledger</Title>
              <Text c="dimmed" mt="xs">
                Audit trail cho toàn bộ payout requests.
              </Text>
            </div>
            <Group gap="xs" wrap="wrap">
              {[
                { label: "Pending", value: ledger.summary.pending },
                { label: "Processing", value: ledger.summary.processing },
                { label: "Paid", value: ledger.summary.paid },
                { label: "Rejected", value: ledger.summary.rejected },
              ].map((stat) => (
                <Badge key={stat.label} variant="light" color="blue">
                  {stat.label}: {stat.value}
                </Badge>
              ))}
            </Group>
          </div>
          <Stack mt="lg" gap="md">
            {(ledger.items || []).slice(0, 3).map((entry) => (
              <Paper key={entry.payoutCode} radius="md" p="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text fw={700}>{entry.payoutCode}</Text>
                    <Text c="dimmed" size="sm">
                      {entry.instructor} • {entry.status}
                    </Text>
                  </div>
                  <Text fw={700}>{formatCurrency(entry.amount)}</Text>
                </Group>
                <Text c="dimmed" size="sm" mt="sm">
                  Requested {formatDateTime(entry.requestedAt)}
                  {entry.processedAt ? ` • processed ${formatDateTime(entry.processedAt)}` : ""}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
