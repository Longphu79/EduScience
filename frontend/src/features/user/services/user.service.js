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

// --- CÁC HÀM GET DỮ LIỆU ---
export const getUserProfile = async (userId) => {
    const res = await api.get(`/api/user/profile/${userId}`);
    return res.data;
};

// --- CÁC HÀM UPDATE PROFILE (Dùng PUT) ---
export const updateUserProfile = async (userId, body) => {
    const res = await api.put(`/api/user/profile/${userId}`, body);
    return res.data;
};

export const updateStudentProfile = async (userId, body) => {
    const res = await api.put(`/api/user/student/${userId}`, body);
    return res.data;
};

export const updateInstructorProfile = async (userId, body) => {
    const res = await api.put(`/api/user/instructor/${userId}`, body);
    return res.data;
};

// --- CÁC HÀM UPLOAD FILE (Dùng POST + FormData) ---
export const uploadUserAvatar = async (userId, file) => {
    const formData = new FormData();
    // Key "avatar" phải khớp với Backend profileUpload.single("avatar")
    formData.append("avatar", file);

    const res = await api.post(`/api/user/upload/avatar/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const uploadUserCover = async (userId, file) => {
    const formData = new FormData();
    // Key "cover" phải khớp với Backend profileUpload.single("cover")
    formData.append("cover", file);

    const res = await api.post(`/api/user/upload/cover/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// --- CÁC HÀM KHÁC ---
export const changeUserPassword = async (userId, body) => {
    const res = await api.put(`/api/user/changepassword/${userId}`, body);
    return res.data;
};

export const deactivateUser = async (userId) => {
    const res = await api.put(`/api/user/deactivate/${userId}`);
    return res.data;
};
