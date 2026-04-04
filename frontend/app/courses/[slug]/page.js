import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCertificate,
  IconCircleCheck,
  IconMessages,
  IconNotebook,
  IconPlayerPlay,
} from "@tabler/icons-react";

import { CourseCommerceActions } from "@/components/course-commerce-actions";
import { LiveCourseCard } from "@/components/live-course-card";
import { PublicShell } from "@/components/public-shell";
import { apiFetch } from "@/lib/api";
import {
  deriveCourseOutcomes,
  getCourseDurationLabel,
  getCourseIncludedItems,
  getCourseLevelLabel,
  getCoursePriceLabel,
  getCourseRatingLabel,
  getCurriculumStats,
} from "@/lib/course-display";
import { LEARNING_IMAGES } from "@/lib/marketing-media";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }) {
  const resolvedParams = await params;
  let course;

  try {
    course = await apiFetch(`/course/slug/${resolvedParams.slug}`);
  } catch (_error) {
    notFound();
  }

  const relatedResponse = course.category
    ? await apiFetch(
        `/course?limit=4&category=${encodeURIComponent(course.category)}&sort=popular`,
      )
    : await apiFetch("/course?limit=4&sort=popular");
  const relatedCourses = relatedResponse.items
    .filter((item) => item.slug !== course.slug)
    .slice(0, 3);
  const outcomes = deriveCourseOutcomes(course);
  const curriculumStats = getCurriculumStats(course.lessons || []);
  const includedItems = getCourseIncludedItems(course);
  const previewLessons = (course.lessons || []).filter((lesson) => lesson.isPreview).length;
  const price = getCoursePriceLabel(course);
  const heroImage = course.thumbnail || LEARNING_IMAGES.detailFallback;

  return (
    <PublicShell>
      <Stack gap="xl" py="xl">
        <Paper radius="lg" p={{ base: "xl", md: "2rem", xl: "3rem" }} className="glass-card">
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
            <Stack gap="lg">
              <div>
                <Group gap="sm" wrap="wrap">
                  <Badge color="blue" variant="filled">
                    {course.category || "Course"}
                  </Badge>
                  <Badge color="dark" variant="outline">
                    {getCourseLevelLabel(course.level)}
                  </Badge>
                  <Badge color="grape" variant="light">
                    {course.language?.toUpperCase() || "VI"}
                  </Badge>
                </Group>
                <Title order={1} mt="md" size={56} lh={1.04} maw={760}>
                  {course.title}
                </Title>
                <Text size="lg" c="dimmed" mt="md" maw={760}>
                  {course.shortDescription}
                </Text>
              </div>

              <Group gap="md" wrap="wrap">
                <Badge radius="lg" variant="light" color="blue" size="lg">
                  {course.totalLessons || 0} lessons
                </Badge>
                <Badge radius="lg" variant="light" color="teal" size="lg">
                  {getCourseDurationLabel(course)}
                </Badge>
                <Badge radius="lg" variant="light" color="blue" size="lg">
                  {getCourseRatingLabel(course)}
                </Badge>
                <Badge radius="lg" variant="light" color="gray" size="lg">
                  {course.totalEnrollments || 0} enrolled
                </Badge>
              </Group>

              <Paper
                radius="md"
                p="lg"
                withBorder
                style={{ background: "rgba(255,255,255,0.8)" }}
              >
                <Text fw={700}>{course.instructorId?.name || "Instructor"}</Text>
                <Text c="dimmed" mt="xs">
                  {course.instructorId?.bio || "Instructor profile is being expanded."}
                </Text>
                <Group gap="sm" mt="md" wrap="wrap">
                  {(course.instructorId?.expertise || []).slice(0, 4).map((item) => (
                    <Badge key={item} radius="lg" color="dark" variant="outline">
                      {item}
                    </Badge>
                  ))}
                  <Badge radius="lg" color="blue" variant="light">
                    {Number(course.instructorId?.rating ?? 0).toFixed(1)} instructor rating
                  </Badge>
                  <Badge radius="lg" color="green" variant="light">
                    {course.instructorId?.totalStudents || 0} students
                  </Badge>
                </Group>
              </Paper>

              <Stack gap="sm">
                <CourseCommerceActions course={course} />
                <Group gap="sm" wrap="wrap">
                  <Link href="/courses">
                    <Button radius="lg" variant="light">
                      Back to catalog
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button radius="lg" color="dark" rightSection={<IconArrowRight size={16} />}>
                      Open student checkout
                    </Button>
                  </Link>
                </Group>
              </Stack>
            </Stack>

            <Stack gap="lg">
              <Paper radius="lg" p="sm" className="glass-card">
                <Image src={heroImage} alt={course.title} h={340} radius="md" fit="cover" />
              </Paper>

              {course.previewVideo ? (
                <Card radius="lg" padding="md" className="glass-card">
                  <Text fw={700} mb="sm">
                    Course preview
                  </Text>
                  <video
                    src={course.previewVideo}
                    controls
                    poster={heroImage}
                    style={{ width: "100%", borderRadius: "var(--mantine-radius-lg)", background: "#020617" }}
                  />
                </Card>
              ) : null}

              <Card radius="lg" padding="xl" bg="dark.8" c="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text c="blue.6" fw={800}>
                      {price}
                    </Text>
                    <Title order={3} mt="sm">
                      Includes a visible syllabus, preview access, and post-login discussion flow
                    </Title>
                  </div>
                  <Badge color="blue" variant="filled">
                    Preview {previewLessons}
                  </Badge>
                </Group>

                <Stack mt="lg" gap="sm">
                  {includedItems.map((item) => (
                    <Group key={item} align="flex-start" wrap="nowrap">
                      <ThemeIcon color="blue" radius="lg" size={24}>
                        <IconCircleCheck size={14} />
                      </ThemeIcon>
                      <Text c="gray.2">{item}</Text>
                    </Group>
                  ))}
                </Stack>

                <Divider my="lg" color="rgba(255,255,255,0.12)" />
                <Text size="sm" c="gray.3">
                  Students can save this course to wishlist or move it into cart from the detail header.
                </Text>
              </Card>

              <SimpleGrid cols={2} spacing="md">
                <Card radius="md" padding="lg" className="glass-card">
                  <Text c="dimmed" size="sm">
                    Preview lessons
                  </Text>
                  <Title order={3} mt="sm">
                    {previewLessons}
                  </Title>
                </Card>
                <Card radius="md" padding="lg" className="glass-card">
                  <Text c="dimmed" size="sm">
                    Attached resources
                  </Text>
                  <Title order={3} mt="sm">
                    {curriculumStats.totalResources}
                  </Title>
                </Card>
                <Card radius="md" padding="lg" className="glass-card">
                  <Text c="dimmed" size="sm">
                    Learning goals
                  </Text>
                  <Title order={3} mt="sm">
                    {curriculumStats.totalObjectives}
                  </Title>
                </Card>
                <Card radius="md" padding="lg" className="glass-card">
                  <Text c="dimmed" size="sm">
                    Lesson minutes
                  </Text>
                  <Title order={3} mt="sm">
                    {curriculumStats.totalMinutes}
                  </Title>
                </Card>
              </SimpleGrid>
            </Stack>
          </SimpleGrid>
        </Paper>

        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
          <Card radius="lg" padding="xl" className="glass-card">
            <Title order={2}>What you will learn</Title>
            <Stack mt="lg" gap="md">
              {outcomes.map((outcome) => (
                <Group key={outcome} align="flex-start" wrap="nowrap">
                  <ThemeIcon color="blue" radius="lg" size={28}>
                    <IconCircleCheck size={16} />
                  </ThemeIcon>
                  <Text>{outcome}</Text>
                </Group>
              ))}
            </Stack>
          </Card>

          <Card radius="lg" padding="xl" className="glass-card">
            <Title order={2}>This course includes</Title>
            <Stack mt="lg" gap="md">
              {[
                {
                  icon: IconPlayerPlay,
                  title: "Step-by-step lesson sequence",
                  body: `${course.totalLessons || 0} published lessons with preview and locked content states.`,
                },
                {
                  icon: IconNotebook,
                  title: "Lesson resources and notes",
                  body: "Resources attach directly to lessons so the learning route feels richer than a plain player page.",
                },
                {
                  icon: IconMessages,
                  title: "Lesson discussion",
                  body: "Students continue into comments and notes after logging in to the learning workspace.",
                },
                {
                  icon: IconCertificate,
                  title: "Completion loop",
                  body: "Reviews and certificates support the path from public discovery into learner retention.",
                },
              ].map((item) => (
                <Group key={item.title} align="flex-start" wrap="nowrap">
                  <ThemeIcon color="dark" radius="lg" size={36}>
                    <item.icon size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700}>{item.title}</Text>
                    <Text c="dimmed" mt={4}>
                      {item.body}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>

        <Card radius="lg" padding="xl" className="glass-card">
          <Title order={2}>About this course</Title>
          <Text c="dimmed" mt="lg" maw={980}>
            {course.description ||
              "This course is being expanded with richer public description content."}
          </Text>

          <Divider my="xl" />

          <Group justify="space-between" align="end" wrap="wrap">
            <div>
              <Badge color="blue" variant="light">
                Curriculum preview
              </Badge>
              <Title order={3} mt="sm">
                Guests should see enough structure to trust the course before enrolling.
              </Title>
            </div>
            <Badge color="dark" variant="outline">
              {course.lessons?.length || 0} published lessons
            </Badge>
          </Group>

          <Stack mt="lg" gap="md">
            {(course.lessons || []).map((lesson, index) => (
              <Paper key={lesson._id} radius="md" p="lg" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                    <div>
                      <Text c="dimmed" size="sm">
                        Lesson {index + 1}
                      </Text>
                      <Text fw={700}>{lesson.title}</Text>
                    </div>
                    <Group gap="sm">
                      {lesson.isPreview ? (
                        <Badge color="green" variant="light">
                          Preview
                        </Badge>
                      ) : (
                        <Badge color="dark" variant="outline">
                          Enroll to unlock
                        </Badge>
                      )}
                      <Badge color="blue" variant="light">
                        {lesson.estimatedCompletionMinutes || lesson.duration || 0} min
                      </Badge>
                    </Group>
                  </Group>
                  <Text c="dimmed">
                    {lesson.description || "Lesson summary is being expanded."}
                  </Text>
                  <Group gap="sm" wrap="wrap">
                    {(lesson.objectives || []).slice(0, 3).map((objective) => (
                      <Badge key={objective} radius="lg" variant="light" color="grape">
                        {objective}
                      </Badge>
                    ))}
                    <Badge radius="lg" variant="outline" color="dark">
                      {lesson.resources?.length || 0} resources
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Card>

        {relatedCourses.length > 0 ? (
          <Stack gap="lg">
            <Group justify="space-between" align="end" wrap="wrap">
              <div>
                <Badge color="blue" variant="light">
                  Keep exploring
                </Badge>
                <Title order={2} mt="sm">
                  Related courses should extend the browse session, not end it.
                </Title>
              </div>
              <Link href="/courses">
                <Button radius="lg" variant="light">
                  Browse more
                </Button>
              </Link>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
              {relatedCourses.map((item) => (
                <LiveCourseCard key={item._id} course={item} />
              ))}
            </SimpleGrid>
          </Stack>
        ) : null}
      </Stack>
    </PublicShell>
  );
}
