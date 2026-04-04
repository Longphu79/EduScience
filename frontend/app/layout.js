import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import "./globals.css";
import { AppProviders } from "./providers";

export const metadata = {
  title: "EduScience Next",
  description:
    "Next.js rewrite for EduScience with learning, instructor, and admin workflows.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-mantine-color-scheme="light">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
