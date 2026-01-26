import { request } from "../../../services/https.js";

export const loginApi = (body) => {
  return request("/auth/login", { method: "POST", body: JSON.stringify(body) });
};

export const registerApi = (body) => {
  return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
};