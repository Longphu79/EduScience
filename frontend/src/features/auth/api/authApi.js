import { request } from "../../../services/https.js";

export const loginApi = async (body) => {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response?.data;
};

export const registerApi = async (body) => {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response?.data;
};