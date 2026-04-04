import Link from "next/link";
import { Badge, Button, Card, Group, Image, Stack, Text, Title } from "@mantine/core";

import { CourseCommerceActions } from "@/components/course-commerce-actions";
import {
  getCourseDurationLabel,
  getCourseLevelLabel,
  getCoursePriceLabel,
  getCourseRatingLabel,
} from "@/lib/course-display";
import { LEARNING_IMAGES } from "@/lib/marketing-media";

export function LiveCourseCard({ course }) {
  const price = getCoursePriceLabel(course);
  const thumbnail = course.thumbnail || LEARNING_IMAGES.detailFallback;

  return (
    <Card
      radius="lg"
      padding={0}
      className="glass-card"
      h="100%"
      style={{ overflow: "hidden", background: "rgba(245, 249, 255, 0.94)" }}
    >
      <div style={{ position: "relative" }}>
        <Image
          src={thumbnail}
          alt={course.title}
          h={220}
          fit="cover"
          fallbackSrc={LEARNING_IMAGES.detailFallback}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.68) 100%)",
          }}
        />
        <Group
          gap="xs"
          wrap="wrap"
          style={{ position: "absolute", top: 16, left: 16, right: 16 }}
        >
          <Badge color="blue" variant="filled">
            {course.category || "Course"}
          </Badge>
          <Badge color="gray" variant="filled">
            {getCourseLevelLabel(course.level)}
          </Badge>
        </Group>
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
          <Text c="white" fw={700}>
            {course.instructorId?.name || "Instructor"}
          </Text>
          <Text c="gray.2" size="sm">
            {course.totalEnrollments || 0} learners engaged
          </Text>
        </div>
      </div>

      <Stack p="xl" justify="space-between" h="100%" gap="lg">
        <Stack gap="md">
          <div>
            <Title order={3} size="h3" maw={420}>
              {course.title}
            </Title>
            <Text c="dimmed" mt="sm" lineClamp={3}>
              {course.shortDescription}
            </Text>
          </div>

          <Group gap="xs" wrap="wrap">
            <Badge color="dark" variant="outline">
              {price}
            </Badge>
            <Badge color="blue" variant="light">
              {course.totalLessons || 0} lessons
            </Badge>
            <Badge color="teal" variant="light">
              {getCourseDurationLabel(course)}
            </Badge>
            <Badge color="grape" variant="light">
              {getCourseRatingLabel(course)}
            </Badge>
          </Group>
        </Stack>

        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Group gap="sm" wrap="wrap">
            <CourseCommerceActions course={course} variant="card" />
            <div>
              <Text fw={600}>{course.instructorId?.name || "Instructor"}</Text>
              <Text c="dimmed" size="sm">
                {course.totalReviews || 0} reviews
              </Text>
            </div>
          </Group>
          <Link href={`/courses/${course.slug}`}>
            <Button radius="lg" color="dark">
              View details
            </Button>
          </Link>
        </Group>
      </Stack>
    </Card>
  );
}
