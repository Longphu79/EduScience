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
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconBook2, IconCertificate, IconCircleCheck, IconMessages } from "@tabler/icons-react";

import { LiveCourseCard } from "@/components/live-course-card";
import { PublicShell } from "@/components/public-shell";
import { apiFetch } from "@/lib/api";
import { CLIENT_BRANDS, CLIENT_GOALS, LEARNING_IMAGES } from "@/lib/marketing-media";

export const dynamic = "force-dynamic";

const CATEGORY_ART = [
  LEARNING_IMAGES.heroDesk,
  LEARNING_IMAGES.heroFocus,
  LEARNING_IMAGES.heroInstructor,
  LEARNING_IMAGES.heroMain,
];

export default async function HomePage() {
  const [featuredCourses, catalog] = await Promise.all([
    apiFetch("/course/popular"),
    apiFetch("/course?limit=9&sort=popular"),
  ]);
  const categories = catalog.categories.slice(0, 6);
  const spotlightCategories = categories.slice(0, 4);
  const stats = [
    { label: "Published courses", value: String(catalog.total) },
    {
      label: "Learner reviews",
      value: `${catalog.items.reduce((sum, course) => sum + (course.totalReviews || 0), 0)}+`,
    },
    {
      label: "Structured lessons",
      value: `${catalog.items.reduce((sum, course) => sum + (course.totalLessons || 0), 0)}+`,
    },
    {
      label: "Categories live",
      value: String(catalog.categories.length),
    },
  ];

  return (
    <PublicShell>
      <Stack gap="xl" py="xl">
        <Paper
          radius="lg"
          p={{ base: "xl", md: "2rem", xl: "3rem" }}
          className="glass-card"
          style={{
            background:
              "linear-gradient(135deg, rgba(245, 249, 255, 0.98), rgba(237,244,255,0.95))",
            overflow: "hidden",
          }}
        >
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing={{ base: "xl", xl: "3rem" }}>
            <Stack gap="xl">
              <Stack gap="lg">
                <Badge color="blue" variant="filled" w="fit-content" size="lg">
                  Desktop-first learner experience
                </Badge>
                <Title order={1} size={64} lh={1.02} maw={760}>
                  Browse courses the way serious learners compare Udemy and Coursera: wide layout,
                  stronger imagery, and clearer reasons to enroll.
                </Title>
                <Text size="xl" c="dimmed" maw={760}>
                  The client app now leans into marketplace behavior: large visuals, obvious search,
                  category discovery, trust-building course cards, and a cleaner path from browsing
                  into actual learning.
                </Text>
              </Stack>

              <Paper
                radius="lg"
                p="xl"
                withBorder
                style={{ background: "rgba(255,255,255,0.84)" }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="center" wrap="wrap">
                    <div>
                      <Text fw={800}>Search by skill, topic, or instructor</Text>
                      <Text c="dimmed" size="sm" mt={4}>
                        Built for laptop browsing so guests can compare options before hitting a
                        login wall.
                      </Text>
                    </div>
                    <Badge color="dark" variant="outline">
                      Public catalog
                    </Badge>
                  </Group>

                  <form action="/courses">
                    <Group align="end" wrap="wrap">
                      <div
                        style={{
                          flex: "1 1 360px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "16px 18px",
                          borderRadius: "var(--mantine-radius-xl)",
                          background: "white",
                          border: "1px solid rgba(20, 31, 47, 0.08)",
                        }}
                      >
                        <span style={{ color: "var(--page-muted)", fontSize: 14 }}>Search</span>
                        <input
                          name="q"
                          placeholder="AI, physics, biology, data analytics..."
                          style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            width: "100%",
                            fontSize: 16,
                            color: "var(--page-ink)",
                          }}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        radius="lg"
                        color="dark"
                        rightSection={<IconArrowRight size={18} />}
                      >
                        Explore catalog
                      </Button>
                    </Group>
                  </form>

                  <Group gap="sm" wrap="wrap">
                    {categories.map((category) => (
                      <Link key={category} href={`/courses?category=${encodeURIComponent(category)}`}>
                        <Badge size="lg" radius="lg" variant="light" color="blue">
                          {category}
                        </Badge>
                      </Link>
                    ))}
                  </Group>
                </Stack>
              </Paper>

              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                {stats.map((stat) => (
                  <Card key={stat.label} radius="md" padding="lg" className="glass-card">
                    <Text c="dimmed" size="sm">
                      {stat.label}
                    </Text>
                    <Title order={2} mt="sm">
                      {stat.value}
                    </Title>
                  </Card>
                ))}
              </SimpleGrid>

              <Group gap="md" wrap="wrap">
                <Link href="/courses">
                  <Button size="lg" radius="lg" color="dark">
                    Browse all courses
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" radius="lg" variant="light">
                    Student login
                  </Button>
                </Link>
              </Group>
            </Stack>

            <Stack gap="md">
              <Paper
                radius="lg"
                p="sm"
                className="glass-card"
                style={{ background: "rgba(20, 31, 47, 0.94)", color: "white" }}
              >
                <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--mantine-radius-lg)" }}>
                  <Image
                    src={LEARNING_IMAGES.heroMain}
                    alt="Learners collaborating around a laptop"
                    h={420}
                    fit="cover"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.72) 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", left: 24, right: 24, bottom: 24 }}>
                    <Badge color="blue" variant="filled">
                      Learning journeys that feel tangible
                    </Badge>
                    <Title order={2} mt="md" c="white" maw={520}>
                      Public pages should help people imagine the study experience before they ever
                      sign in.
                    </Title>
                  </div>
                </div>
              </Paper>

              <SimpleGrid cols={2} spacing="md">
                <Paper radius="md" p="sm" className="glass-card">
                  <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--mantine-radius-md)" }}>
                    <Image
                      src={LEARNING_IMAGES.heroDesk}
                      alt="Learner working on a laptop"
                      h={220}
                      fit="cover"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.68) 100%)",
                      }}
                    />
                    <div style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                      <Text c="white" fw={700}>
                        Compare outcomes
                      </Text>
                      <Text c="gray.2" size="sm">
                        lessons, duration, price, rating
                      </Text>
                    </div>
                  </div>
                </Paper>

                <Stack gap="md">
                  <Paper radius="md" p="md" className="glass-card" h="100%">
                    <Badge color="dark" variant="outline">
                      Preview-first
                    </Badge>
                    <Title order={3} mt="md">
                      Clear catalog hierarchy beats generic cards.
                    </Title>
                    <Text c="dimmed" mt="sm">
                      Bigger thumbnails, stronger typography, and visible metadata make laptop
                      browsing feel closer to a real marketplace.
                    </Text>
                  </Paper>
                  <Paper radius="md" p="sm" className="glass-card">
                    <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--mantine-radius-md)" }}>
                      <Image
                        src={LEARNING_IMAGES.heroInstructor}
                        alt="Instructor presenting to a classroom"
                        h={146}
                        fit="cover"
                      />
                    </div>
                  </Paper>
                </Stack>
              </SimpleGrid>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Paper radius="lg" p="xl" className="glass-card">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            <Stack gap="lg">
              <div>
                <Badge color="blue" variant="light">
                  Marketplace trust cues
                </Badge>
                <Title order={2} mt="sm">
                  Learners expect recognizable signals before they commit to a course.
                </Title>
              </div>
              <Text c="dimmed" size="lg" maw={680}>
                Coursera leans on institution trust and career outcomes. Udemy leans on visible
                catalog breadth and comparison speed. The client-facing app now borrows both
                patterns: logos, outcomes, and a stronger browse-to-detail funnel.
              </Text>
            </Stack>

            <Stack gap="md" justify="center">
              <Text size="sm" fw={800} c="dimmed" tt="uppercase">
                Trusted learning themes
              </Text>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
                {CLIENT_BRANDS.map((brand) => (
                  <Paper
                    key={brand}
                    radius="md"
                    p="lg"
                    withBorder
                    style={{
                      background: "rgba(255,255,255,0.86)",
                      textAlign: "center",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {brand}
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Paper radius="lg" p="xl" className="glass-card">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
            <div>
              <Badge color="blue" variant="light">
                What the public side should do
              </Badge>
              <Title order={2} mt="sm">
                Make discovery, comparison, and trust obvious before the learner logs in.
              </Title>
            </div>
            <Group gap="sm" wrap="wrap">
              {[
                "Large imagery",
                "Category discovery",
                "Outcome-led copy",
                "Clear lesson metadata",
                "Strong desktop hierarchy",
              ].map((item) => (
                <Badge key={item} radius="lg" variant="outline" color="dark">
                  {item}
                </Badge>
              ))}
            </Group>
          </Group>
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
          {CLIENT_GOALS.map((goal, index) => (
            <Paper key={goal.title} radius="lg" p="md" className="glass-card">
              <Image
                src={CATEGORY_ART[index]}
                alt={goal.title}
                h={220}
                radius="md"
                fit="cover"
              />
              <Badge color="blue" variant="light" mt="lg">
                Path {String(index + 1).padStart(2, "0")}
              </Badge>
              <Title order={3} mt="md">
                {goal.title}
              </Title>
              <Text c="dimmed" mt="sm">
                {goal.body}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>

        <Paper radius="lg" p="xl" className="glass-card">
          <Group justify="space-between" align="end" mb="lg">
            <div>
              <Badge color="blue" variant="light">
                Explore by category
              </Badge>
              <Title order={2} mt="sm">
                Give categories enough presence that people want to click them.
              </Title>
            </div>
            <Link href="/courses">
              <Button radius="lg" variant="light">
                Full catalog
              </Button>
            </Link>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
            {spotlightCategories.map((category, index) => (
              <Link key={category} href={`/courses?category=${encodeURIComponent(category)}`}>
                <Paper
                  radius="lg"
                  p="md"
                  withBorder
                  style={{ background: "rgba(255,255,255,0.82)", height: "100%" }}
                >
                  <Image
                    src={CATEGORY_ART[index % CATEGORY_ART.length]}
                    alt={category}
                    h={200}
                    radius="md"
                    fit="cover"
                  />
                  <Badge color="dark" variant="outline" mt="lg">
                    {category}
                  </Badge>
                  <Title order={3} mt="md">
                    Learn {category.toLowerCase()} with structured lessons.
                  </Title>
                  <Text c="dimmed" mt="sm">
                    Move from overview to syllabus and public detail without losing momentum.
                  </Text>
                </Paper>
              </Link>
            ))}
          </SimpleGrid>
        </Paper>

        <Stack gap="lg">
          <Group justify="space-between" align="end" wrap="wrap">
            <div>
              <Badge color="blue" variant="light">
                Popular now
              </Badge>
              <Title order={2} mt="sm">
                Marketplace cards should look like something worth comparing.
              </Title>
            </div>
            <Badge color="dark" variant="outline">
              Live API data
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
            {featuredCourses.slice(0, 4).map((course) => (
              <LiveCourseCard key={course._id} course={course} />
            ))}
          </SimpleGrid>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {[
            {
              icon: IconBook2,
              title: "Discovery that feels intentional",
              body: "A learner should see why a course matters from the first screen, not after logging in.",
            },
            {
              icon: IconMessages,
              title: "Learning flow with depth",
              body: "Notes, comments, progress, reminders, and certificates already create a richer student path behind the public pages.",
            },
            {
              icon: IconCertificate,
              title: "Closer to an actual marketplace",
              body: "Course cards, category browsing, and public detail pages now push the product toward a stronger MVP surface.",
            },
          ].map((item) => (
            <Card key={item.title} radius="lg" padding="xl" className="glass-card">
              <ThemeIcon color="blue" radius="lg" size={56}>
                <item.icon size={28} />
              </ThemeIcon>
              <Title order={3} mt="xl">
                {item.title}
              </Title>
              <Text c="dimmed" mt="sm">
                {item.body}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
            <Stack gap="lg">
              <Badge color="dark" variant="filled" w="fit-content">
                Ready to browse deeper
              </Badge>
              <Title order={2} maw={700}>
                Keep the client-facing site focused on learning value, with stronger visuals and
                cleaner laptop layout than the current stripped-down version.
              </Title>
              <Text c="dimmed" size="lg">
                Public pages should sell the study experience first. Instructor and admin operations
                belong in their own workspaces; the client app should feel like a real storefront.
              </Text>
              <Group gap="md" wrap="wrap">
                {[
                  "Preview lessons",
                  "Visible outcomes",
                  "Instructor trust",
                  "Desktop browsing",
                  "Discovery to learning",
                ].map((item) => (
                  <Group key={item} gap={8} wrap="nowrap">
                    <ThemeIcon color="blue" variant="light" radius="lg" size={28}>
                      <IconCircleCheck size={16} />
                    </ThemeIcon>
                    <Text>{item}</Text>
                  </Group>
                ))}
              </Group>
            </Stack>

            <Stack gap="md">
              <Paper radius="lg" p="sm" className="glass-card">
                <Image
                  src={LEARNING_IMAGES.heroFocus}
                  alt="Focused learner at a laptop"
                  h={320}
                  radius="md"
                  fit="cover"
                />
              </Paper>
              <Group justify="flex-start" gap="md" wrap="wrap">
                <Link href="/courses">
                  <Button radius="lg" color="dark" size="lg">
                    Browse courses
                  </Button>
                </Link>
                <Link href="/login">
                  <Button radius="lg" variant="light" size="lg">
                    Login as student
                  </Button>
                </Link>
              </Group>
            </Stack>
          </SimpleGrid>
        </Paper>
      </Stack>
    </PublicShell>
  );
}
