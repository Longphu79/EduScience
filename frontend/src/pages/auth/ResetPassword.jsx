import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../../features/auth/components/AuthShell.jsx";
import TextField from "../../shared/components/TextField.jsx";
import Button from "../../shared/components/Button.jsx";
import Toast from "../../shared/components/Toast.jsx";
import { useAuth } from "../../features/auth/state/useAuth.jsx";
import "../../shared/styles/controls.css";

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = useMemo(
        () => searchParams.get("token") || "",
        [searchParams],
    );

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [toastType, setToastType] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    const errors = useMemo(() => {
        const e = {};

        if (!submitted) return e;

        if (!token) e.token = "Reset token is missing";
        if (!password) e.password = "Please enter a new password";
        if (password && password.length < 6) {
            e.password = "Password must be at least 6 characters";
        }
        if (!confirmPassword)
            e.confirmPassword = "Please confirm your password";
        if (password && confirmPassword && password !== confirmPassword) {
            e.confirmPassword = "Passwords do not match";
        }

        return e;
    }, [token, password, confirmPassword, submitted]);

    const canSubmit =
        !!token &&
        password.length >= 6 &&
        confirmPassword.length > 0 &&
        password === confirmPassword &&
        !loading;

    const onSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitted(true);

        if (!canSubmit) return;

        setLoading(true);
        setToast("");

        try {
            const result = await resetPassword({ token, password });
            setToastType("success");
            setToast(result?.message || "Password reset successfully");

            setTimeout(() => {
                navigate("/auth/login");
            }, 1200);
        } catch (err) {
            setToastType("error");
            setToast(
                err?.response?.data?.message ||
                    err?.message ||
                    "Reset password failed",
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
                <div className="foot__row">
                    <span className="muted">Want to sign in instead?</span>
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
                    label="New password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    error={errors.password || errors.token || ""}
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

                <TextField
                    label="Confirm password"
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    error={errors.confirmPassword || ""}
                    right={
                        <button
                            type="button"
                            className="ghost"
                            onClick={() => setShowConfirmPass((v) => !v)}
                        >
                            {showConfirmPass ? "Hide" : "Show"}
                        </button>
                    }
                />

                <Button type="submit" loading={loading} disabled={!canSubmit}>
                    Reset password
                </Button>
            </form>
        </AuthShell>
    );
}
