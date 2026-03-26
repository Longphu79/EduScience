import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../features/auth/components/AuthShell.jsx";
import TextField from "../../shared/components/TextField.jsx";
import Button from "../../shared/components/Button.jsx";
import Toast from "../../shared/components/Toast.jsx";
import { useAuth } from "../../features/auth/state/useAuth.jsx";
import "../../shared/styles/controls.css";

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [toastType, setToastType] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    const errors = useMemo(() => {
        const e = {};

        if (!submitted) return e;

        if (!email.trim()) {
            e.email = "Please enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            e.email = "Email is not valid";
        }

        return e;
    }, [email, submitted]);

    const canSubmit =
        email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
        !loading;

    const onSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitted(true);

        if (!canSubmit) return;

        setLoading(true);
        setToast("");

        try {
            const result = await forgotPassword({ email: email.trim() });
            setToastType("success");
            setToast(
                result?.message ||
                    "If that email exists in our system, a password reset link has been sent.",
            );
        } catch (err) {
            setToastType("error");
            setToast(
                err?.response?.data?.message ||
                    err?.message ||
                    "Forgot password failed",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Forgot password"
            subtitle="Enter your email to receive a reset link."
            footer={
                <div className="foot__row">
                    <span className="muted">Remembered your password?</span>
                    <Link className="link" to="/auth/login">
                        Back to sign in
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
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email || ""}
                />

                <Button type="submit" loading={loading} disabled={!canSubmit}>
                    Send reset link
                </Button>
            </form>
        </AuthShell>
    );
}
