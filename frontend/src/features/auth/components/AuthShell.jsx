import { Link } from "react-router-dom";
import "../../../shared/styles/auth.css";

export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="auth">
            <div className="auth__bg" />
            <div className="auth__wrap">
                <div className="auth__brand">
                    <div className="brand__top">
                        <div className="brand__logo">ED</div>
                        <div className="brand__name">EduScience</div>
                    </div>

                    <div>
                        <h1 className="brand__headline">
                            Transform Your Learning Into Action
                        </h1>
                        <p className="brand__desc">
                            A modern course platform with clean design and
                            smooth experience for students and instructors.
                        </p>

                        <div className="brand__meta">
                            <span className="pill">Secure JWT Auth</span>
                            <span className="pill">Role-based Accounts</span>
                            <span className="pill">Fast Vite UI</span>
                        </div>
                    </div>

                    <div className="brand__link">
                        <Link to="/" className="brand__home">
                            Go to Homepage
                        </Link>
                    </div>
                </div>

                <div className="auth__card">
                    <div className="card__head">
                        <h2 className="card__title">{title}</h2>
                        <p className="card__sub">{subtitle}</p>
                    </div>

                    {children}

                    {footer ? <div className="card__foot">{footer}</div> : null}
                </div>
            </div>
        </div>
    );
}
