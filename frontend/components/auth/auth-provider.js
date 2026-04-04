"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { browserApiFetch, browserPostJson } from "@/lib/web-api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const profile = await browserApiFetch("/api/session/me");
    const nextSession = { user: profile };
    setSession(nextSession);
    return nextSession;
  };

  useEffect(() => {
    refreshProfile()
      .catch(() => {
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ username, password, expectedRole }) => {
    const result = await browserPostJson("/api/session/login", {
      username,
      password,
    });

    if (expectedRole && result?.user?.role !== expectedRole) {
      throw new Error(`Use the ${result.user.role} login route for this account`);
    }

    const nextSession = { user: result.user };
    setSession(nextSession);
    return nextSession;
  };

  const register = async ({ username, email, password, role = "student" }) => {
    const result = await browserPostJson("/api/session/register", {
      username,
      email,
      password,
      role,
    });

    const nextSession = { user: result.user };
    setSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    await browserPostJson("/api/session/logout", {});
    setSession(null);
  };

  const value = useMemo(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      isAuthenticated: Boolean(session?.user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
