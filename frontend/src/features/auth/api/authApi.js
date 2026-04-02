import request from "../../../services/request.js";

export const loginApi = async (credentials) => {
    const response = await request("/api/auth/login", {
        method: "POST",
        data: credentials,
    });
    return response?.data;
};

export const registerApi = async (payload) => {
    const response = await request("/api/auth/register", {
        method: "POST",
        data: payload,
    });
    return response?.data;
};

export const forgotPasswordApi = async (payload) => {
    const response = await request("/api/auth/forgot-password", {
        method: "POST",
        data: payload,
    });
    return response?.data;
};

export const resetPasswordApi = async (payload) => {
    const response = await request("/api/auth/reset-password", {
        method: "POST",
        data: payload,
    });
    return response?.data;
};