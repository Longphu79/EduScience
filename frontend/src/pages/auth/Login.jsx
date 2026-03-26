import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../features/auth/components/AuthShell.jsx";
import TextField from "../../shared/components/TextField.jsx";
import Button from "../../shared/components/Button.jsx";
import Toast from "../../shared/components/Toast.jsx";
import { useAuth } from "../../features/auth/state/useAuth.jsx";
import "../../shared/styles/controls.css";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [toastType, setToastType] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (location.state?.toast) {
            setToast(location.state.toast);
            setToastType(location.state.toastType || "success");
            nav(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, nav]);

    const errors = useMemo(() => {
        const e = {};

        if (!submitted) return e;

        if (!username.trim()) e.username = "Please enter your username";
        if (!password) e.password = "Please enter your password";

        return e;
    }, [username, password, submitted]);

    const canSubmit = username.trim() && password && !loading;

    const onSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitted(true);

        if (!canSubmit) return;

        setLoading(true);
        setToast("");

        try {
            await login({ username: username.trim(), password });
            nav("/");
        } catch (err) {
            setToastType("error");
            setToast(
                err?.response?.data?.message || err?.message || "Login failed",
            );
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
                    <Link className="link" to="/auth/register">
                        Create an account
                    </Link>
                </div>
            }
        >
            <Toast
                message={toast}
                onClose={() => setToast("")}
                kind={toastType}
                position="inline"
            />

            <form className="form" onSubmit={onSubmit}>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. cuong.dev"
                    autoComplete="username"
                    error={errors.username || ""}
                />

                <TextField
                    label="Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    error={errors.password || ""}
                    right={
                        <button
                            type="button"
                            className="ghost"
                            onClick={() => setShowPass((v) => !v)}
                        >
                            {showPass ? "Hide" : "Show"}
                        </button>
                    }
                />

                <div className="row">
                    <div className="check">
                        <input id="remember" type="checkbox" />
                        <label htmlFor="remember">Remember me</label>
                    </div>

                    <Link className="link" to="/auth/forgot-password">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" loading={loading} disabled={!canSubmit}>
                    Sign In
                </Button>
            </form>
        </AuthShell>
    );
}
