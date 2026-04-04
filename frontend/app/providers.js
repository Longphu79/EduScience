"use client";

import { Suspense } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { NavigationProgress } from "@mantine/nprogress";
import { Notifications } from "@mantine/notifications";

import { AuthProvider } from "@/components/auth/auth-provider";
import { NavigationProgressListener } from "@/components/navigation-progress-listener";
import { StudentCommerceProvider } from "@/components/student-commerce-provider";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "sm",
  fontFamily:
    "Instrument Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily:
      "Sora, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

export function AppProviders({ children }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <AuthProvider>
        <StudentCommerceProvider>
          <NavigationProgress color="blue" size={3} />
          <Suspense fallback={null}>
            <NavigationProgressListener />
          </Suspense>
          <Notifications position="top-right" />
          {children}
        </StudentCommerceProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
