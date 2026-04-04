"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Loader, Stack, Text } from "@mantine/core";

import { useAuth } from "./auth-provider";

const loginRouteForRole = (role) => {
  if (role === "admin") {
    return "/admin/login";
  }

  if (role === "instructor") {
    return "/instructor/login";
  }

  return "/login";
};

export function AuthGuard({ allowedRoles, children }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    if (!auth.isAuthenticated) {
      router.replace(loginRouteForRole(allowedRoles?.[0]));
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(auth.role)) {
      router.replace(loginRouteForRole(auth.role));
    }
  }, [allowedRoles, auth.isAuthenticated, auth.loading, auth.role, router]);

  if (auth.loading) {
    return (
      <Stack align="center" py="xl">
        <Loader color="blue" />
        <Text c="dimmed">Loading session...</Text>
      </Stack>
    );
  }

  if (!auth.isAuthenticated || (allowedRoles?.length && !allowedRoles.includes(auth.role))) {
    return (
      <Alert color="blue" radius="lg" title="Redirecting">
        Checking access for this management area.
      </Alert>
    );
  }

  return children;
}
