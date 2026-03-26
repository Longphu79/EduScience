import request from "../../../services/request.js";

export const loginApi = async (credentials) => {
    // credentials lúc này là { username, password }
    const response = await request("/api/auth/login", {
        method: "POST",
        data: credentials, // Dùng 'data' thay vì 'body', bỏ JSON.stringify
    });
    return response?.data;
};

export const registerApi = async (payload) => {
    const response = await request("/api/auth/register", {
        // Kiểm tra lại path register nhé
        method: "POST",
        data: payload, // Dùng 'data' thay vì 'body'
    });
    return response?.data;
};

export const forgotPasswordApi = async (payload) => {
    const response = await request.post("/api/auth/forgot-password", payload);
    return response.data?.data;
};

export const resetPasswordApi = async (payload) => {
    const response = await request.post("/api/auth/reset-password", payload);
    return response.data?.data;
};
