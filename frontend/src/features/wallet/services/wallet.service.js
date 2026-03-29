import axios from "axios";

// 1. Khởi tạo cấu hình dùng chung
const api = axios.create({
    baseURL: "http://localhost:4000",
});

// 2. Tự động đính kèm Token vào Header trước khi gửi request
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

export const createWithdrawalRequest = async (body) => {
    const res = await api.post("/api/wallet/withdraw", body);
    return res.data;
};

const walletService = {
    getMyWallet,
    createWithdrawalRequest,
};

export default walletService;
