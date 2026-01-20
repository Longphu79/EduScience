import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import TextField from "../../../shared/components/TextField.jsx";
import Button from "../../../shared/components/Button.jsx";
import Toast from "../../../shared/components/Toast.jsx";
import { useAuth } from "../state/auth.jsx";
import "../styles/controls.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (!username.trim()) e.username = "Please enter your username";
    if (!password) e.password = "Please enter your password";
    return e;
  }, [username, password]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setToast("");
    try {
      await login({ username: username.trim(), password });
      nav("/dashboard");
    } catch (err) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Please enter your details."
      footer={
        <div className="foot__row">
          <span className="muted">New here?</span>
          <Link className="link" to="/register">
            Create an account
          </Link>
        </div>
      }
    >
      <Toast message={toast} onClose={() => setToast("")} />
      <form className="form" onSubmit={onSubmit}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. cuong.dev"
          autoComplete="username"
          error={username.trim() ? "" : errors.username}
        />

        <TextField
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          error={password ? "" : errors.password}
          right={
            <button type="button" className="ghost" onClick={() => setShowPass((v) => !v)}>
              {showPass ? "Hide" : "Show"}
            </button>
          }
        />

        <div className="row">
          <div className="check">
            <input id="remember" type="checkbox" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <a className="link" href="#">
            Forgot password?
          </a>
        </div>

        <Button type="submit" loading={loading} disabled={!canSubmit}>
          Sign In
        </Button>

        <div className="divider">
          <span>or</span>
        </div>

        <Button type="button" variant="secondary" onClick={() => setToast("Social login is not configured yet")}>
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
}
