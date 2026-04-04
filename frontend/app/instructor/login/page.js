import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function InstructorLoginPage() {
  return (
    <AuthShell
      eyebrow="Instructor workspace"
      title="Log in to manage courses"
      description="Open authoring, review course health, and manage payout requests from the instructor workspace."
      alternateHref="/login"
      alternateLabel="Learner login"
      alternateText="Trying to study instead?"
    >
        <LoginForm
          expectedRole="instructor"
          redirectTo="/instructor"
        />
    </AuthShell>
  );
}
