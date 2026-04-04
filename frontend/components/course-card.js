import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export function CourseCard({ course, showProgress = false }) {
  return (
    <Card radius="lg" padding="xl" className="glass-card" h="100%">
      <Stack justify="space-between" h="100%">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Badge color="blue" variant="light">
                {course.category}
              </Badge>
              <Title order={3} mt="md" size="h3">
                {course.title}
              </Title>
            </div>
            <Badge color="dark" variant="outline">
              {course.level}
            </Badge>
          </Group>
          <Text c="dimmed">{course.shortDescription}</Text>
          <Group gap="md">
            <Text fw={700}>{course.priceLabel}</Text>
            <Text c="dimmed">{course.lessons} lessons</Text>
            <Text c="dimmed">{course.hours}h</Text>
            <Text c="dimmed">{course.rating} rating</Text>
          </Group>
          {showProgress ? (
            <Stack gap={6}>
              <Group justify="space-between">
                <Text fw={600}>Progress</Text>
                <Text c="dimmed">33%</Text>
              </Group>
              <Progress color="blue" value={33} radius="lg" />
            </Stack>
          ) : null}
        </Stack>
        <Group justify="space-between" mt="lg">
          <Text fw={600}>{course.instructor}</Text>
          <Link href={`/courses/${course.slug}`}>
            <Button radius="lg" color="dark">
              View detail
            </Button>
          </Link>
        </Group>
      </Stack>
    </Card>
  );
}
