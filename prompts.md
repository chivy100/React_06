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


---

## Prompt 3 – Triển khai Custom Hook `useEmployee` (`src/hooks/useEmployee.js`)

### 1. Mục tiêu:
Xây dựng Custom Hook `useEmployee(id)` tìm kiếm thông tin một nhân viên theo `_id` từ Context Store (`useEmployeeStore`) mà không gửi thêm bất kỳ request nào lên server, đồng thời tính toán cờ `notFound` chuẩn xác.

### 2. Phân tích trước khi code:
- Không tạo thêm state nội bộ dư thừa (`useState`), mà tính toán trực tiếp từ `employees`, `loading`, `error` lấy từ `useEmployeeStore()`.
- Tìm nhân viên: `employees.find(emp => emp._id === id) || null`.
- Điều kiện `notFound`: `!loading && !error && !employee`.
- Giá trị trả về: `{ employee, loading, error, notFound }`.

### 3. Prompt đã sử dụng:
> Hãy triển khai custom hook `src/hooks/useEmployee.js`:
> 1. Nhận vào tham số `id` (chính là `_id` của nhân viên).
> 2. Lấy `employees`, `loading`, `error` từ `useEmployeeStore()` (từ `src/context/EmployeesContext.jsx`), không gọi thêm API GET riêng.
> 3. Tìm nhân viên có `_id === id` trong mảng `employees`.
> 4. Xác định `notFound = true` khi danh sách đã tải xong (!loading), không có lỗi (!error) và không có nhân viên nào mang _id đó. Đang tải thì loading là true và notFound là false.
> 5. Trả về đối tượng `{ employee, loading, error, notFound }`.

### 4. Kết quả triển khai:
- Hoàn thành `src/hooks/useEmployee.js`.
- Không có request phụ nào được gửi khi truy xuất thông tin cá nhân.

### 5. Kiểm thử:
- Lệnh chạy: `npx vitest run -t "Hook useEmployees và useEmployee"`
- Kết quả: Vượt qua test tìm nhân viên theo `_id` và xác thực cờ `notFound` với `id = "999"` sau khi tải xong. Tổng cộng 4/4 test của nhóm hook đều PASSED.

### 6. Đánh giá:
- Đảm bảo tính toán Derived State sạch sẽ, không vi phạm anti-pattern tạo state trùng lặp.

### 7. Sai sót của AI (nếu có):
- Chưa phát hiện sai sót.


---

## Prompt 4 – Triển khai Trang Danh sách `EmployeesPage` (`src/pages/EmployeesPage.jsx`)

### 1. Mục tiêu:
Xây dựng trang danh sách nhân viên kết hợp tìm kiếm theo họ tên/email, lọc theo phòng ban, phân trang và hiển thị thông báo flash khi có nhân viên bị xóa. Tất cả các thao tác lọc và phân trang thực hiện hoàn toàn ở Client trên dữ liệu đã tải và đồng bộ trực tiếp lên URL thông qua `useSearchParams`.

### 2. Phân tích trước khi code:
- Đọc query params: `q`, `department`, `page`, `deleted`.
- Chuẩn hóa:
  - `keyword = (qParam || "").trim().toLowerCase()`
  - Lọc nhân viên: khớp `keyword` với `name` hoặc `email`, đồng thời khớp `department`.
  - Phân trang: `total = filteredEmployees.length`, `totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))`.
  - `currentPage` được giới hạn an toàn trong khoảng `[1, totalPages]`, nếu parse lỗi hoặc nhỏ hơn 1 thì đưa về 1.
  - Cắt mảng: `paginatedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)`.
- Hàm `updateParams`:
  - Reset về `page = 1` khi thay đổi `q` hoặc `department`.
  - Tự động xóa tham số `deleted` khi tìm kiếm, đổi phòng ban hoặc chuyển trang.
  - Omit param nếu rỗng hoặc nếu `page === 1`.
- Trạng thái hiển thị:
  - Đang tải: `spinner-border` + `Đang tải...`.
  - Lỗi: `alert alert-danger` với `role="alert"` + Nút `Thử lại` gọi `reload()`.
  - Không có kết quả: `alert alert-info` ("Không có nhân viên phù hợp.") và 2 nút phân trang disabled.
  - Có dữ liệu: "Tổng cộng X nhân viên", `ul[aria-label="Danh sách nhân viên"]` render `li` với `key={emp._id}` bọc `EmployeeCard`, và `nav[aria-label="Phân trang"]`.

### 3. Prompt đã sử dụng:
> Hãy triển khai component `src/pages/EmployeesPage.jsx` theo đúng giao diện mẫu và yêu cầu đề bài:
> 1. Lấy dữ liệu và hàm reload từ useEmployeeStore().
> 2. Sử dụng useSearchParams để quản lý q, department, page, và deleted. Chuẩn hóa URL (không lưu param rỗng, page=1 không đưa lên URL, reset về page 1 khi search/filter, tự mất param deleted khi thao tác).
> 3. Thực hiện lọc và phân trang hoàn toàn trên client từ mảng employees.
> 4. Hiển thị đúng các trạng thái: Đang tải (spinner-border), Lỗi (alert alert-danger kèm nút Thử lại), Rỗng (Không có nhân viên phù hợp.), Danh sách nhân viên (ul với aria-label='Danh sách nhân viên', thẻ li mang key={_id} và bọc EmployeeCard), Thanh phân trang (nav với aria-label='Phân trang', ul.pagination).
> 5. Hiển thị thông báo Đã xóa nhân viên <tên>. trong phần tử role='status' nếu có param deleted.

### 4. Kết quả triển khai:
- Hoàn thiện `src/pages/EmployeesPage.jsx`.
- Đáp ứng 100% lớp CSS Bootstrap và các thuộc tính Accessibility bắt buộc (`aria-label`, `role="alert"`, `role="status"`).

### 5. Kiểm thử:
- Lệnh chạy:
  - `npx vitest run -t "Trang danh sách"`
  - `npx vitest run -t "vào ứng dụng chỉ gửi đúng một GET danh sách"`
  - `npx vitest run -t "Lỗi mạng"`
- Kết quả: Tất cả các bài test kiểm tra giao diện danh sách, phân trang, gõ tìm kiếm, đổi phòng ban, từ khóa toàn dấu cách, số trang trên URL không hợp lệ và nút Thử lại khi có lỗi đều PASSED hoàn hảo.

### 6. Đánh giá:
- Xử lý mượt mà trên Client, tiết kiệm tối đa quota 100 requests của crudcrud.

### 7. Sai sót của AI (nếu có):
- Chưa phát hiện sai sót.


---

## Prompt 5 – Triển khai Trang Chi tiết và Xóa nhân viên `EmployeeDetailPage` (`src/pages/EmployeeDetailPage.jsx`)

### 1. Mục tiêu:
Hiển thị toàn bộ thông tin chi tiết của một nhân viên dựa vào `_id` lấy từ đường dẫn URL `/employees/:id` thông qua hook `useEmployee(id)`. Đồng thời cung cấp nút "Xóa nhân viên" thực hiện xóa bản ghi qua API, xử lý hiệu ứng loading khi xóa và điều hướng kèm thông báo thành công.

### 2. Phân tích trước khi code:
- Đọc tham số `id` từ `useParams()`.
- Lấy `{ employee, loading, error, notFound }` từ `useEmployee(id)`.
- Lấy `removeEmployee` từ `useEmployeeStore()`.
- Trạng thái UI:
  - Nếu `loading`: hiển thị `spinner-border` và chữ "Đang tải...".
  - Nếu `notFound`: hiển thị thông báo "Không tìm thấy nhân viên <id>" trong thẻ có `role="alert"` và link quay lại danh sách.
  - Nếu có `error`: hiển thị thông báo lỗi trong `role="alert"`.
- Thao tác xóa:
  - State cục bộ `deleting` và `deleteError`.
  - Khi người dùng click "Xóa nhân viên", chuyển nút sang trạng thái `disabled` với nhãn "Đang xóa..." kèm spinner.
  - Gọi `await removeEmployee(employee._id)`.
  - Thành công: `navigate('/?deleted=' + encodeURIComponent(employee.name))`.
  - Thất bại: ghi nhận lỗi từ `getErrorMessage(err)` vào `deleteError`, phục hồi nút bấm.

### 3. Prompt đã sử dụng:
> Hãy triển khai component `src/pages/EmployeeDetailPage.jsx`:
> 1. Lấy id từ useParams(), gọi useEmployee(id) và lấy removeEmployee từ useEmployeeStore().
> 2. Xử lý các trạng thái: Đang tải (Đang tải...), notFound (hiển thị 'Không tìm thấy nhân viên <id>' trong role='alert'), Lỗi khác (hiển thị thông báo trong role='alert').
> 3. Khi có dữ liệu: Hiển thị đầy đủ thông tin (họ tên, StatusBadge, chức danh, phòng ban, email, lương VND bằng formatVnd, thành phố, ngày vào làm bằng formatDate), link Sửa (/employees/:id/edit), link Quay lại danh sách (/), nút Xóa (btn btn-danger).
> 4. Nút Xóa nhân viên: khi click gọi removeEmployee(id). Trong lúc chờ, nút hiện 'Đang xóa...' và bị vô hiệu hóa. Nếu thành công, điều hướng về /?deleted=${encodeURIComponent(name)}. Nếu thất bại, ở lại trang, hiện lỗi trong role='alert' và phục hồi nút Xóa dùng lại được.

### 4. Kết quả triển khai:
- Hoàn thiện `src/pages/EmployeeDetailPage.jsx`.
- Sử dụng đầy đủ các component mã nền `StatusBadge` và các hàm tiện ích `formatVnd`, `formatDate`.

### 5. Kiểm thử:
- Lệnh chạy: `npx vitest run -t "Trang chi tiết và xóa nhân viên"`
- Kết quả: Vượt qua toàn bộ các ca kiểm thử dành cho trang chi tiết và nút xóa (hiển thị dữ liệu, định dạng tiền tệ, ngày tháng, trạng thái xóa, hủy xóa khi server lỗi 500 và điều hướng thành công).

### 6. Đánh giá:
- Đảm bảo tính nhất quán của giao diện và luồng xử lý bất đồng bộ an toàn.

### 7. Sai sót của AI (nếu có):
- Chưa phát hiện sai sót.
