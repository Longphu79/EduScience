import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000",
});

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getUserTransactions = async () => {
    const res = await api.get("/api/transaction/my-transactions");
    return res.data;
};

const transactionService = {
    getUserTransactions,
};

export default transactionService;
