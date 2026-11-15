// ===== BÀI LÀM: hook giữ danh sách nhân viên đã tải và các thao tác ghi =====
import { useEffect, useState } from "react";
import axios from "axios";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../api/employees.js";
import { getErrorMessage } from "../api/http.js";

function useEmployees() {
  // Trạng thái danh sách nhân viên, đang tải và lỗi
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Key để kích hoạt effect tải lại khi người dùng bấm Thử lại
  const [reloadKey, setReloadKey] = useState(0);

  // Hàm tải lại dữ liệu danh sách
  const reload = () => {
    setReloadKey((prev) => prev + 1);
  };

  // Tải danh sách nhân viên khi mount hoặc khi reloadKey thay đổi
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getEmployees(controller.signal)
      .then((data) => {
        setEmployees(data);
        setError(null);
      })
      .catch((err) => {
        // Nếu yêu cầu bị hủy (do unmount hoặc StrictMode), không ghi vào state
        if (axios.isCancel(err) || controller.signal.aborted) {
          return;
        }
        setError(getErrorMessage(err));
      })
      .finally(() => {
        // Chỉ tắt loading nếu component vẫn còn mounted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    // Cleanup: hủy yêu cầu đang bay khi component bị gỡ khỏi màn hình
    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  // Thêm nhân viên mới vào cuối danh sách (cập nhật bất biến)
  const addEmployee = async (data) => {
    const created = await createEmployee(data);
    setEmployees((current) => [...current, created]);
    return created;
  };

  // Sửa thông tin nhân viên trong danh sách
  const saveEmployee = async (employee) => {
    const updated = await updateEmployee(employee);
    setEmployees((current) =>
      current.map((item) => (item._id === updated._id ? updated : item))
    );
    return updated;
  };

  // Xóa nhân viên khỏi danh sách
  const removeEmployee = async (id) => {
    await deleteEmployee(id);
    setEmployees((current) => current.filter((item) => item._id !== id));
  };

  return {
    employees,
    loading,
    error,
    reload,
    addEmployee,
    saveEmployee,
    removeEmployee,
  };
}

export default useEmployees;
