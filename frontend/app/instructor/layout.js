"use client";

import { usePathname } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ManagementShell } from "@/components/management-shell";

export default function InstructorLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/instructor/login") {
    return children;
  }

  return (
    <AuthGuard allowedRoles={["instructor"]}>
      <ManagementShell
        role="instructor"
        title="Instructor management"
        description="Course operations, student signals, and payout workflow."
      >
        {children}
      </ManagementShell>
    </AuthGuard>
  );
}
