// ===== BÀI LÀM: hook lấy một nhân viên theo _id từ danh sách đã tải =====
import { useEmployeeStore } from "../context/EmployeesContext.jsx";

// Hook lấy thông tin một nhân viên theo _id từ store chung (không gửi thêm API)
function useEmployee(id) {
  const { employees, loading, error } = useEmployeeStore();

  // Tìm nhân viên trong mảng đã tải
  const employee = employees.find((emp) => emp._id === id) || null;

  // notFound là true khi danh sách đã tải xong, không có lỗi và không có nhân viên nào mang _id đó
  const notFound = !loading && !error && !employee;

  return {
    employee,
    loading,
    error,
    notFound,
  };
}

export default useEmployee;
