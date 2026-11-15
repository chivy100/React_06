// ===== BÀI LÀM: trang sửa nhân viên (PUT bản ghi đầy đủ) =====
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm.jsx";
import { useEmployeeStore } from "../context/EmployeesContext.jsx";
import useEmployee from "../hooks/useEmployee.js";
import { getErrorMessage } from "../api/http.js";

function EmployeeEditPage() {
  const { id } = useParams();
  const { employee, loading, error, notFound } = useEmployee(id);
  const { saveEmployee } = useEmployeeStore();
  const navigate = useNavigate();

  // State cục bộ quản lý tiến trình lưu, lỗi và thông báo trạng thái
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // 1. Trạng thái đang tải
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 py-4">
        <div className="spinner-border spinner-border-sm" aria-hidden="true"></div>
        <span>Đang tải...</span>
      </div>
    );
  }

  // 2. Trạng thái không tìm thấy nhân viên (404)
  if (notFound) {
    return (
      <div className="py-4">
        <div className="alert alert-danger" role="alert">
          Không tìm thấy nhân viên {id}
        </div>
        <Link className="btn btn-link px-0" to="/">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // 3. Trạng thái có lỗi khi tải
  if (error) {
    return (
      <div className="py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link className="btn btn-link px-0" to="/">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Phòng ngừa trường hợp biên chưa có employee
  if (!employee) {
    return null;
  }

  // 4. Xử lý lưu thay đổi
  const handleSubmit = async (values) => {
    // So sánh dữ liệu form với bản ghi cũ (Dirty checking)
    const hasChanged =
      values.name !== employee.name ||
      values.email !== employee.email ||
      values.department !== employee.department ||
      values.position !== employee.position ||
      Number(values.salary) !== Number(employee.salary) ||
      values.city !== employee.city ||
      values.status !== employee.status ||
      values.joinedAt !== employee.joinedAt;

    // Nếu không có thay đổi nào: không gửi API, hiện thông báo
    if (!hasChanged) {
      setInfoMessage("Chưa có thay đổi nào để lưu.");
      setEditError(null);
      return;
    }

    setSubmitting(true);
    setEditError(null);
    setInfoMessage(null);

    try {
      // Ghi đè các trường mới vào bản ghi cũ (giữ nguyên code và _id)
      const updatedRecord = {
        ...employee,
        ...values,
      };

      await saveEmployee(updatedRecord);
      // Thành công: điều hướng về trang chi tiết của nhân viên
      navigate(`/employees/${employee._id}`);
    } catch (err) {
      setEditError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      <h2 className="h4 mb-3">Sửa nhân viên</h2>

      {/* Thông báo lỗi khi cập nhật thất bại */}
      {editError && (
        <div className="alert alert-danger mb-3" role="alert">
          {editError}
        </div>
      )}

      {/* Thông báo khi không có thay đổi nào */}
      {infoMessage && (
        <div className="alert alert-warning mb-3" role="status">
          {infoMessage}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <EmployeeForm
            initialValues={employee}
            submitLabel="Lưu thay đổi"
            submitting={submitting}
            onSubmit={handleSubmit}
          />
          <div className="mt-3">
            <Link className="btn btn-link px-0" to={`/employees/${employee._id}`}>
              Hủy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeEditPage;
