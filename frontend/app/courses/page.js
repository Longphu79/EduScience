import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import { LiveCourseCard } from "@/components/live-course-card";
import { PublicShell } from "@/components/public-shell";
import { apiFetch } from "@/lib/api";
import { LEARNING_IMAGES } from "@/lib/marketing-media";

export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
];

const buildCatalogPath = (searchParams) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized) {
      params.set(key, normalized);
    }
  }

  params.set("limit", "12");
  return `/course?${params.toString()}`;
};

export default async function CoursesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const data = await apiFetch(buildCatalogPath(resolvedSearchParams || {}));
  const activeKeyword = resolvedSearchParams?.q || "";
  const activeCategory = resolvedSearchParams?.category || "";
  const activeLevel = resolvedSearchParams?.level || "";
  const activeSort = resolvedSearchParams?.sort || "popular";
  const hasActiveFilters = Boolean(activeKeyword || activeCategory || activeLevel);

  return (
    <PublicShell>
      <Stack gap="xl" py="xl">
        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
            <Stack gap="lg">
              <Badge color="blue" variant="filled" w="fit-content" size="lg">
                Live catalog
              </Badge>
              <Title order={1} size={56} lh={1.04} maw={760}>
                Compare courses on a real desktop catalog, not a plain filter form.
              </Title>
              <Text size="lg" c="dimmed" maw={720}>
                This catalog is now meant to feel like a browsing surface: visual, sortable,
                filterable, and easy to scan across many options on a laptop screen.
              </Text>
              <Group gap="sm" wrap="wrap">
                {(hasActiveFilters
                  ? [
                      activeKeyword ? `Keyword: ${activeKeyword}` : null,
                      activeCategory ? `Category: ${activeCategory}` : null,
                      activeLevel ? `Level: ${activeLevel}` : null,
                    ].filter(Boolean)
                  : data.categories.slice(0, 6)
                ).map((item) => (
                  <Badge key={item} radius="lg" color="blue" variant="light">
                    {item}
                  </Badge>
                ))}
              </Group>
            </Stack>

            <Paper
              radius="lg"
              p="sm"
              className="glass-card"
              style={{ background: "rgba(255,255,255,0.78)" }}
            >
              <Image
                src={LEARNING_IMAGES.catalogBanner}
                alt="Learners collaborating around a table"
                h={360}
                radius="md"
                fit="cover"
              />
            </Paper>
          </SimpleGrid>
        </Paper>

        <div className="catalog-layout">
          <Stack gap="lg" className="catalog-sidebar">
            <Paper radius="lg" p="xl" className="glass-card">
              <Stack gap="lg">
                <div>
                  <Badge color="dark" variant="outline">
                    Refine your search
                  </Badge>
                  <Title order={3} mt="sm">
                    Laptop-first catalog controls
                  </Title>
                  <Text c="dimmed" mt="sm">
                    Keep filtering visible on the left so comparison stays fast while the learner
                    scrolls through courses.
                  </Text>
                </div>

                <form action="/courses">
                  <Stack gap="md">
                    <label style={{ display: "block" }}>
                      <Text size="sm" fw={700} mb={8}>
                        Search
                      </Text>
                      <input
                        name="q"
                        placeholder="Topic, skill, or instructor"
                        defaultValue={activeKeyword}
                        style={{
                          width: "100%",
                          borderRadius: "var(--mantine-radius-md)",
                          border: "1px solid rgba(20, 31, 47, 0.08)",
                          background: "white",
                          padding: "16px 18px",
                          fontSize: 16,
                          outline: "none",
                        }}
                      />
                    </label>
                    <label style={{ display: "block" }}>
                      <Text size="sm" fw={700} mb={8}>
                        Category
                      </Text>
                      <select
                        name="category"
                        defaultValue={activeCategory}
                        style={{
                          width: "100%",
                          borderRadius: "var(--mantine-radius-md)",
                          border: "1px solid rgba(20, 31, 47, 0.08)",
                          background: "white",
                          padding: "16px 18px",
                          fontSize: 16,
                          outline: "none",
                        }}
                      >
                        <option value="">All categories</option>
                        {data.categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "block" }}>
                      <Text size="sm" fw={700} mb={8}>
                        Level
                      </Text>
                      <select
                        name="level"
                        defaultValue={activeLevel}
                        style={{
                          width: "100%",
                          borderRadius: "var(--mantine-radius-md)",
                          border: "1px solid rgba(20, 31, 47, 0.08)",
                          background: "white",
                          padding: "16px 18px",
                          fontSize: 16,
                          outline: "none",
                        }}
                      >
                        <option value="">All levels</option>
                        {data.levels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "block" }}>
                      <Text size="sm" fw={700} mb={8}>
                        Sort
                      </Text>
                      <select
                        name="sort"
                        defaultValue={activeSort}
                        style={{
                          width: "100%",
                          borderRadius: "var(--mantine-radius-md)",
                          border: "1px solid rgba(20, 31, 47, 0.08)",
                          background: "white",
                          padding: "16px 18px",
                          fontSize: 16,
                          outline: "none",
                        }}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <Stack gap="sm" mt="xs">
                      <Button type="submit" radius="lg" size="lg" color="dark" fullWidth>
                        Apply filters
                      </Button>
                      {hasActiveFilters ? (
                        <Link href="/courses">
                          <Button radius="lg" size="lg" variant="light" fullWidth>
                            Clear filters
                          </Button>
                        </Link>
                      ) : null}
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            </Paper>

            <Paper radius="lg" p="xl" className="glass-card">
              <Stack gap="sm">
                <Badge color="blue" variant="light" w="fit-content">
                  Why this layout
                </Badge>
                <Text fw={700}>Wide screens should compare courses, not just stack them.</Text>
                <Text c="dimmed" size="sm">
                  Persistent filters on the left and richer cards on the right are closer to how
                  serious learners browse major course marketplaces on desktop.
                </Text>
              </Stack>
            </Paper>
          </Stack>

          <Stack gap="lg">
            <Paper radius="lg" p="xl" className="glass-card">
              <Group justify="space-between" align="flex-end" wrap="wrap">
                <div>
                  <Badge color="blue" variant="light">
                    Published results
                  </Badge>
                  <Title order={2} mt="sm">
                    {data.total} published course{data.total === 1 ? "" : "s"} available now
                  </Title>
                </div>
                <Text c="dimmed" maw={560}>
                  Search by topic, narrow by category and level, then sort by popularity, rating,
                  or price. The point is quick comparison without losing context.
                </Text>
              </Group>

              <Group mt="lg" gap="sm" wrap="wrap">
                {(hasActiveFilters
                  ? [
                      activeKeyword ? `Keyword: ${activeKeyword}` : null,
                      activeCategory ? `Category: ${activeCategory}` : null,
                      activeLevel ? `Level: ${activeLevel}` : null,
                      `Sort: ${SORT_OPTIONS.find((option) => option.value === activeSort)?.label || "Most popular"}`,
                    ].filter(Boolean)
                  : ["Popular picks", "Career skills", "Structured pathways", "Laptop-friendly browsing"]
                ).map((item) => (
                  <Badge key={item} radius="lg" color="dark" variant="outline">
                    {item}
                  </Badge>
                ))}
              </Group>
            </Paper>

            {data.items.length > 0 ? (
              <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
                {data.items.map((course) => (
                  <LiveCourseCard key={course._id} course={course} />
                ))}
              </SimpleGrid>
            ) : (
              <Card radius="lg" padding="xl" className="glass-card">
                <Stack gap="md" align="flex-start">
                  <Badge color="blue" variant="light">
                    No matches yet
                  </Badge>
                  <Title order={3}>This filter combination returned no published courses.</Title>
                  <Text c="dimmed">
                    Broaden the keyword or reset the filters to return to the full catalog view.
                  </Text>
                  <Link href="/courses">
                    <Button radius="lg" color="dark" rightSection={<IconArrowRight size={16} />}>
                      Reset catalog
                    </Button>
                  </Link>
                </Stack>
              </Card>
            )}
          </Stack>
        </div>
      </Stack>
    </PublicShell>
  );
}
