import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <AuthShell
      eyebrow="Admin workspace"
      title="Log in to operations"
      description="Process payout requests, review course ownership, and monitor platform activity."
      alternateHref="/courses"
      alternateLabel="Back to storefront"
      alternateText="Need the public app instead?"
    >
        <LoginForm
          expectedRole="admin"
          redirectTo="/admin"
        />
    </AuthShell>
  );
}
