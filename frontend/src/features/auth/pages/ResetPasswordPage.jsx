import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import TextField from "../../../shared/components/TextField.jsx";
import Button from "../../../shared/components/Button.jsx";
import Toast from "../../../shared/components/Toast.jsx";
import { resetPasswordApi } from "../api/authApi.js";
import "../../../shared/styles/controls.css";

export default function ResetPasswordPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [touched, setTouched] = useState({
        password: false,
        confirmPassword: false,
    });

    const errors = useMemo(() => {
        const e = {};

        if (!token) {
            e.token = "Reset token is missing";
        }

        if (!password) {
            e.password = "Please enter a new password";
        } else if (password.length < 6) {
            e.password = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            e.confirmPassword = "Please confirm your new password";
        } else if (confirmPassword !== password) {
            e.confirmPassword = "Passwords do not match";
        }

        return e;
    }, [token, password, confirmPassword]);

    const canSubmit = Object.keys(errors).length === 0 && !loading;

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();

        setTouched({
            password: true,
            confirmPassword: true,
        });

        if (!canSubmit) return;

        setLoading(true);
        setToast("");

        try {
            const result = await resetPasswordApi({
                token,
                password,
            });

            setToast(result?.message || "Password reset successful");

            setTimeout(() => {
                nav("/auth/login");
            }, 1200);
        } catch (err) {
            setToast(err?.message || "Reset password failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Reset password"
            subtitle="Set a new password for your account."
            footer={
                <div className="foot__row">
                    <span className="muted">Back to</span>
                    <Link className="link" to="/auth/login">
                        Sign in
                    </Link>
                </div>
            }
        >
            <Toast message={toast} onClose={() => setToast("")} />

            {!token ? (
                <div className="form">
                    <div className="field__error">
                        Reset token is missing or invalid.
                    </div>
                    <Link className="link" to="/auth/forgot-password">
                        Request a new reset link
                    </Link>
                </div>
            ) : (
                <form className="form" onSubmit={onSubmit}>
                    <TextField
                        label="New password"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        placeholder="Enter new password"
                        autoComplete="new-password"
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

                    <TextField
                        label="Confirm new password"
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        error={
                            touched.confirmPassword
                                ? errors.confirmPassword
                                : ""
                        }
                        right={
                            <button
                                type="button"
                                className="ghost"
                                onClick={() =>
                                    setShowConfirmPass((v) => !v)
                                }
                            >
                                {showConfirmPass ? "Hide" : "Show"}
                            </button>
                        }
                    />

                    <Button type="submit" loading={loading} disabled={!canSubmit}>
                        Reset Password
                    </Button>
                </form>
            )}
        </AuthShell>
    );
}