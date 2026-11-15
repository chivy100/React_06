// ===== BÀI LÀM: trang chi tiết nhân viên và nút xóa =====
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { useEmployeeStore } from "../context/EmployeesContext.jsx";
import useEmployee from "../hooks/useEmployee.js";
import { getErrorMessage } from "../api/http.js";
import formatDate from "../utils/formatDate.js";
import formatVnd from "../utils/formatVnd.js";

function EmployeeDetailPage() {
  const { id } = useParams();
  const { employee, loading, error, notFound } = useEmployee(id);
  const { removeEmployee } = useEmployeeStore();
  const navigate = useNavigate();

  // State cục bộ phục vụ thao tác xóa
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  // 3. Trạng thái có lỗi khi tải danh sách
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

  // Nếu chưa có dữ liệu employee (phòng ngừa trường hợp biên)
  if (!employee) {
    return null;
  }

  // 4. Xử lý xóa nhân viên
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await removeEmployee(employee._id);
      // Chuyển về danh sách kèm query param deleted để hiện thông báo flash
      navigate(`/?deleted=${encodeURIComponent(employee.name)}`);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <div className="py-2">
      {/* Hiển thị lỗi xóa nếu có */}
      {deleteError && (
        <div className="alert alert-danger mb-3" role="alert">
          {deleteError}
        </div>
      )}

      {/* Khối hiển thị chi tiết */}
      <section className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h2 className="h4 mb-0">{employee.name}</h2>
            <StatusBadge status={employee.status} />
          </div>

          <p className="mb-1">
            {employee.position} - {employee.department}
          </p>
          <p className="mb-1">Email: {employee.email}</p>
          <p className="mb-1">Lương: {formatVnd(employee.salary)}</p>
          <p className="mb-1">Thành phố: {employee.city}</p>
          <p className="mb-3">Vào làm: {formatDate(employee.joinedAt)}</p>

          <div className="d-flex flex-wrap gap-2">
            <Link
              className="btn btn-outline-primary"
              to={`/employees/${employee._id}/edit`}
            >
              Sửa nhân viên
            </Link>
            <button
              className="btn btn-danger"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    aria-hidden="true"
                  ></span>
                  Đang xóa...
                </>
              ) : (
                "Xóa nhân viên"
              )}
            </button>
            <Link className="btn btn-link" to="/">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmployeeDetailPage;
