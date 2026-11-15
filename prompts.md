# NHẬT KÝ PROMPT VÀ PHÁT TRIỂN ỨNG DỤNG (AI-DRIVEN DEVELOPMENT)

---

## Prompt 1 – Thiết lập cấu hình và Tầng API Service (`http.js`, `employees.js`)

### 1. Mục tiêu:
Xây dựng lớp gọi API trung gian giao tiếp với máy chủ CRUD (crudcrud.com), thiết lập axios instance và cơ chế bắt/chuẩn hóa mã lỗi thành thông báo tiếng Việt thân thiện theo đúng quy định.

### 2. Phân tích trước khi code:
- **`src/api/http.js`**:
  - Dùng `axios.create` gán `baseURL = API_BASE` từ `src/config.js`.
  - Hàm `getErrorMessage(error)` phân loại:
    - Nếu không có `error.response` (mất mạng hoặc quá quota 100 requests): trả về thông báo lỗi mạng / hạn mức.
    - Status 404: `"Không tìm thấy dữ liệu (404)."`
    - Status $\ge$ 500: `"Máy chủ đang gặp sự cố, hãy thử lại sau."`
    - Status 4xx khác: `"Yêu cầu không hợp lệ."`
- **`src/api/employees.js`**:
  - `getEmployees(signal)`: GET `/employees`, hỗ trợ AbortSignal cho cleanup.
  - `createEmployee(data)`: POST `/employees`, loại bỏ `_id` khỏi payload trước khi gửi.
  - `updateEmployee(employee)`: PUT `/employees/${_id}`, gửi toàn bộ trường nhưng không kèm `_id`. Vì crudcrud trả về 200 không có body, hàm tự ghép trả về đối tượng đã update.
  - `deleteEmployee(id)`: DELETE `/employees/${id}`.

### 3. Prompt đã sử dụng:
> Hãy triển khai tệp `src/api/http.js` và `src/api/employees.js` theo đúng yêu cầu đề bài:
> 1. Trong `src/api/http.js`: Tạo và export default một axios instance có `baseURL` lấy từ `API_BASE` trong `src/config.js`. Export hàm `getErrorMessage(error)` xử lý đúng các trường hợp lỗi 404, >= 500, lỗi 4xx khác và trường hợp mất mạng / quá hạn mức request.
> 2. Trong `src/api/employees.js`: Export các hàm `getEmployees(signal)`, `createEmployee(data)`, `updateEmployee(employee)`, `deleteEmployee(id)` sử dụng instance `http`. Đảm bảo `createEmployee` và `updateEmployee` gửi body không chứa trường `_id`, và `updateEmployee` tự ghép trả về bản ghi hoàn chỉnh vì server crudcrud trả về 200 rỗng. Chú thích tiếng Việt ngắn gọn.

### 4. Kết quả triển khai:
- Hoàn thiện `src/api/http.js` và `src/api/employees.js`.
- Bổ sung chú thích tiếng Việt rõ ràng cho từng hàm và từng nhánh điều kiện.

### 5. Kiểm thử:
- Lệnh chạy: `npx vitest run -t "Lớp API"`
- Kết quả: 5/5 bài test của nhóm "Lớp API: http và getErrorMessage" và "Lớp API: các hàm trong employees.js" vượt qua (PASSED).

### 6. Đánh giá:
- Đáp ứng 100% tiêu chí đề bài cho tầng API. Đảm bảo cấu trúc body sạch khi gửi lên crudcrud, tránh lỗi 500.

### 7. Sai sót của AI (nếu có):
- Chưa phát hiện sai sót trong bước này. Code sinh ra chính xác cú pháp và pass toàn bộ test case kiểm tra mã lỗi cũng như định dạng payload.


---

## Prompt 2 – Triển khai Custom Hook `useEmployees` (`src/hooks/useEmployees.js`)

### 1. Mục tiêu:
Xây dựng Custom Hook `useEmployees()` quản lý trạng thái tải danh sách nhân viên từ API 1 lần duy nhất vào Context chung, xử lý hủy request bằng AbortController/Signal, cung cấp hàm `reload()` và các hàm cập nhật bất biến `addEmployee`, `saveEmployee`, `removeEmployee`.

### 2. Phân tích trước khi code:
- Sử dụng `useState` cho `employees` (mảng), `loading` (boolean, ban đầu `true`), `error` (chuỗi/null), và `reloadKey` (số đếm để kích hoạt effect reload).
- Sử dụng `useEffect` có dependency `[reloadKey]`:
  - Khởi tạo `new AbortController()`.
  - Bắt lỗi: Nếu lỗi là `axios.isCancel(err)` hoặc `controller.signal.aborted` thì bỏ qua (không ghi vào state `error`).
  - Lỗi mạng/server: ghi vào `error` qua `getErrorMessage(err)`.
  - Cleanup function: gọi `controller.abort()`.
- Các hàm mutate (`addEmployee`, `saveEmployee`, `removeEmployee`):
  - Áp dụng cập nhật State bất biến:
    - Thêm: `setEmployees(current => [...current, created])`
    - Sửa: `setEmployees(current => current.map(item => item._id === updated._id ? updated : item))`
    - Xóa: `setEmployees(current => current.filter(item => item._id !== id))`
  - Không bọc `try/catch` để lỗi được ném ra cho component gọi xử lý.

### 3. Prompt đã sử dụng:
> Hãy triển khai custom hook `src/hooks/useEmployees.js`:
> 1. Quản lý 3 state: `employees` (mặc định mảng rỗng), `loading` (mặc định true), `error` (mặc định null).
> 2. Dùng `useEffect` gọi `getEmployees` 1 lần duy nhất khi mount với `AbortController`. Cleanup function phải gọi `abort()`. Xử lý để request bị hủy không ghi vào state và không báo lỗi kể cả khi bọc trong StrictMode.
> 3. Cung cấp hàm `reload()` để tải lại (dùng cho nút Thử lại).
> 4. Cung cấp 3 hàm ghi: `addEmployee(data)`, `saveEmployee(employee)`, `removeEmployee(id)` với cú pháp cập nhật `setEmployees(current => ...)` và để lỗi ném ra cho trang bắt.
> 5. Hook trả về: `{ employees, loading, error, reload, addEmployee, saveEmployee, removeEmployee }`.

### 4. Kết quả triển khai:
- Hoàn thiện `src/hooks/useEmployees.js` với đầy đủ chú thích tiếng Việt.
- Tích hợp an toàn với React 18 `StrictMode` và cơ chế hủy của Axios.

### 5. Kiểm thử:
- Lệnh chạy: `npx vitest run -t "useEmployees"`
- Kết quả: 3/3 test dành riêng cho `useEmployees` vượt qua hoàn hảo:
  1. Trạng thái khởi tạo là `loading`, sau đó nạp 12 nhân viên, không báo lỗi khi bọc StrictMode.
  2. Tự động gọi `signal.aborted = true` khi unmount.
  3. Bắt đúng lỗi 500 tiếng Việt và xóa lỗi, tải lại thành công khi bấm `reload()`.

### 6. Đánh giá:
- Đáp ứng chính xác yêu cầu đề bài và nguyên tắc Single Source of Truth cho State nhân viên.

### 7. Sai sót của AI (nếu có):
- Chưa phát hiện sai sót.
