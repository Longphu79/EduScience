import axios from "axios";

console.log("VITE ENV CHECK:", import.meta.env);

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    console.error("VITE_API_URL is not defined in .env file");
}

const request = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || "";

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

request.interceptors.response.use(
    (response) => response,
    (error) => {
        const responseData = error?.response?.data;

        const serverMessage =
            responseData?.message ||
            responseData?.error ||
            responseData?.errors?.[0]?.message ||
            error?.message ||
            "Request failed";

        if (error?.response?.status === 401) {
            console.warn("Unauthorized request");
        }

        const normalizedError = new Error(serverMessage);
        normalizedError.status = error?.response?.status || 500;
        normalizedError.data = responseData;
        normalizedError.originalError = error;

        return Promise.reject(normalizedError);
    },
);

export default request;