// File: src/services/api.js
import request from "./request";

export { request as api }; // Export một "tên" là api để các file khác dùng { api }
export default request; // Vẫn giữ default để không bị lỗi nếu chỗ khác import default
