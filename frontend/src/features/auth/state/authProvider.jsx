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

            setToken(nextToken);
            setUser(nextUser);
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    const login = async ({ email, password }) => {
        try {
            const apiResponse = await loginApi({ email, password });

            const nextToken = apiResponse?.data?.token;
            const nextUser = apiResponse?.data?.user;

            if (!nextToken || !nextUser) {
                throw new Error("Login response is invalid");
            }

            persistAuth(nextToken, nextUser);
            return apiResponse;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (payload) => {
        try {
            const apiResponse = await registerApi(payload);
            return apiResponse;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
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

        setToken(null);
        setUser(null);
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