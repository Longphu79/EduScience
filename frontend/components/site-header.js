"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Box, Button, Group, Menu, Paper, Text, TextInput } from "@mantine/core";
import {
  IconArrowRight,
  IconChevronDown,
  IconHeart,
  IconListCheck,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";

import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/brand-logo";
import { useStudentCommerce } from "@/components/student-commerce-provider";

export function SiteHeader() {
  const auth = useAuth();
  const commerce = useStudentCommerce();
  const router = useRouter();
  const accountLabel = auth.user?.username || "Account";
  const roleLabel =
    auth.role === "admin" ? "Admin" : auth.role === "instructor" ? "Instructor" : "Student";
  const workspaceHref = auth.role === "admin" ? "/admin" : auth.role === "instructor" ? "/instructor" : "/my-learning";
  const initials = accountLabel.slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await auth.logout();
    router.replace("/");
    router.refresh();
  };

  return (
    <Paper
      radius="lg"
      px="xl"
      py="md"
      className="glass-card"
      style={{ position: "sticky", top: 16, zIndex: 20, marginTop: 20 }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="lg">
        <Group gap="xl" wrap="wrap">
          <BrandLogo compact />
          <Group gap="lg" visibleFrom="md">
            <Link href="/">Home</Link>
            <Link href="/courses">Catalog</Link>
            {auth.role === "student" ? <Link href="/my-learning">My learning</Link> : null}
          </Group>
        </Group>

        <Group gap="md" wrap="wrap" style={{ flex: "1 1 520px", justifyContent: "flex-end" }}>
          <Box
            component="form"
            action="/courses"
            visibleFrom="md"
            style={{ minWidth: 340, flex: 1, maxWidth: 480 }}
          >
            <TextInput
              name="q"
              radius="lg"
              placeholder="Search courses, topics, instructors..."
              leftSection={<IconSearch size={16} />}
            />
          </Box>

          {auth.isAuthenticated ? (
            <>
              <Menu shadow="md" width={280} position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    aria-label="Open account menu"
                    radius="lg"
                    variant="light"
                    rightSection={<IconChevronDown size={16} />}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="blue" radius="xl" size={28}>
                        {initials}
                      </Avatar>
                      <div style={{ textAlign: "left" }}>
                        <Text size="sm" fw={700} lh={1.1}>
                          {accountLabel}
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.1}>
                          {roleLabel}
                        </Text>
                      </div>
                      {auth.role === "student" ? (
                        <Group gap={6} wrap="nowrap" visibleFrom="md">
                          <Badge
                            variant="white"
                            color="blue"
                            radius="lg"
                            leftSection={<IconHeart size={12} />}
                          >
                            {commerce.wishlistIds.length}
                          </Badge>
                          <Badge
                            variant="white"
                            color="blue"
                            radius="lg"
                            leftSection={<IconShoppingCart size={12} />}
                          >
                            {commerce.cartQuantity}
                          </Badge>
                        </Group>
                      ) : null}
                    </Group>
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{roleLabel} menu</Menu.Label>
                  <Menu.Item
                    component={Link}
                    href={workspaceHref}
                    leftSection={
                      auth.role === "student" ? (
                        <IconListCheck size={16} />
                      ) : (
                        <IconArrowRight size={16} />
                      )
                    }
                  >
                    {auth.role === "student" ? "Open dashboard" : "Open workspace"}
                  </Menu.Item>
                  {auth.role === "student" ? (
                    <>
                      <Menu.Item
                        component={Link}
                        href="/wishlist"
                        leftSection={<IconHeart size={16} />}
                        rightSection={
                          <Badge variant="light" color="blue" radius="lg">
                            {commerce.wishlistIds.length}
                          </Badge>
                        }
                      >
                        Wishlist
                      </Menu.Item>
                      <Menu.Item
                        component={Link}
                        href="/cart"
                        leftSection={<IconShoppingCart size={16} />}
                        rightSection={
                          <Badge variant="light" color="blue" radius="lg">
                            {commerce.cartQuantity}
                          </Badge>
                        }
                      >
                        Cart
                      </Menu.Item>
                    </>
                  ) : null}
                  <Menu.Divider />
                  <Menu.Item color="red" onClick={handleLogout}>
                    Log out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button radius="lg" variant="light">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button radius="lg">Register</Button>
              </Link>
            </>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
