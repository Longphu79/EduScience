import { useContext } from "react";
import { UserContext } from "../../features/user/state/userContext";

import StudentProfile from "./StudentProfile";
import InstructorProfile from "./InstructorProfile";

const ProfilePage = () => {
    const { userProfile } = useContext(UserContext);

    if (!userProfile) {
        return <div>Loading...</div>;
    }
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            {/* User info */}
            <div className="bg-white shadow p-6 rounded-xl mb-6">
                <p>
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
