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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    useEffect(() => {
        if (location.state?.registered) {
            setIsSuccess(true);
            setToast(location.state?.message || "Register successfully");
            nav(location.pathname, { replace: true, state: null });
        }
    }, [location, nav]);

    const errors = useMemo(() => {
        const e = {};

        if (!email.trim()) {
            e.email = "Please enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            e.email = "Email is not valid";
        }

        if (!password) {
            e.password = "Please enter your password";
        }

        return e;
    }, [email, password]);

    const canSubmit = Object.keys(errors).length === 0 && !loading;

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();

        setTouched({ email: true, password: true });

        if (!canSubmit) return;

        setLoading(true);
        setToast("");
        setIsSuccess(false);

        try {
            await login({ email: email.trim(), password });
            nav("/");
        } catch (err) {
            setIsSuccess(false);
            setToast(err?.message || "Login failed");
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
            <Toast message={toast} onClose={() => setToast("")} success={isSuccess} />

            <form className="form" onSubmit={onSubmit}>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={touched.email ? errors.email : ""}
                />

                <TextField
                    label="Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Your password"
                    autoComplete="current-password"
                    error={touched.password ? errors.password : ""}
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

                <div className="divider">
                    <span>or</span>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        setToast("Social login is not configured yet")
                    }
                >
                    Continue with Google
                </Button>
            </form>
        </AuthShell>
    );
}