import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function StudentLoginPage() {
  return (
    <AuthShell
      eyebrow="Student access"
      title="Log in to keep learning"
      description="Open your learner dashboard, continue courses, and access purchases from one place."
      alternateHref="/register"
      alternateLabel="Create account"
      alternateText="Need a learner account?"
    >
        <LoginForm
          expectedRole="student"
          redirectTo="/my-learning"
        />
    </AuthShell>
  );
}
