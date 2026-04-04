import Link from "next/link";
import { Box, Group, Stack, Text } from "@mantine/core";

export function BrandLogo({ href = "/", compact = false }) {
  const content = (
    <Group gap={compact ? "xs" : "sm"} wrap="nowrap">
      {!compact ? (
        <Box
          w={12}
          h={12}
          style={{
            borderRadius: 999,
            background: "var(--mantine-color-blue-6)",
            boxShadow: "0 0 0 7px rgba(34, 139, 230, 0.12)",
            flex: "0 0 auto",
          }}
        />
      ) : null}
      <Stack gap={0} justify="center">
        <Text
          fw={900}
          lh={1}
          style={{
            fontSize: compact ? "2rem" : "2.35rem",
            letterSpacing: compact ? "-0.06em" : "-0.05em",
            fontFamily:
              "Sora, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            color: compact ? "#0f172a" : "var(--mantine-color-blue-7)",
            textTransform: compact ? "none" : "lowercase",
          }}
        >
          {compact ? "eduscience." : "eduscience"}
        </Text>
        {!compact ? (
          <Text
            size="xs"
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: "0.14em" }}
          >
            Video Learning Marketplace
          </Text>
        ) : null}
      </Stack>
    </Group>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
