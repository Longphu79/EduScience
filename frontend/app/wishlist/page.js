"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconHeartFilled, IconShoppingCartPlus } from "@tabler/icons-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PublicShell } from "@/components/public-shell";
import { useStudentCommerce } from "@/components/student-commerce-provider";
import {
  getCourseDurationLabel,
  getCourseLevelLabel,
  getCoursePriceLabel,
} from "@/lib/course-display";

function WishlistContent() {
  const commerce = useStudentCommerce();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("6");

  const numericPageSize = Number(pageSize) || 6;
  const totalPages = Math.max(1, Math.ceil(commerce.wishlistCourses.length / numericPageSize));
  const pagedCourses = useMemo(() => {
    const start = (page - 1) * numericPageSize;
    return commerce.wishlistCourses.slice(start, start + numericPageSize);
  }, [commerce.wishlistCourses, numericPageSize, page]);

  if (commerce.loading && !commerce.loaded) {
    return (
      <PublicShell>
        <Stack align="center" py="xl">
          <Loader color="blue" />
          <Text c="dimmed">Loading wishlist...</Text>
        </Stack>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Stack gap="xl" py="xl">
        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <Stack gap="lg">
            <div>
              <Badge color="blue" variant="filled" w="fit-content">
                Wishlist
              </Badge>
              <Title order={1} mt="md" size={52} lh={1.04} maw={760}>
                Save promising courses first, then move the right ones into checkout.
              </Title>
              <Text size="lg" c="dimmed" mt="md" maw={760}>
                This page keeps public discovery and purchase intent connected, so the learner
                can compare saved options without losing context.
              </Text>
            </div>

            <Group gap="sm" wrap="wrap">
              <Badge radius="lg" color="blue" variant="light">
                {commerce.wishlistCourses.length} saved courses
              </Badge>
              <Badge radius="lg" color="teal" variant="light">
                {commerce.wishlistCourses.filter((course) => course.isPopular).length} popular picks
              </Badge>
            </Group>

            <Group gap="sm" wrap="wrap">
              <Link href="/cart">
                <Button radius="lg" color="dark" rightSection={<IconArrowRight size={16} />}>
                  Open cart
                </Button>
              </Link>
              {commerce.wishlistCourses.length ? (
                <Button radius="lg" variant="light" onClick={() => commerce.clearWishlist()}>
                  Clear wishlist
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Paper>

        {commerce.wishlistCourses.length ? null : (
          <Alert color="blue" radius="lg" title="Wishlist is empty">
            Browse the catalog and save a few published courses here before you decide what to buy.
          </Alert>
        )}

        <Stack gap="lg">
          {pagedCourses.map((course) => (
            <Card
              key={course._id}
              radius="md"
              padding="xl"
              className="glass-card"
              style={{ background: "rgba(245, 249, 255, 0.94)" }}
            >
              <Stack gap="lg" h="100%">
                <div>
                  <Group gap="xs" wrap="wrap">
                    <Badge color="blue" variant="light">
                      {course.category || "Course"}
                    </Badge>
                    <Badge color="dark" variant="outline">
                      {getCourseLevelLabel(course.level)}
                    </Badge>
                  </Group>

                  <Title order={3} mt="md">
                    {course.title}
                  </Title>
                  <Text c="dimmed" mt="sm" lineClamp={3}>
                    {course.shortDescription}
                  </Text>
                </div>

                <Group gap="xs" wrap="wrap">
                  <Badge color="dark" variant="outline">
                    {getCoursePriceLabel(course)}
                  </Badge>
                  <Badge color="teal" variant="light">
                    {getCourseDurationLabel(course)}
                  </Badge>
                  <Badge color="grape" variant="light">
                    {course.totalLessons || 0} lessons
                  </Badge>
                </Group>

                <Group justify="space-between" align="center" mt="auto" wrap="wrap">
                  <Button
                    radius="lg"
                    variant="light"
                    color="blue"
                    leftSection={<IconHeartFilled size={16} />}
                    onClick={() =>
                      commerce.toggleWishlist({
                        courseId: course._id,
                        courseTitle: course.title,
                      })
                    }
                  >
                    Remove
                  </Button>
                  <Group gap="sm" wrap="wrap">
                    <Button
                      radius="lg"
                      color="blue"
                      leftSection={<IconShoppingCartPlus size={16} />}
                      onClick={() =>
                        commerce.addToCart({
                          courseId: course._id,
                          courseTitle: course.title,
                        })
                      }
                    >
                      Add to cart
                    </Button>
                    <Link href={`/courses/${course.slug}`}>
                      <Button radius="lg" color="dark">
                        View details
                      </Button>
                    </Link>
                  </Group>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>

        {commerce.wishlistCourses.length > 0 ? (
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm" align="center">
              <Text c="dimmed" size="sm">
                Items per page
              </Text>
              <Select
                aria-label="Items per page"
                value={pageSize}
                onChange={(value) => {
                  setPageSize(value || "6");
                  setPage(1);
                }}
                data={[
                  { value: "3", label: "3 / page" },
                  { value: "6", label: "6 / page" },
                  { value: "9", label: "9 / page" },
                ]}
                w={120}
              />
              <Text c="dimmed" size="sm">
                Showing {(page - 1) * numericPageSize + 1}-
                {Math.min(page * numericPageSize, commerce.wishlistCourses.length)} of{" "}
                {commerce.wishlistCourses.length}
              </Text>
            </Group>
            {commerce.wishlistCourses.length > numericPageSize ? (
              <Pagination total={totalPages} value={page} onChange={setPage} />
            ) : null}
          </Group>
        ) : null}
      </Stack>
    </PublicShell>
  );
}

export default function WishlistPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <WishlistContent />
    </AuthGuard>
  );
}
