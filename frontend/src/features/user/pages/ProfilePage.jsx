import { Navigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import DashboardHero from "../components/DashboardHero";
import DashboardAdminSection from "../components/DashboardAdminSection";
import DashboardInstructorSection from "../components/DashboardInstructorSection";
import DashboardStudentSection from "../components/DashboardStudentSection";
import useProfilePage from "../hooks/useProfilePage";
import "../styles/profile-page.css";

export default function ProfilePage() {
    const {
        booting,
        isAuthenticated,
        user,
        currentUserId,
        isInstructor,
        isAdmin,
        displayName,
        avatar,
        summary,
        summaryLoading,
        chips,
        toast,
        setToast,
    } = useProfilePage();

    if (booting) {
        return (
            <div className="profile-page">
                <div className="profile-page__container">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className="profile-page">
            <div className="profile-page__container">
                {toast.message ? (
                    <Toast
                        kind={toast.kind}
                        message={toast.message}
                        onClose={() =>
                            setToast({ message: "", kind: "success" })
                        }
                    />
                ) : null}

                <DashboardHero
                    currentUserId={currentUserId}
                    user={user}
                    isAdmin={isAdmin}
                    isInstructor={isInstructor}
                    displayName={displayName}
                    avatar={avatar}
                />

                {summaryLoading ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        Loading profile summary...
                    </div>
                ) : isAdmin ? (
                    <DashboardAdminSection
                        currentUserId={currentUserId}
                        user={user}
                        summary={summary}
                    />
                ) : isInstructor ? (
                    <DashboardInstructorSection
                        user={user}
                        summary={summary}
                        chips={chips}
                    />
                ) : (
                    <DashboardStudentSection
                        user={user}
                        summary={summary}
                        chips={chips}
                    />
                )}
            </div>
        </div>
    );
}
