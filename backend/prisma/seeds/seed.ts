import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_DEPARTMENTS = [
  { code: 'BOD', name: 'Ban Giám Đốc', description: 'Executive Board' },
  { code: 'HR', name: 'Phòng Nhân Sự', description: 'Human Resources' },
  { code: 'IT', name: 'Phòng Công Nghệ', description: 'Information Technology' },
  { code: 'ACC', name: 'Phòng Kế Toán', description: 'Accounting & Finance' },
];

const DEFAULT_ROLES = [
  { code: 'super-admin', name: 'Super Admin', description: 'Toàn quyền quản trị hệ thống' },
  { code: 'admin', name: 'Quản trị viên', description: 'Quản trị viên hệ thống' },
  { code: 'manager', name: 'Trưởng phòng', description: 'Quản lý phòng ban' },
  { code: 'staff', name: 'Nhân viên', description: 'Nhân viên chính thức' },
];

const DEFAULT_PERMISSIONS = [
  // Module Employee
  { code: 'employee:read', name: 'Xem danh sách nhân viên', module: 'employee' },
  { code: 'employee:create', name: 'Tạo mới nhân viên', module: 'employee' },
  { code: 'employee:update', name: 'Cập nhật nhân viên', module: 'employee' },
  { code: 'employee:delete', name: 'Xóa nhân viên', module: 'employee' },

  // Module Department
  { code: 'department:read', name: 'Xem danh sách phòng ban', module: 'department' },
  { code: 'department:create', name: 'Tạo mới phòng ban', module: 'department' },
  { code: 'department:update', name: 'Cập nhật phòng ban', module: 'department' },
  { code: 'department:delete', name: 'Xóa phòng ban', module: 'department' },

  // Module Role & Permission
  { code: 'role:manage', name: 'Quản lý vai trò & phân quyền', module: 'role' },
];

async function main() {
  console.log('Khởi tạo dữ liệu mẫu cho Database (Departments, Roles, Permissions)...');

  // 1. Seed Departments
  for (const dept of DEFAULT_DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: dept,
    });
  }

  // 2. Seed Roles
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  // 3. Seed Permissions
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm,
    });
  }

  console.log('Seeding hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
