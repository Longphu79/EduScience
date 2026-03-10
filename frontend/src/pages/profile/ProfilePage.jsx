import { useContext } from "react";
import { UserContext } from "../../features/user/state/userContext";
import FileUpload from "../../features/upload/components/FileUpload";
import { uploadAvatar } from "../../features/upload/api/uploadApi";

import StudentProfile from "./StudentProfile";
import InstructorProfile from "./InstructorProfile";

const ProfilePage = () => {
    const { userProfile, updateUserProfile } = useContext(UserContext);

    if (!userProfile) {
        return <div>Loading...</div>;
    }

    const handleAvatarUpload = async (file) => {
        const result = await uploadAvatar(file);
        await updateUserProfile({ avatarUrl: result.url });
        return result;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            {/* User info */}
            <div className="bg-white shadow p-6 rounded-xl mb-6">
                <FileUpload
                    accept="image/jpeg,image/png,image/webp"
                    label="Avatar"
                    preview={userProfile.avatarUrl}
                    onUpload={handleAvatarUpload}
                />
                <p className="mt-4">
                    <b>Email:</b> {userProfile.email}
                </p>
                <p>
                    <b>Role:</b> {userProfile.role}
                </p>
            </div>

            {/* Role specific */}
            {userProfile.role === "student" && (
                <StudentProfile profile={userProfile.profileData} />
            )}

            {userProfile.role === "instructor" && (
                <InstructorProfile profile={userProfile.profileData} />
            )}
        </div>
    );
};

export default ProfilePage;
