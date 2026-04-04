import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Learner account"
      title="Create your student account"
      description="Register once to save wishlist items, start checkout, and continue learning across courses."
      alternateHref="/login"
      alternateLabel="Log in"
      alternateText="Already have an account?"
    >
      <RegisterForm />
    </AuthShell>
  );
}
