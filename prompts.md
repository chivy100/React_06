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
