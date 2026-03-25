import Toast from "../../../shared/components/Toast";
import ProfileInfoCard from "../components/ProfileInfoCard";
import UserPublicHero from "../components/UserPublicHero";
import UserPublicAdminSection from "../components/UserPublicAdminSection";
import UserPublicInstructorSection from "../components/UserPublicInstructorSection";
import UserPublicStudentSection from "../components/UserPublicStudentSection";
import useUserProfilePage from "../hooks/useUserProfilePage";
import "../styles/user-profile-page.css";

export default function UserProfilePage() {
    const {
        loading,
        toast,
        setToast,
        profile,
        summary,
        summaryLoading,
        isOwnProfile,
        isInstructor,
        isAdmin,
        roleMeta,
        displayName,
        avatar,
        coverImage,
        tags,
        latestCourses,
    } = useUserProfilePage();

    if (loading) {
        return (
            <div className="user-profile-page">
                <div className="user-profile-page__container">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="user-profile-page">
                <div className="user-profile-page__container">
                    {toast.message ? (
                        <Toast
                            kind={toast.kind}
                            message={toast.message}
                            onClose={() =>
                                setToast({ message: "", kind: "error" })
                            }
                        />
                    ) : null}
                    <p>Profile not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile-page">
            <div className="user-profile-page__container">
                {toast.message ? (
                    <Toast
                        kind={toast.kind}
                        message={toast.message}
                        onClose={() => setToast({ message: "", kind: "error" })}
                    />
                ) : null}

                <UserPublicHero
                    displayName={displayName}
                    avatar={avatar}
                    coverImage={coverImage}
                    roleMeta={roleMeta}
                    isAdmin={isAdmin}
                    isOwnProfile={isOwnProfile}
                    profile={profile}
                />

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <ProfileInfoCard
                        label="Full name"
                        value={profile?.fullName}
                    />
                    <ProfileInfoCard
                        label="Username"
                        value={profile?.username}
                    />
                    <ProfileInfoCard
                        label="Joined"
                        value={
                            profile?.createdAt
                                ? new Date(
                                      profile.createdAt,
                                  ).toLocaleDateString("vi-VN")
                                : "--"
                        }
                    />
                </div>

                {isAdmin ? (
                    <UserPublicAdminSection
                        profile={profile}
                        roleMeta={roleMeta}
                    />
                ) : isInstructor ? (
                    <UserPublicInstructorSection
                        profile={profile}
                        roleMeta={roleMeta}
                        tags={tags}
                        summaryLoading={summaryLoading}
                        summary={summary}
                        latestCourses={latestCourses}
                    />
                ) : (
                    <UserPublicStudentSection
                        profile={profile}
                        roleMeta={roleMeta}
                        tags={tags}
                    />
                )}
            </div>
        </div>
    );
}
