# EcomCX Core ERP System (NestJS + React Monorepo)

Hệ thống quản trị doanh nghiệp **EcomCX Core ERP** chuẩn Enterprise, được thiết kế theo mô hình Monorepo hiện đại với hiệu năng cao, bảo mật đa tầng, và khả năng mở rộng linh hoạt.

---

## Công Nghệ Sử Dụng (Tech Stack)

### Backend Framework & Services (`/backend`)
- **Core Framework**: [NestJS 11](https://nestjs.com/) (TypeScript)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) (MySQL Database)
- **Authentication & Security**:
  - Access Token lưu thuần trong RAM (Zustand Store)
  - Refresh Token mã hóa lưu trong HttpOnly Cookie (`ecomcx_session`)
  - Quản lý phiên đa thiết bị (Multi-Device Session Tracking) qua bảng `user_sessions`
- **Authorization & Policy**:
  - Atomic Action Permissions (`domain:action`)
  - Modular Policy System (`/backend/src/core/auth/policies/`)
  - Auto Sync Permissions CLI
- **Caching & Async Queue**: Redis, Cache Manager, [BullMQ](https://docs.bullmq.io/)
- **Documentation & i18n**: NestJS Swagger (`/api/docs`), `nestjs-i18n` (Việt / Anh)
- **Real-time & Media**: Socket.IO, AWS S3 Client / Local File Storage

### Frontend Admin App (`/admin`)
- **Core Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- **UI Components & Icons**: [Ant Design v5](https://ant.design/), `@ant-design/icons`, [Lucide React](https://lucide.dev/)
- **State Management & Async Data**:
  - [Zustand](https://zustand-demo.pmnd.rs/) (Auth & App UI State)
  - [TanStack React Query v5](https://tanstack.com/query/latest) (Server Data Fetching & Caching)
- **Styling & Responsive**: TailwindCSS v4, CSS Variables, Full Dark/Light/System Theme Switching
- **Internationalization**: `react-i18n` / `i18next` (Full i18n 100% song ngữ Việt - Anh)

---

## Cấu Trúc Dự Án (Project Structure)

```text
nestjs-react/
├── admin/                  # Giao diện Quản trị React 19 + Vite + Ant Design
│   ├── src/
│   │   ├── api/            # API Clients & Interceptors
│   │   ├── components/     # Reusable UI Components & Protection (<Can />)
│   │   ├── locales/        # Song ngữ Frontend (vi.ts, en.ts)
│   │   ├── pages/          # Các trang quản trị (Dashboard, Users, Roles, Media,...)
│   │   ├── stores/         # State Zustand (Auth, Theme)
│   │   └── types/          # TypeScript Type Definitions
│   └── package.json
│
├── backend/                # Server NestJS 11 API Gateway & Business Logic
│   ├── prisma/             # Schema MySQL & Database Seeders
│   ├── bin/                # CLI Tools (Make CRUD, Remove CRUD, Key Generate)
│   ├── src/
│   │   ├── core/           # Auth, Guards, Policies, Interceptors, Storage, i18n
│   │   ├── modules/        # Business Modules (User, Role, Permission, Media, Department,...)
│   │   └── i18n/           # Song ngữ Backend Exception/Messages (vi, en)
│   └── package.json
│
├── package.json            # Root Monorepo Workspaces & Concurrently Scripts
├── AGENTS.md               # Quy chuẩn phát triển & Manifesto dự án
└── README.md               # Tài liệu dự án
```

---

## Tính Năng & Kiến Trúc Nổi Bật

1. **Hệ Thống Phân Quyền (Atomic Action Permissions)**:
   - Phân quyền chi tiết dạng `domain:action` (ví dụ: `user:read`, `user:create`, `role:write`, `media:create`).
   - Tự động quét và đồng bộ danh sách quyền mới vào cơ sở dữ liệu qua lệnh `npm run sync:permissions`.
   - UI tự động ẩn/hiện nút bấm dựa theo quyền truy cập của người dùng với component `<Can permission="..." />`.

2. **Phân Trang & Lọc Dữ Liệu Từ Server (Server-Side Pagination & Search)**:
   - 100% các bảng dữ liệu (Users, Roles, Departments, Media) đều thực hiện truy vấn trực tiếp từ MySQL Database (`page`, `limit`, `search`, `sortBy`).

3. **Trình Sinh Mã CRUD Tự Động (Automated CRUD Generator)**:
   - CLI tạo nhanh Module Backend trọn gói (Controller, Service, Module, DTOs, Policy) chỉ với 1 lệnh bấm.

4. **100% Đa Ngôn Ngữ (i18n Mandatory)**:
   - Đội ngũ phát triển và người dùng dễ dàng chuyển đổi ngôn ngữ Việt - Anh tức thì ở cả Client và Server.

5. **Giao Diện Thích Ứng & Dark Mode**:
   - Tùy chỉnh màu sắc thương hiệu, giao diện tối/sáng linh hoạt và tối ưu trải nghiệm trên mọi kích thước màn hình (Mobile, Tablet, Desktop).

---

## Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu Tiền Đề (Prerequisites)
- **Node.js**: `>= 20.x`
- **npm**: `>= 10.x`
- **MySQL Database**: Server MySQL 8.0+
- **Redis Server**: `>= 6.x` (Dùng cho Caching & BullMQ Queue)

### 2. Cài Đặt Dependencies

Tại thư mục gốc dự án:
```bash
npm install
```

### 3. Cấu Hinh Biến Môi Trường (Environment Variables)

Tạo file `.env` tại thư mục `backend/`:
```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/ecomcx_erp"

JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRATION="15m"
REFRESH_TOKEN_SECRET="your_refresh_secret_key"
REFRESH_TOKEN_EXPIRATION="7d"

REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 4. Khởi Tạo Cơ Sở Dữ Liệu (Database Migration & Seeding)

Di chuyển vào thư mục `backend` và chạy migration:
```bash
cd backend

# Khởi tạo bảng dữ liệu MySQL
npx prisma migrate dev --name init

# Gieo dữ liệu mẫu (Seeder)
npm run db:seed

# Đồng bộ danh sách quyền hạn nguyên tử vào DB
npm run sync:permissions
```

### 5. Chạy Ứng Dụng (Development Mode)

Chạy đồng thời cả Backend (NestJS) và Frontend (React Admin) tại root:
```bash
npm run dev:all
```

Hoặc chạy từng ứng dụng riêng biệt:
```bash
# Chạy Backend (Port 3000)
npm run dev:backend

# Chạy Frontend Admin (Port 5173)
npm run dev:admin
```

---

## Danh Sách Lệnh CLI (CLI Reference)

### Lệnh Root Monorepo
| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev:all` | Chạy song song dev server Backend và Admin Frontend |
| `npm run dev:backend` | Chạy dev server NestJS Backend |
| `npm run dev:admin` | Chạy dev server React Admin Frontend |
| `npm run build:all` | Biên dịch toàn bộ dự án (Backend & Admin) |

### Lệnh Backend (`cd backend`)
| Lệnh | Mô tả |
| :--- | :--- |
| `npm run sync:permissions` | Tự động đồng bộ các Policy permissions mới vào DB |
| `npm run make:crud -- --name=<module>` | Tự động sinh mã CRUD module mới |
| `npm run remove:crud -- --name=<module>` | Xóa module CRUD đã sinh |
| `npm run prisma:migrate` | Chạy migration Prisma schema |
| `npm run db:seed` | Nạp dữ liệu mẫu ban đầu |

---

## API Documentation

Sau khi khởi chạy Backend thành công, bạn có thể truy cập tài liệu Swagger API Docs tại:
**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## License

Dự án thuộc bản quyền hệ thống **EcomCX Core ERP**. All Rights Reserved.
