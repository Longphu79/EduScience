import Link from "next/link";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";

import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  alternateHref,
  alternateLabel,
  alternateText,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__inner">
        <Stack gap="xl">
          <Group justify="space-between" align="center" wrap="wrap">
            <BrandLogo />
            <Link href="/courses">
              <Button variant="subtle">Browse courses</Button>
            </Link>
          </Group>

          <Paper radius="lg" p="xl" className="glass-card" maw={640}>
            <Stack gap="lg">
              <div>
                {eyebrow ? (
                  <Text fw={700} c="blue" size="sm">
                    {eyebrow}
                  </Text>
                ) : null}
                <Title order={1} mt={eyebrow ? "xs" : 0}>
                  {title}
                </Title>
                {description ? (
                  <Text c="dimmed" mt="sm" maw={520}>
                    {description}
                  </Text>
                ) : null}
              </div>

              {children}

              {alternateHref && alternateLabel && alternateText ? (
                <Group gap={6}>
                  <Text c="dimmed" size="sm">
                    {alternateText}
                  </Text>
                  <Link href={alternateHref}>
                    <Text component="span" fw={700} size="sm">
                      {alternateLabel}
                    </Text>
                  </Link>
                </Group>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </div>
    </div>
  );
}
