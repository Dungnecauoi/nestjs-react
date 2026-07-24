import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_SYSTEM_POLICIES } from '../src/core/auth/policies';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Atomic Action Permissions & Roles in MySQL ---');

  // 1. Seed all atomic action permissions from Modular Policies Directory
  const createdPermissions = [];
  for (const perm of ALL_SYSTEM_POLICIES) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: perm,
    });
    createdPermissions.push(p);
  }

  // 2. Seed Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super-admin' },
    update: { name: 'Quản Trị Viên Tối Cao (Super Admin)' },
    create: {
      code: 'super-admin',
      name: 'Quản Trị Viên Tối Cao (Super Admin)',
      description: 'Quản trị viên có đầy đủ mảng quyền hạn kiểm soát toàn hệ thống',
    },
  });

  // 3. Link Super Admin Role -> All Atomic Action Permissions
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      },
    });
  }

  // 4. Seed Real Super Admin User
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ecomcx.com' },
    update: {
      name: 'Super Admin System',
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: 'admin@ecomcx.com',
      name: 'Super Admin System',
      password: hashedPassword,
      isActive: true,
    },
  });

  // 5. Link Super Admin User -> Super Admin Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('Successfully seeded Atomic Action Permissions from Modular Policies Directory and linked to Super Admin in MySQL!');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
