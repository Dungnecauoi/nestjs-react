# ECOMCX ERP DEVELOPMENT MANIFESTO & CORE AGENT RULES

Mọi câu trả lời, đoạn code phát triển hoặc chỉnh sửa trong hệ thống Core EcomCX ERP BẮT BUỘC phải tuân thủ 100% các nguyên tắc kiến trúc dưới đây:

---

## 1. 🌐 QUY TẮC ĐA NGÔN NGỮ (100% i18n Mandatory - Both Backend & Frontend)

### Frontend (Admin React App):
- **100% KHÔNG FIX CỨNG CHỮ HOẶC DÙNG FALLBACK STRING** (như `'Admin System'`, `'admin@ecomcx.com'`, `'SUPER_ADMIN'`). Nếu RAM/Store chưa có dữ liệu, hiển thị `''`.
- Mọi tiêu đề, nút bấm, placeholder, thông báo toast, tooltip, radio button, header bảng PHẢI dùng `t(...)` và được khai báo song ngữ đầy đủ tại `admin/src/locales/vi.ts` và `admin/src/locales/en.ts`.

### Backend (NestJS API):
- Tất cả thông báo ngoại lệ (`Exceptions`), kết quả trả về (`Messages`), validation DTO PHẢI dùng `nestjs-i18n` (`this.i18n.t('messages.xxx', { lang })`).

---

## 2. 🔐 QUY TẮC PHÂN QUYỀN HẠN & POLICY (Atomic Action Permissions & Policies)

- **Định Danh Quyền Hạn**: Quyền hạn **CHỈ CHỨA CÁC HÀNH ĐỘNG NGUYÊN TỬ (`domain:action`)** (Ví dụ: `user:read`, `user:create`, `user:write`, `user:delete`, `media:create`...). KHÔNG ĐƯỢC ĐẶT TÊN CHUNG CHUNG như *"Toàn quyền hệ thống"*.
- **Modular Policy Directory**: Mỗi module mới tạo ra PHẢI khai báo tệp Policy tương ứng tại `backend/src/core/auth/policies/<module>.policy.ts` và export tại `policies/index.ts`.
- **Tự Động Sync Permissions**: Mỗi khi tạo API mới hoặc bổ sung quyền mới, **PHẢI CHẠY LỆNH**:
  ```bash
  npm run sync:permissions
  ```
  để đồng bộ toàn bộ mảng Quyền Hạn mới vào MySQL Database và tự động gán cho `super-admin` role.
- **Bảo Vệ API Trực Tiếp**: Mỗi Route Controller / Endpoint PHẢI dùng `@UseGuards(JwtAuthGuard, PermissionGuard)` và `@RequirePermissions('domain:action')`.
- **Ẩn Nút UI Theo Quyền**: Trên Frontend, mọi nút hành động (Thêm, Sửa, Xóa) BẮT BUỘC lồng trong `<Can permission="domain:action">` để ẩn các thao tác người dùng không có quyền.

---

## 3. 🗄️ QUY TẮC THAY ĐỔI CƠ SỞ DỮ LIỆU (Prisma Database Migration Mandate)

- Mỗi khi THÊM, SỬA, XÓA model hoặc bất kỳ trường (`field`) nào trong `backend/prisma/schema.prisma`, **BẮT BUỘC PHẢI CHẠY MIGRATION**:
  ```bash
  cd backend && npx prisma migrate dev --name <migration_name>
  ```
  để giữ cho cơ sở dữ liệu MySQL đồng bộ 100% với schema và tự động sinh lại `@prisma/client`.

---

## 4. 🔑 QUY TẮC BẢO MẬT & SESSION (Pure RAM AccessToken & HttpOnly Cookie)

- **AccessToken**: Lưu thuần trong RAM (`useAuthStore` zustand), KHÔNG lưu vào `localStorage` hay `sessionStorage`.
- **RefreshToken**: Lưu vào HttpOnly Cookie `ecomcx_session`, giới hạn `path: '/api/auth'`.
- **Đa Thiết Bị (Multi-Device Sessions)**: Mọi phiên đăng nhập lưu bcrypt hash vào bảng `user_sessions` kèm User-Agent và IP Address để cho phép đăng nhập đa thiết bị và thu hồi phiên theo thiết bị.
- **401 vs 403 Standard**: 401 Unauthorized kích hoạt silent refresh hoặc logout. 403 Forbidden giữ nguyên login state và điều hướng sang trang 403 Access Denied (`Forbidden.tsx`).

---

## 5. 🎨 QUY TẮC GIAO DIỆN & NAVIGATION (UI Aesthetics & Active Navigation State)

- **Icon Compatibility**: 100% dùng icon chuẩn `@ant-design/icons` trong các thành phần Ant Design (`Tag`, `Button`, `Table`). KHÔNG lồng icon Lucide vào `Tag` của Ant Design để tránh lỗi glyph unicode (`♂`).
- **Sidebar Active Tracking**: Khi người dùng vào các đường dẫn con (`/admin/users/create`, `/admin/users/:id/edit`), Sidebar **BẮT BUỘC PHẢI GIỮ NGUYÊN TRẠNG THÁI ACTIVE / NỔI ĐỎ** ở mục menu cha (`Quản Lý Người Dùng`).
- **Bảng Dữ Liệu Cột Thao Tác (Actions Column)**: Cột thao tác trong Table xếp hàng ngang Flex (`flexWrap: 'nowrap'`, `gap: 6px`) kèm `<Tooltip>` giúp giao diện gọn gàng, sắc nét.
- **Tương Thích Dark Mode**: 100% thành phần UI phải sử dụng màu sắc thích ứng từ `useTheme()` context và Token của Ant Design.

---

## 6. ⚡ QUY TẮC QUẢN LÝ TRẠNG THÁI & DỮ LIỆU ASYNC (React Query & Zustand)

- **React Query Standard**: Mọi thao tác tải danh sách (fetch data) trên Frontend BẮT BUỘC sử dụng `@tanstack/react-query` (`useQuery`, `refetch`, `isLoading`, `isRefetching`) với `enabled: isAuthenticated`.
- **Đồng Bộ Dữ Liệu (Refetch / Invalidate)**: Sau khi thực hiện các thao tác Mutation (Thêm, Sửa, Xóa), BẮT BUỘC gọi `refetch()` hoặc `queryClient.invalidateQueries(...)` để cập nhật lại giao diện tức thì.

---

## 7. 📘 QUY TẮC SWAGGER DOCUMENTATION (NestJS API Docs)

- Tất cả Controller mới tạo BẮT BUỘC gắn mảng Decorator Swagger:
  - `@ApiTags('Domain Name')`
  - `@ApiBearerAuth()`
  - `@ApiOperation({ summary: 'Mô tả ngắn gọn chức năng API' })`

---

## 8. 🛡️ QUY TẮC DTO & VALIDATION (Backend Input Validation)

- Tất cả dữ liệu gửi lên từ Client BẮT BUỘC phải qua DTO kiểm định (`class-validator` & `class-transformer`): `@IsString()`, `@IsEmail()`, `@IsOptional()`, `@IsArray()`.
- Bật `whitelist: true` và `transform: true` trong ValidationPipe toàn cục để loại bỏ các trường rác không khai báo.

---

## 9. 📱 QUY TẮC RESPONSIVE & CHUẨN BẢNG DỮ LIỆU (Mobile First & Enterprise Table Rules)

- **Ưu Tiên Responsive (Mobile First)**: Tất cả màn hình UI (Dashboard, Forms, Grids, Modals) PHẢI sử dụng Ant Design `Row`/`Col` nén đáp ứng (`xs={24}`, `md={12}`, `lg={8}`) để hiển thị hoàn hảo trên màn hình di động, máy tính bảng và desktop.
- **Ghim Cột Bảng (Fixed Columns)**: Mọi bảng dữ liệu Ant Design Table BẮT BUỘC:
  - **Cột Đầu Tiên (Tên/Mã quan trọng)**: Cố định bên trái (`fixed: 'left'`).
  - **Cột Thao Tác (Actions)**: Cố định bên phía phải (`fixed: 'right'`).
- **Kế Thừa Scroll & Sticky Header/Footer**: Mọi Table PHẢI khai báo `scroll={{ x: <width> }}` (ví dụ `x: 900` hoặc `x: 1100`) và `pagination={{ showSizeChanger: true }}` giữ cố định header/footer giúp trải nghiệm cuộn mượt mà trên thiết bị di động.

---

## 10. 🎨 QUY TẮC LINH HOẠT THEME & TOKENS (Dynamic Theme Switching & Design Tokens)

- **Đồng Bộ Ant Design Token & TailWind/CSS Variables**: Tất cả thành phần UI (Màu nền Card, Màu chữ, Border, Accent Colors) BẮT BUỘC kế thừa từ `useTheme()` context (`isDark`, `accentColor`, `layoutPosition`) và Token từ Ant Design `theme.useToken()`.
- **Tương Thích Đổi Theme Động**: KHÔNG fix cứng các mã màu tĩnh như `#ffffff` hay `#000000` trực tiếp trên container style chính; PHẢI sử dụng màu thích ứng hoặc token để giao diện chuyển đổi giữa `Light Mode`, `Dark Mode`, `System Mode` và các tông màu thương hiệu một cách tức thì và mượt mà bất cứ lúc nào.

---

## 11. 🚀 QUY TẮC PHÂN TRANG & LỌC TÌM KIẾM TỪ SERVER (Server-Side Pagination, Searching & Filtering Mandate)

- **100% Phân Trang & Lọc Từ Backend**: Tất cả tính năng Bảng Dữ Liệu (Table), Danh Sách (Lists), và Tìm Kiếm (Search) BẮT BUỘC thực hiện truy vấn và phân trang trực tiếp từ Backend SQL Database (`page`, `limit`, `search`, `sortBy`, `sortOrder`, `filters`).
- **Nghiêm Cấm Lọc Dữ Liệu Ở Frontend**: KHÔNG ĐƯỢC fetch toàn bộ dữ liệu về RAM trình duyệt rồi tự `.filter()` hoặc tự chia trang ở Client. Mọi thao tác đổi trang, thay đổi từ khóa tìm kiếm hoặc lọc điều kiện PHẢI gửi Query Params lên NestJS API và nhận về dữ liệu phân trang chuẩn `{ data: [...], meta: { page, limit, total, totalPages } }`.

---

## 12. 🔗 QUY TẮC ĐỒNG BỘ DỮ LIỆU FRONTEND & BACKEND (Single Source of Truth & Zero Dummy UI Mandate)

- **Đồng Bộ 100% Data Contract**: Mọi thành phần Giao diện Frontend (Form, Modal, Table, Types, APIs) BẮT BUỘC phải bám sát 100% theo đúng cấu trúc DTO, Model Prisma và Endpoints mà NestJS Backend định nghĩa.
- **Nghiêm Cấm Tạo UI Bừa / Mock Data Rác**: KHÔNG ĐƯỢC tự ý sáng tác các trường dữ liệu giả (mock data), các nút bấm không có API tương ứng, hoặc viết lệch tên thuộc tính giữa Frontend và Backend. Mọi tính năng trên UI đều phải được hỗ trợ đầy đủ từ Backend API thực tế.
