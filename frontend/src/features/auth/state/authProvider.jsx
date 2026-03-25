import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginApi, registerApi } from "../api/authApi.js";

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            if (storedToken && parsedUser) {
                setToken(storedToken);
                setUser(parsedUser);
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error("Auth boot error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        } finally {
            setBooting(false);
        }
    }, []);

    const persistAuth = (nextToken, nextUser) => {
        if (nextToken && nextUser) {
            localStorage.setItem("token", nextToken);
            localStorage.setItem("user", JSON.stringify(nextUser));

            setToken(nextToken); // Cập nhật state token
            setUser(nextUser); // Cập nhật state user -> Đây là lúc Header sẽ đổi màu/hiện menu
            return;
        }
        // Nếu dữ liệu sai, xóa sạch
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const login = async ({ username, password }) => {
        try {
            const apiResponse = await loginApi({ username, password });

            // TRƯỚC ĐÓ: apiResponse?.token (SAI)
            // BÂY GIỜ: Phải vào trong data mới thấy token
            const token = apiResponse?.data?.token;

            // User cũng nằm trong data
            const user = apiResponse?.data?.user;
            if (token && user) {
                persistAuth(token, user);
                console.log("CHÚC MỪNG: ĐÃ LƯU THÀNH CÔNG!");
            } else {
                console.error("Vẫn thiếu dữ liệu! Check lại: ", apiResponse);
            }

            return apiResponse;
        } catch (error) {
            console.error("Lỗi login:", error);
            throw error;
        }
    };

    const register = async (payload) => {
        const responseData = await registerApi(payload);

        const token = responseData?.token;
        const user = responseData?.data?.user;

        persistAuth(token, user);
        return responseData;
    };

    const updateCurrentUser = (nextUser) => {
        if (!nextUser) return;
        setUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));
    };

    const mergeCurrentUser = (partialUser) => {
        setUser((prev) => {
            const merged = {
                ...(prev || {}),
                ...(partialUser || {}),
            };

            localStorage.setItem("user", JSON.stringify(merged));
            return merged;
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null); // Đặt lại state token về null
        setUser(null); // Đặt lại state user về null
    };

    const value = useMemo(
        () => ({
            token,
            user,
            setUser,
            booting,
            isAuthenticated: !!token && !!user,
            login,
            register,
            logout,
            updateCurrentUser,
            mergeCurrentUser,
        }),
        [token, user, booting],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
