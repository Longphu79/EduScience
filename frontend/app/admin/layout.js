"use client";

import { usePathname } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ManagementShell } from "@/components/management-shell";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <ManagementShell
        role="admin"
        title="Admin management"
        description="Platform operations, payout queue, and oversight."
      >
        {children}
      </ManagementShell>
    </AuthGuard>
  );
}
