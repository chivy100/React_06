// ===== BÀI LÀM: trang danh sách nhân viên (tìm kiếm, lọc, phân trang) =====
import { useSearchParams } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard.jsx";
import { DEPARTMENTS, PAGE_SIZE } from "../config.js";
import { useEmployeeStore } from "../context/EmployeesContext.jsx";

function EmployeesPage() {
  const { employees, loading, error, reload } = useEmployeeStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc các giá trị từ URL
  const qParam = searchParams.get("q") || "";
  const deptParam = searchParams.get("department") || "";
  const deletedName = searchParams.get("deleted");

  // Xử lý từ khóa tìm kiếm (cắt khoảng trắng, chữ thường)
  const keyword = qParam.trim().toLowerCase();

  // 1. Lọc nhân viên theo từ khóa (họ tên, email) và phòng ban ngay trên client
  const filteredEmployees = employees.filter((emp) => {
    const matchKeyword =
      !keyword ||
      emp.name.toLowerCase().includes(keyword) ||
      emp.email.toLowerCase().includes(keyword);

    const matchDept = !deptParam || emp.department === deptParam;

    return matchKeyword && matchDept;
  });

  const total = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 2. Chuẩn hóa trang hiện tại từ URL
  const rawPage = searchParams.get("page");
  let currentPage = 1;
  if (rawPage) {
    const parsed = parseInt(rawPage, 10);
    if (isNaN(parsed) || parsed < 1) {
      currentPage = 1;
    } else if (parsed > totalPages) {
      currentPage = totalPages;
    } else {
      currentPage = parsed;
    }
  }

  // 3. Phân trang trên mảng đã lọc
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // 4. Hàm cập nhật searchParams lên URL
  const updateParams = (newValues) => {
    const nextQ = newValues.q !== undefined ? newValues.q : qParam;
    const nextDept =
      newValues.department !== undefined ? newValues.department : deptParam;
    const nextPage = newValues.page !== undefined ? newValues.page : currentPage;

    const nextParams = {};
    if (nextQ) {
      nextParams.q = nextQ;
    }
    if (nextDept) {
      nextParams.department = nextDept;
    }
    if (nextPage > 1) {
      nextParams.page = String(nextPage);
    }

    // Khi người dùng gõ tìm kiếm, đổi phòng ban hoặc đổi trang thì xóa deleted khỏi URL
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    updateParams({ q: e.target.value, page: 1 });
  };

  const handleDeptChange = (e) => {
    updateParams({ department: e.target.value, page: 1 });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateParams({ page: currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateParams({ page: currentPage + 1 });
    }
  };

  return (
    <div className="container py-2">
      <h2 className="h4 mb-3">Danh sách nhân viên</h2>

      {/* Thông báo đã xóa nhân viên (nếu có trên URL) */}
      {deletedName && (
        <div className="alert alert-success" role="status">
          Đã xóa nhân viên {deletedName}.
        </div>
      )}

      {/* Thanh tìm kiếm và lọc phòng ban */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-8">
          <label className="form-label" htmlFor="search">
            Tìm kiếm
          </label>
          <input
            className="form-control"
            id="search"
            placeholder="Tìm nhân viên"
            value={qParam}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="department">
            Phòng ban
          </label>
          <select
            className="form-select"
            id="department"
            value={deptParam}
            onChange={handleDeptChange}
          >
            <option value="">Tất cả phòng ban</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hiển thị theo các trạng thái */}
      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" aria-hidden="true"></div>
          <span>Đang tải...</span>
        </div>
      ) : error ? (
        <div>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-outline-primary" onClick={reload}>
            Thử lại
          </button>
        </div>
      ) : total === 0 ? (
        <div>
          <div className="alert alert-info">Không có nhân viên phù hợp.</div>
          <nav aria-label="Phân trang">
            <ul className="pagination justify-content-center">
              <li className="page-item">
                <button className="page-link" disabled>
                  Trước
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Trang 1 / 1</span>
              </li>
              <li className="page-item">
                <button className="page-link" disabled>
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        <div>
          <p className="text-body-secondary">Tổng cộng {total} nhân viên</p>
          <ul className="list-unstyled" aria-label="Danh sách nhân viên">
            {paginatedEmployees.map((emp) => (
              <li key={emp._id}>
                <EmployeeCard employee={emp} />
              </li>
            ))}
          </ul>

          {/* Phân trang */}
          <nav aria-label="Phân trang">
            <ul className="pagination justify-content-center">
              <li className="page-item">
                <button
                  className="page-link"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                >
                  Trước
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  Trang {currentPage} / {totalPages}
                </span>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
