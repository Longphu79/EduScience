import request from "../../../services/https.js";

export const loginApi = async (payload) => {
  const response = await request.post("/auth/login", payload);
  return response.data?.data;
};

export const registerApi = async (payload) => {
  const response = await request.post("/auth/register", payload);
  return response.data?.data;
};

export const forgotPasswordApi = async (payload) => {
  const response = await request.post("/auth/forgot-password", payload);
  return response.data?.data;
};

export const resetPasswordApi = async (payload) => {
  const response = await request.post("/auth/reset-password", payload);
  return response.data?.data;
};