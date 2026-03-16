import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../features/auth/components/AuthShell.jsx";
import TextField from "../../shared/components/TextField.jsx";
import Button from "../../shared/components/Button.jsx";
import Toast from "../../shared/components/Toast.jsx";
import { useAuth } from "../../features/auth/state/useAuth.jsx";
import "../../shared/styles/controls.css";

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("student");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");

    const errors = useMemo(() => {
        const e = {};
        if (!username.trim()) e.username = "Please enter a username";
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            e.email = "Email is not valid";
        if (!password) e.password = "Please enter a password";
        if (password && password.length < 6)
            e.password = "Password must be at least 6 characters";
        if (!role) e.role = "Please choose a role";
        return e;
    }, [username, email, password, role]);

    const canSubmit = Object.keys(errors).length === 0 && !loading;

    const onSubmit = async (ev) => {
        ev.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setToast("");
        try {
            await register({
                username: username.trim(),
                email: email.trim() ? email.trim() : undefined,
                password,
                role,
            });
            nav("/");
        } catch (err) {
            setToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Create account"
            subtitle="Join EduScience in seconds."
            footer={
                <div className="foot__row">
                    <span className="muted">Already have an account?</span>
                    <Link className="link" to="/login">
                        Sign in
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
                    label="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email || ""}
                />

                <div className="field">
                    <label className="field__label">Role</label>
                    <div className={`seg ${errors.role ? "is-error" : ""}`}>
                        <button
                            type="button"
                            className={`seg__btn ${role === "student" ? "is-active" : ""}`}
                            onClick={() => setRole("student")}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            className={`seg__btn ${role === "instructor" ? "is-active" : ""}`}
                            onClick={() => setRole("instructor")}
                        >
                            Instructor
                        </button>
                    </div>
                    {errors.role ? (
                        <div className="field__error">{errors.role}</div>
                    ) : null}
                </div>

                <TextField
                    label="Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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

                <div className="small muted">
                    By continuing, you agree to our Terms and acknowledge our
                    Privacy Policy.
                </div>

                <Button type="submit" loading={loading} disabled={!canSubmit}>
                    Create Account
                </Button>
            </form>
        </AuthShell>
    );
}
