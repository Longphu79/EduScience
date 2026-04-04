"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Loader,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCreditCard,
  IconHistory,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PublicShell } from "@/components/public-shell";
import { useStudentCommerce } from "@/components/student-commerce-provider";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { LEARNING_IMAGES } from "@/lib/marketing-media";
import { backendBrowserApiFetch, backendBrowserPostJson } from "@/lib/web-api";

const getOrderStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "green";
    case "expired":
      return "red";
    default:
      return "blue";
  }
};

function CartContent() {
  const commerce = useStudentCommerce();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const loadOrders = async () => {
    setOrdersLoading(true);

    try {
      const response = await backendBrowserApiFetch("/api/order");
      setOrders(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders().catch((loadError) => setError(loadError.message));
  }, []);

  const subtotal = useMemo(
    () =>
      commerce.cartItems.reduce((sum, item) => {
        const course = item.course || {};
        const unitPrice = course.salePrice ?? course.price ?? 0;
        return sum + unitPrice * (item.quantity ?? 1);
      }, 0),
    [commerce.cartItems],
  );

  const proceedToCheckout = async () => {
    setBusyKey("checkout");
    setError("");

    try {
      const order = await commerce.createCheckout();
      await loadOrders();
      router.push(`/checkout/${order.orderId}`);
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setBusyKey("");
    }
  };

  if (commerce.loading && !commerce.loaded) {
    return (
      <PublicShell>
        <Stack align="center" py="xl">
          <Loader color="blue" />
          <Text c="dimmed">Loading cart...</Text>
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
                  Cart and payment
                </Badge>
                <Title order={1} mt="md" size={52} lh={1.04} maw={720}>
                  Review the courses you are about to pay for, then start checkout in one step.
                </Title>
                <Text size="lg" c="dimmed" mt="md" maw={680}>
                  The cart keeps the student purchase funnel visible and gives QA a real order
                  history surface for paid and expired states.
                </Text>
              </div>

              <Group gap="sm" wrap="wrap">
                <Badge radius="lg" color="blue" variant="light">
                  {commerce.cartQuantity} items in cart
                </Badge>
                <Badge radius="lg" color="teal" variant="light">
                  {formatCurrency(subtotal)} current subtotal
                </Badge>
                <Badge radius="lg" color="grape" variant="light">
                  {orders.length} orders on record
                </Badge>
              </Group>

              <Group gap="sm" wrap="wrap">
                <Link href="/wishlist">
                  <Button radius="lg" variant="light">
                    Back to wishlist
                  </Button>
                </Link>
                <Button
                  radius="lg"
                  color="dark"
                  leftSection={<IconCreditCard size={16} />}
                  rightSection={<IconArrowRight size={16} />}
                  disabled={!commerce.cartItems.length}
                  loading={busyKey === "checkout"}
                  onClick={proceedToCheckout}
                >
                  Proceed to checkout
                </Button>
              </Group>
            </Stack>

            <Paper radius="lg" p="sm" className="glass-card">
              <Image
                src={LEARNING_IMAGES.detailFallback}
                alt="Student preparing payment"
                h={360}
                radius="md"
                fit="cover"
              />
            </Paper>
          </SimpleGrid>
        </Paper>

        {error ? (
          <Alert color="red" radius="lg" title="Action failed">
            {error}
          </Alert>
        ) : null}

        <Grid gutter="lg" align="start">
          <Grid.Col span={{ base: 12, xl: 8 }}>
            <Card radius="lg" padding="xl" className="glass-card">
            <Group justify="space-between" align="end" wrap="wrap">
              <div>
                <Badge color="blue" variant="light">
                  Current cart
                </Badge>
                <Title order={2} mt="sm">
                  Student cart
                </Title>
              </div>
              <Text c="dimmed">
                Remove or adjust line items before the order is created.
              </Text>
            </Group>

            {commerce.cartItems.length ? (
              <ScrollArea mt="lg">
                <Table verticalSpacing="lg" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Course</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {commerce.cartItems.map((item) => {
                      const course = item.course || {};
                      const unitPrice = course.salePrice ?? course.price ?? 0;
                      const actionKey = `item-${course._id}`;

                      return (
                        <Table.Tr key={course._id || item.course}>
                          <Table.Td>
                            <Stack gap={6}>
                              <Text fw={700}>{course.title || "Course"}</Text>
                              <Text c="dimmed" size="sm">
                                {course.shortDescription}
                              </Text>
                              <Group gap="xs" wrap="wrap">
                                <Badge color="blue" variant="light">
                                  {course.category || "Course"}
                                </Badge>
                                <Badge color="dark" variant="outline">
                                  {course.totalLessons || 0} lessons
                                </Badge>
                              </Group>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Box maw={96}>
                              <NumberInput
                                min={1}
                                radius="lg"
                                value={item.quantity ?? 1}
                                onChange={async (value) => {
                                  const numericValue = Number(value);

                                  if (!Number.isFinite(numericValue) || numericValue < 1) {
                                    return;
                                  }

                                  setBusyKey(actionKey);
                                  setError("");

                                  try {
                                    await commerce.updateCartQuantity({
                                      courseId: course._id,
                                      quantity: numericValue,
                                    });
                                  } catch (updateError) {
                                    setError(updateError.message);
                                  } finally {
                                    setBusyKey("");
                                  }
                                }}
                                disabled={busyKey === actionKey}
                              />
                            </Box>
                          </Table.Td>
                          <Table.Td>{formatCurrency(unitPrice * (item.quantity ?? 1))}</Table.Td>
                          <Table.Td>
                            <Button
                              radius="lg"
                              variant="light"
                              color="red"
                              leftSection={<IconTrash size={16} />}
                              loading={busyKey === actionKey}
                              onClick={async () => {
                                setBusyKey(actionKey);
                                setError("");

                                try {
                                  await commerce.removeFromCart({
                                    courseId: course._id,
                                    courseTitle: course.title,
                                  });
                                } catch (removeError) {
                                  setError(removeError.message);
                                } finally {
                                  setBusyKey("");
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            ) : (
              <Alert color="blue" radius="lg" mt="lg">
                Cart is empty. Add a published course from the catalog or your wishlist first.
              </Alert>
            )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xl: 4 }}>
            <Stack gap="lg">
              <Card radius="lg" padding="xl" className="glass-card">
              <Group justify="space-between" align="center">
                <div>
                  <Badge color="dark" variant="outline">
                    Order summary
                  </Badge>
                  <Title order={3} mt="sm">
                    Ready to pay
                  </Title>
                </div>
                <IconShoppingCart size={24} />
              </Group>
              <Stack gap="sm" mt="lg">
                <Group justify="space-between">
                  <Text c="dimmed">Subtotal</Text>
                  <Text fw={700}>{formatCurrency(subtotal)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Payment rail</Text>
                  <Text fw={700}>SePay QR</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">After payment</Text>
                  <Text fw={700}>Auto-enroll into learning</Text>
                </Group>
              </Stack>

              <Button
                radius="lg"
                color="blue"
                fullWidth
                mt="xl"
                leftSection={<IconCreditCard size={16} />}
                loading={busyKey === "checkout"}
                disabled={!commerce.cartItems.length}
                onClick={proceedToCheckout}
              >
                Start checkout
              </Button>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Card radius="lg" padding="xl" className="glass-card">
          <Group justify="space-between" align="end" wrap="wrap">
            <div>
              <Badge color="blue" variant="light" leftSection={<IconHistory size={14} />}>
                Order history
              </Badge>
              <Title order={2} mt="sm">
                Recent payment attempts
              </Title>
            </div>
            <Text c="dimmed">Includes paid, pending, and expired QA fixtures.</Text>
          </Group>

          {ordersLoading ? (
            <Group justify="center" py="xl">
              <Loader color="blue" />
            </Group>
          ) : (
            <ScrollArea mt="lg">
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order</Table.Th>
                    <Table.Th>Courses</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map((order) => (
                    <Table.Tr key={order.orderId}>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text fw={700}>{order.orderCode}</Text>
                          <Text size="sm" c="dimmed">
                            Created {formatDateTime(order.createdAt || order.paidAt || order.expiredAt)}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          {order.items.map((item) => (
                            <Text key={`${order.orderId}-${item.courseId}`} size="sm">
                              {item.title}
                            </Text>
                          ))}
                        </Stack>
                      </Table.Td>
                      <Table.Td>{formatCurrency(order.totalAmount)}</Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="wrap">
                          <Badge color={getOrderStatusColor(order.status)} variant="light">
                            {order.status}
                          </Badge>
                          <Badge color="grape" variant="light">
                            {order.fulfillmentStatus}
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm" wrap="wrap">
                          <Link href={`/checkout/${order.orderId}`}>
                            <Button radius="lg" variant="light">
                              Open
                            </Button>
                          </Link>
                          {order.canRetry ? (
                            <Button
                              radius="lg"
                              color="blue"
                              loading={busyKey === order.orderId}
                              onClick={async () => {
                                setBusyKey(order.orderId);
                                setError("");

                                try {
                                  const retryOrder = await backendBrowserPostJson(
                                    `/api/order/${order.orderId}/retry`,
                                    {},
                                  );
                                  await loadOrders();
                                  router.push(`/checkout/${retryOrder.orderId}`);
                                } catch (retryError) {
                                  setError(retryError.message);
                                } finally {
                                  setBusyKey("");
                                }
                              }}
                            >
                              Retry
                            </Button>
                          ) : null}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Stack>
    </PublicShell>
  );
}

export default function CartPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <CartContent />
    </AuthGuard>
  );
}
