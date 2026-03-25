import request from "../../../services/request"; // KHÔNG dùng { request }

export const createCheckout = async () => {
    // Axios trả về một object, dữ liệu thực sự nằm trong .data
    const response = await request.post("/api/checkout");
    return response.data;
};

export const getCheckoutInfo = async (orderId) => {
    const response = await request.get(`/api/checkout/${orderId}`);
    return response.data;
};

export const getPaymentStatus = async (orderId) => {
    const response = await request.get(`/api/order/${orderId}/status`);
    return response.data;
};
