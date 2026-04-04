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

export const getMyWallet = async () => {
    const res = await api.get("/api/wallet/my-wallet");
    return res.data;
};

export const getMyWithdrawals = async () => {
    const res = await api.get("/api/wallet/withdraw/history");
    return res.data;
};

export const createWithdrawalRequest = async (body) => {
    const res = await api.post("/api/wallet/withdraw", body);
    return res.data;
};

export const requestWithdrawalOtp = async (body) => {
    const res = await api.post("/api/wallet/withdraw/request-otp", body);
    return res.data;
};

export const verifyWithdrawalOtp = async (body) => {
    const res = await api.post("/api/wallet/withdraw/verify-otp", body);
    return res.data;
};

export const createDepositRequest = async (amount) => {
    const res = await api.post("/api/wallet/deposit", { amount });
    return res.data;
};

export const getMyDeposits = async () => {
    const res = await api.get("/api/wallet/deposit/history");
    return res.data;
};

const walletService = {
    getMyWallet,
    getMyWithdrawals,
    createWithdrawalRequest,
    requestWithdrawalOtp,
    verifyWithdrawalOtp,
    createDepositRequest,
    getMyDeposits,
};

export default walletService;