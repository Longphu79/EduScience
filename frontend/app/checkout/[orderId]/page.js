"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconRefresh,
  IconSchool,
} from "@tabler/icons-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PublicShell } from "@/components/public-shell";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { backendBrowserApiFetch, backendBrowserPostJson } from "@/lib/web-api";

const getStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "green";
    case "expired":
      return "red";
    default:
      return "blue";
  }
};

const formatCountdown = (expiredAt) => {
  if (!expiredAt) {
    return "";
  }

  const diff = new Date(expiredAt).getTime() - Date.now();

  if (diff <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("");

  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;

  const loadCheckout = async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);

    try {
      const response = await backendBrowserApiFetch(`/api/checkout/${orderId}`);
      setCheckout(response);
      setCountdown(formatCountdown(response.expiredAt));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckout().catch((loadError) => setError(loadError.message));
  }, [orderId]);

  useEffect(() => {
    if (!checkout?.expiredAt || checkout.status !== "pending") {
      setCountdown(checkout?.expiredAt ? formatCountdown(checkout.expiredAt) : "");
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCountdown(formatCountdown(checkout.expiredAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [checkout?.expiredAt, checkout?.status]);

  const primaryCourseSlug = useMemo(
    () => checkout?.items?.find((item) => item.courseSlug)?.courseSlug || null,
    [checkout?.items],
  );

  if (loading && !checkout) {
    return (
      <PublicShell>
        <Stack align="center" py="xl">
          <Loader color="blue" />
          <Text c="dimmed">Loading checkout...</Text>
        </Stack>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Stack gap="xl" py="xl">
        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
            <Stack gap="lg">
              <div>
                <Badge color="blue" variant="filled" w="fit-content">
                  Checkout
                </Badge>
                <Title order={1} mt="md" size={52} lh={1.04} maw={720}>
                  Complete payment, then move directly into the learning workspace.
                </Title>
                <Text size="lg" c="dimmed" mt="md" maw={680}>
                  This page is backed by the real checkout and order APIs, including expired and
                  retryable payment states.
                </Text>
              </div>

              {checkout ? (
                <Group gap="sm" wrap="wrap">
                  <Badge radius="lg" color="dark" variant="outline">
                    {checkout.orderCode}
                  </Badge>
                  <Badge radius="lg" color={getStatusColor(checkout.status)} variant="light">
                    {checkout.status}
                  </Badge>
                  <Badge radius="lg" color="grape" variant="light">
                    {checkout.fulfillmentStatus}
                  </Badge>
                  {checkout.status === "pending" ? (
                    <Badge radius="lg" color="blue" variant="light">
                      {countdown || "Pending"}
                    </Badge>
                  ) : null}
                </Group>
              ) : null}

              <Group gap="sm" wrap="wrap">
                <Link href="/cart">
                  <Button radius="lg" variant="light">
                    Back to cart
                  </Button>
                </Link>
                <Button
                  radius="lg"
                  color="blue"
                  leftSection={<IconRefresh size={16} />}
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");

                    try {
                      await loadCheckout();
                    } catch (refreshError) {
                      setError(refreshError.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Refresh payment status
                </Button>
              </Group>
            </Stack>

            <Card radius="lg" padding="xl" bg="dark.8" c="white">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text c="blue.3" fw={700}>
                    Amount due
                  </Text>
                  <Title order={2} mt="sm">
                    {formatCurrency(checkout?.totalAmount)}
                  </Title>
                </div>
                <ThemeIcon radius="lg" size={48} color="blue">
                  <IconCreditCard size={22} />
                </ThemeIcon>
              </Group>

              <Divider my="lg" color="rgba(255,255,255,0.12)" />

              <Stack gap="sm">
                <Group justify="space-between">
                  <Text c="gray.3">Created</Text>
                  <Text c="white">{formatDateTime(checkout?.createdAt)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="gray.3">Expires</Text>
                  <Text c="white">{formatDateTime(checkout?.expiredAt)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="gray.3">After payment</Text>
                  <Text c="white">Auto-enroll into learning</Text>
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>
        </Paper>

        {error ? (
          <Alert color="red" radius="lg" title="Checkout error">
            {error}
          </Alert>
        ) : null}

        {checkout?.status === "paid" && checkout.isReadyToLearn ? (
          <Alert
            color="green"
            radius="lg"
            title="Payment confirmed"
            icon={<IconCheck size={16} />}
          >
            Order is paid and fulfillment is complete. You can move straight into the learning
            dashboard.
          </Alert>
        ) : null}

        {checkout?.status === "expired" ? (
          <Alert color="blue" radius="lg" title="Payment expired" icon={<IconClock size={16} />}>
            This order expired before payment landed. Retry to create a fresh checkout session.
          </Alert>
        ) : null}

        <Grid gutter="lg" align="start">
          <Grid.Col span={{ base: 12, xl: 8 }}>
            <Card radius="lg" padding="xl" className="glass-card">
            <Group justify="space-between" align="end" wrap="wrap">
              <div>
                <Badge color="blue" variant="light">
                  Order items
                </Badge>
                <Title order={2} mt="sm">
                  Courses in this order
                </Title>
              </div>
              <Text c="dimmed">
                The order summary is mirrored from the backend checkout response.
              </Text>
            </Group>

            <ScrollArea mt="lg">
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Course</Table.Th>
                    <Table.Th>Quantity</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(checkout?.items || []).map((item) => (
                    <Table.Tr key={`${checkout.orderId}-${item.courseId}`}>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text fw={700}>{item.title}</Text>
                          <Text size="sm" c="dimmed">
                            Course ID {item.courseId}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>{item.quantity ?? 1}</Table.Td>
                      <Table.Td>{formatCurrency(item.price)}</Table.Td>
                      <Table.Td>
                        {item.courseSlug ? (
                          <Link href={`/courses/${item.courseSlug}`}>
                            <Button radius="lg" variant="light">
                              View public page
                            </Button>
                          </Link>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Public page unavailable
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xl: 4 }}>
            <Stack gap="lg">
              {checkout?.status === "pending" ? (
                <Card radius="lg" padding="xl" className="glass-card">
                <Badge color="blue" variant="light">
                  Pay with SePay QR
                </Badge>
                <Title order={3} mt="sm">
                  Scan and transfer
                </Title>
                <Text c="dimmed" mt="sm">
                  Use the order code as transfer content. Refresh payment status after sending the
                  transfer.
                </Text>
                {checkout.qrUrl ? (
                  <Image src={checkout.qrUrl} alt={`QR for ${checkout.orderCode}`} mt="lg" radius="lg" />
                ) : null}
                <Text size="sm" c="dimmed" mt="md">
                  Countdown: {countdown || "Pending"}
                </Text>
                </Card>
              ) : null}

              {checkout?.status === "expired" ? (
                <Card radius="lg" padding="xl" className="glass-card">
                <Badge color="blue" variant="light">
                  Retry payment
                </Badge>
                <Title order={3} mt="sm">
                  Create a new checkout session
                </Title>
                <Text c="dimmed" mt="sm">
                  The previous QR is no longer valid after expiration.
                </Text>
                <Button
                  radius="lg"
                  color="blue"
                  mt="lg"
                  leftSection={<IconRefresh size={16} />}
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");

                    try {
                      const retryOrder = await backendBrowserPostJson(
                        `/api/order/${checkout.orderId}/retry`,
                        {},
                      );
                      router.push(`/checkout/${retryOrder.orderId}`);
                    } catch (retryError) {
                      setError(retryError.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Retry checkout
                </Button>
                </Card>
              ) : null}

              {checkout?.status === "paid" ? (
                <Card radius="lg" padding="xl" className="glass-card">
                <Badge color="green" variant="light">
                  Ready to learn
                </Badge>
                <Title order={3} mt="sm">
                  Continue into the student workspace
                </Title>
                <Text c="dimmed" mt="sm">
                  Once fulfillment is complete, the course is available in My learning.
                </Text>
                <Group gap="sm" mt="lg" wrap="wrap">
                  <Link href="/my-learning">
                    <Button radius="lg" color="blue" leftSection={<IconSchool size={16} />}>
                      Open my learning
                    </Button>
                  </Link>
                  {primaryCourseSlug ? (
                    <Link href={`/learn/${primaryCourseSlug}`}>
                      <Button
                        radius="lg"
                        color="dark"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Open learning player
                      </Button>
                    </Link>
                  ) : null}
                </Group>
                </Card>
              ) : null}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </PublicShell>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <CheckoutContent />
    </AuthGuard>
  );
}
