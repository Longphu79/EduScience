import {
    getUserProfileApi,
    updateUserProfileApi,
    changePasswordApi,
    deactivateAccountApi,
    updateStudentProfileApi,
    updateInstructorProfileApi,
} from "../api/userApi";
import { UserContext } from "./userContext";
import { AuthContext } from "../../auth/state/AuthContext";

import { useState, useEffect, useContext } from "react";

export const UserProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [userProfile, setUserProfile] = useState(null);

    const userId = user?._id;

    const loadUserProfile = async () => {
        try {
            const data = await getUserProfileApi(userId);
            setUserProfile(data);
        } catch (err) {
            console.log("Load user profile error:", err);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUserProfileApi(userId);
            setUserProfile(data);
        };

        if (userId) fetchUser();
    }, [userId]);

    const updateUserProfile = async (Data) => {
        await updateUserProfileApi(userId, Data);
        await loadUserProfile();
    };

    const updateStudentProfile = async (Data) => {
        await updateStudentProfileApi(userId, Data);
        await loadUserProfile();
    };

    const updateInstructorProfile = async (Data) => {
        await updateInstructorProfileApi(userId, Data);
        await loadUserProfile();
    };

    const changePassword = async (Data) => {
        await changePasswordApi(userId, Data);
    };

    const deactivateAccount = async () => {
        await deactivateAccountApi(userId);
    };

    return (
        <UserContext.Provider
            value={{
                userProfile,
                updateUserProfile,
                changePassword,
                deactivateAccount,
                updateStudentProfile,
                updateInstructorProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
