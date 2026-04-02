import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import TextField from "../../../shared/components/TextField.jsx";
import Button from "../../../shared/components/Button.jsx";
import Toast from "../../../shared/components/Toast.jsx";
import { forgotPasswordApi } from "../api/authApi.js";
import "../../../shared/styles/controls.css";

const COOLDOWN_SECONDS = 180;
const STORAGE_KEY = "forgot_password_cooldown_until";

function formatCountdown(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [touched, setTouched] = useState({
        email: false,
    });
    const [cooldownSeconds, setCooldownSeconds] = useState(0);

    useEffect(() => {
        const storedUntil = Number(sessionStorage.getItem(STORAGE_KEY) || 0);

        if (!storedUntil) return;

        const remaining = Math.max(0, Math.ceil((storedUntil - Date.now()) / 1000));
        setCooldownSeconds(remaining);
    }, []);

    useEffect(() => {
        if (cooldownSeconds <= 0) {
            sessionStorage.removeItem(STORAGE_KEY);
            return;
        }

        const timer = setInterval(() => {
            setCooldownSeconds((prev) => {
                const next = prev - 1;

                if (next <= 0) {
                    sessionStorage.removeItem(STORAGE_KEY);
                    clearInterval(timer);
                    return 0;
                }

                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownSeconds]);

    const errors = useMemo(() => {
        const e = {};

        if (!email.trim()) {
            e.email = "Please enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            e.email = "Email is not valid";
        }

        return e;
    }, [email]);

    const canSubmit =
        Object.keys(errors).length === 0 &&
        !loading &&
        cooldownSeconds === 0;

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();

        setTouched({ email: true });

        if (!canSubmit) return;

        setLoading(true);
        setToast("");

        try {
            const result = await forgotPasswordApi({
                email: email.trim(),
            });

            setToast(
                result?.message ||
                    "A password reset email has been sent. Please check your inbox."
            );

            const nextUntil = Date.now() + COOLDOWN_SECONDS * 1000;
            sessionStorage.setItem(STORAGE_KEY, String(nextUntil));
            setCooldownSeconds(COOLDOWN_SECONDS);
        } catch (err) {
            setToast(err?.message || "Forgot password request failed");
        } finally {
            setLoading(false);
        }
    };

    const buttonLabel = loading
        ? "Sending..."
        : cooldownSeconds > 0
          ? `Resend in ${formatCountdown(cooldownSeconds)}`
          : "Send Reset Link";

    return (
        <AuthShell
            title="Forgot password"
            subtitle="Enter your email to receive reset instructions."
            footer={
                <div className="foot__row">
                    <span className="muted">Remember your password?</span>
                    <Link className="link" to="/auth/login">
                        Back to sign in
                    </Link>
                </div>
            }
        >
            <Toast message={toast} onClose={() => setToast("")} />

            <form className="form" onSubmit={onSubmit}>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={touched.email ? errors.email : ""}
                    disabled={loading}
                />

                <Button
                    type="submit"
                    loading={loading}
                    disabled={!canSubmit}
                >
                    {buttonLabel}
                </Button>

                {cooldownSeconds > 0 ? (
                    <div className="small muted">
                        You can request another reset email after{" "}
                        {formatCountdown(cooldownSeconds)}.
                    </div>
                ) : null}
            </form>
        </AuthShell>
    );
}