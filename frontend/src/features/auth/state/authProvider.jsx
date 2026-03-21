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

  const login = async ({ username, password }) => {
    const data = await loginApi({ username, password });
    persistAuth(data?.token, data?.user);
    return data;
  };

  const register = async ({ username, email, password, role }) => {
    const data = await registerApi({ username, email, password, role });
    persistAuth(data?.token, data?.user);
    return data;
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
    persistAuth(null, null);
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
    [token, user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}