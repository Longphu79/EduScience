"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
  TextInput,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import { useAuth } from "./auth-provider";

export function LoginForm({ expectedRole, redirectTo, submitLabel = "Sign in" }) {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await auth.login({
        username: form.username,
        password: form.password,
        expectedRole,
      });
      router.replace(redirectTo);
    } catch (submitError) {
      setError(submitError.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" gap="lg" onSubmit={handleSubmit}>
      {error ? (
        <Alert color="red" radius="lg" title="Login failed">
          {error}
        </Alert>
      ) : null}
      <TextInput
        id={`${expectedRole || "user"}-username`}
        label="Username"
        name="username"
        aria-label="Username"
        radius="lg"
        value={form.username}
        onChange={(event) => {
          const { value } = event.currentTarget;
          setForm((prev) => ({ ...prev, username: value }));
        }}
        required
      />
      <TextInput
        id={`${expectedRole || "user"}-password`}
        label="Password"
        name="password"
        aria-label="Password"
        type="password"
        radius="lg"
        value={form.password}
        onChange={(event) => {
          const { value } = event.currentTarget;
          setForm((prev) => ({ ...prev, password: value }));
        }}
        required
      />
      <Button type="submit" radius="lg" loading={submitting}>
        {submitLabel}
      </Button>
      <Group gap="xs" c="dimmed">
        <ThemeIcon size={28} radius="lg" variant="light">
          <IconArrowRight size={16} />
        </ThemeIcon>
        <Text size="sm">
          {expectedRole === "student"
            ? "Use your learner account here."
            : expectedRole === "instructor"
              ? "Use your instructor workspace account here."
              : "Use your admin workspace account here."}
        </Text>
      </Group>
    </Stack>
  );
}
