// ===== BÀI LÀM: trang thêm nhân viên mới =====
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm.jsx";
import { EMPTY_EMPLOYEE } from "../config.js";
import { useEmployeeStore } from "../context/EmployeesContext.jsx";
import { getErrorMessage } from "../api/http.js";

function EmployeeCreatePage() {
  const { addEmployee } = useEmployeeStore();
  const navigate = useNavigate();

  // State cục bộ quản lý tiến trình gửi dữ liệu và lỗi
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      // Gọi API thêm nhân viên mới (POST /employees)
      const created = await addEmployee(values);
      // Thành công: chuyển tới trang chi tiết của nhân viên vừa tạo
      navigate(`/employees/${created._id}`);
    } catch (err) {
      // Thất bại: hiển thị thông báo lỗi, giữ nguyên dữ liệu form
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      <h2 className="h4 mb-3">Thêm nhân viên mới</h2>

      {/* Thông báo lỗi khi lưu thất bại */}
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <EmployeeForm
            initialValues={EMPTY_EMPLOYEE}
            submitLabel="Lưu nhân viên"
            submitting={submitting}
            onSubmit={handleSubmit}
          />
          <div className="mt-3">
            <Link className="btn btn-link px-0" to="/">
              Hủy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCreatePage;
