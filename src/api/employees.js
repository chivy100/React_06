// ===== BÀI LÀM: các hàm gọi API /employees của crudcrud =====
import http from "./http.js";

// Lấy TOÀN BỘ nhân viên, trả mảng (nhận signal để hủy yêu cầu nếu cần)
export async function getEmployees(signal) {
  const config = signal ? { signal } : {};
  const response = await http.get("/employees", config);
  return response.data;
}

// Thêm nhân viên mới, trả bản ghi máy chủ vừa tạo (có _id)
export async function createEmployee(data) {
  // Đảm bảo không gửi _id lên máy chủ khi tạo mới
  const { _id, ...payload } = data;
  const response = await http.post("/employees", payload);
  return response.data;
}

// Sửa nhân viên bằng PUT; nhận bản ghi đầy đủ (có _id), gửi thân không có _id, trả lại bản ghi đã sửa
export async function updateEmployee(employee) {
  const { _id, ...payload } = employee;
  await http.put(`/employees/${_id}`, payload);
  // crudcrud trả về 200 không có thân, trả lại đối tượng đã cập nhật
  return employee;
}

// Xóa nhân viên theo _id
export async function deleteEmployee(id) {
  const response = await http.delete(`/employees/${id}`);
  return response.data;
}
