import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../state/useAuth.js";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Confirm password does not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ token, password });
      setSuccessMessage(result?.message || "Password reset successfully");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || error.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your new password."
      footer={
        <p>
          Back to <Link to="/login">Login</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form__group">
          <label>New password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="auth-form__group">
          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {successMessage ? (
          <p className="auth-form__success">{successMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="auth-form__error">{errorMessage}</p>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}