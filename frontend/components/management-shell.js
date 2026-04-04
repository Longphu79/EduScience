"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook2,
  IconCoins,
  IconDashboard,
  IconEditCircle,
  IconHome2,
  IconSearch,
  IconShield,
} from "@tabler/icons-react";

import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/brand-logo";

const MENUS = {
  instructor: [
    { href: "/instructor", label: "Trang chủ", icon: IconDashboard },
    { href: "/instructor/courses", label: "Courses", icon: IconBook2 },
    { href: "/instructor/authoring", label: "Authoring", icon: IconEditCircle },
    { href: "/instructor/payouts", label: "Payouts", icon: IconCoins },
  ],
  admin: [
    { href: "/admin", label: "Trang chủ", icon: IconShield },
    { href: "/admin/authoring", label: "Authoring", icon: IconEditCircle },
    { href: "/admin/payouts", label: "Payout queue", icon: IconCoins },
  ],
};

export function ManagementShell({ role, title, description, children }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const [opened, { toggle, close }] = useDisclosure(false);
  const items = MENUS[role] || [];
  const logoutDestination = role === "admin" ? "/admin/login" : "/instructor/login";

  const handleLogout = async () => {
    await auth.logout();
    router.replace(logoutDestination);
    router.refresh();
  };

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 228,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      styles={{
        main: {
          background: "#f5f7fb",
          minHeight: "100vh",
          paddingTop: "84px",
        },
        header: {
          background: "#ffffff",
          borderBottom: "1px solid #e6ebf2",
        },
        navbar: {
          background: "#ffffff",
          borderRight: "1px solid #e6ebf2",
          padding: 12,
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label="Toggle management navigation"
            />
            <BrandLogo compact href={role === "admin" ? "/admin" : "/instructor"} />
          </Group>

          <Group gap="md" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <ActionIcon variant="light" color="blue" radius="md" size="lg">
                <IconSearch size={16} />
              </ActionIcon>
            </Group>

            <Text c="dimmed" size="sm" visibleFrom="sm" truncate maw={144}>
              {auth.user?.username}
            </Text>
            <Button radius="md" color="blue" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Paper radius="md" p="md" h="100%" style={{ background: "#ffffff" }}>
          <AppShell.Section>
            <Stack gap="sm">
              <Badge color="blue" variant="light" w="fit-content">
                {role === "admin" ? "Admin shell" : "Instructor shell"}
              </Badge>
              <Text fw={700}>{title}</Text>
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            </Stack>
          </AppShell.Section>

          <Divider my="lg" />

          <AppShell.Section grow component={ScrollArea} type="auto">
            <Stack gap={6}>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <NavLink
                    key={item.href}
                    component={Link}
                    href={item.href}
                    label={item.label}
                    leftSection={
                      <ThemeIcon
                        radius="md"
                        size={30}
                        variant={isActive ? "filled" : "light"}
                        color="blue"
                      >
                        <item.icon size={16} />
                      </ThemeIcon>
                    }
                    active={isActive}
                    variant="light"
                    radius="md"
                    styles={{
                      root: {
                        background: isActive ? "rgba(34, 139, 230, 0.1)" : "transparent",
                        border: "1px solid transparent",
                        paddingBlock: 10,
                      },
                      label: {
                        fontWeight: isActive ? 700 : 600,
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </AppShell.Section>

          <Divider my="lg" />

          <AppShell.Section>
            <Stack gap="sm">
              <Link href="/" style={{ width: "100%" }}>
                <Button radius="md" variant="light" fullWidth leftSection={<IconHome2 size={16} />}>
                  Open storefront
                </Button>
              </Link>
              <Text size="sm" c="dimmed">
                {auth.user?.username || "Workspace user"}
              </Text>
            </Stack>
          </AppShell.Section>
        </Paper>
      </AppShell.Navbar>

      <AppShell.Main className="management-main">
        <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%" }}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}
