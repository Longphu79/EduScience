import { request } from "../../../services/https.js";

export const loginApi = (data) => {
  return request("/auth/login", { method: "POST", data });
};

export const registerApi = (data) => {
  return request("/auth/register", { method: "POST", data });
};