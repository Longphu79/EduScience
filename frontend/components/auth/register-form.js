"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";

import { useAuth } from "./auth-provider";

export function RegisterForm({ redirectTo = "/my-learning" }) {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match");
      return;
    }

    setSubmitting(true);

    try {
      await auth.register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: "student",
      });
      router.replace(redirectTo);
    } catch (submitError) {
      setError(submitError.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" gap="md" onSubmit={handleSubmit}>
      {error ? (
        <Alert color="red" radius="lg" title="Registration failed">
          {error}
        </Alert>
      ) : null}
      <TextInput
        label="Username"
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
        label="Email"
        aria-label="Email"
        type="email"
        radius="lg"
        value={form.email}
        onChange={(event) => {
          const { value } = event.currentTarget;
          setForm((prev) => ({ ...prev, email: value }));
        }}
        required
      />
      <PasswordInput
        label="Password"
        aria-label="Password"
        radius="lg"
        value={form.password}
        onChange={(event) => {
          const { value } = event.currentTarget;
          setForm((prev) => ({ ...prev, password: value }));
        }}
        required
      />
      <PasswordInput
        label="Confirm password"
        aria-label="Confirm password"
        radius="lg"
        value={form.confirmPassword}
        onChange={(event) => {
          const { value } = event.currentTarget;
          setForm((prev) => ({ ...prev, confirmPassword: value }));
        }}
        required
      />
      <Button type="submit" radius="lg" loading={submitting}>
        Create account
      </Button>
    </Stack>
  );
}
