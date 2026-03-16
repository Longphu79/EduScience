import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginApi, registerApi } from "../api/authApi.js";

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");

        setToken(t);
        setUser(u ? JSON.parse(u) : null);
        setBooting(false);
    }, []);

    const login = async ({ username, password }) => {
        const data = await loginApi({ username, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async ({ username, email, password, role }) => {
        const data = await registerApi({ username, email, password, role });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
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
            booting,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }),
        [token, user, booting],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
