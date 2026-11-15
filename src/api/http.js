// ===== BÀI LÀM: instance axios và hàm đổi lỗi thành thông báo =====
import axios from "axios";
import { API_BASE } from "../config.js";

// Tạo instance bằng axios.create với baseURL là API_BASE trong src/config.js
const http = axios.create({
  baseURL: API_BASE,
});

// Đổi lỗi axios thành thông báo tiếng Việt theo status
export function getErrorMessage(error) {
  // Không có phản hồi từ máy chủ (mất mạng hoặc quá hạn mức crudcrud)
  if (!error?.response) {
    return "Không kết nối được máy chủ. Hãy kiểm tra mạng; nếu endpoint đã quá 100 yêu cầu hoặc quá 24 giờ, hãy lấy endpoint mới ở crudcrud.com.";
  }

  const status = error.response.status;

  if (status === 404) {
    return "Không tìm thấy dữ liệu (404).";
  }

  if (status >= 500) {
    return "Máy chủ đang gặp sự cố, hãy thử lại sau.";
  }

  // Mã 4xx khác
  if (status >= 400 && status < 500) {
    return "Yêu cầu không hợp lệ.";
  }

  return "Yêu cầu không hợp lệ.";
}

export default http;
