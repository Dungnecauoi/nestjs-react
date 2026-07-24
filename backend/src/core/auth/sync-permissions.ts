import { PrismaClient } from '@prisma/client';
import { ALL_SYSTEM_POLICIES } from './policies';

const prisma = new PrismaClient();

export async function syncPermissionsToDatabase() {
  console.log('🔄 --- Start Syncing Modular System Policies to MySQL Database ---');

  // 1. Ensure Super Admin Role exists
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super-admin' },
    update: { name: 'Quản Trị Viên Tối Cao (Super Admin)' },
    create: {
      code: 'super-admin',
      name: 'Quản Trị Viên Tối Cao (Super Admin)',
      description: 'Quản trị viên có đầy đủ mảng quyền hạn kiểm soát toàn hệ thống',
    },
  });

  let syncedCount = 0;

  // 2. Upsert each permission from Modular Policy Directory into MySQL
  for (const permPolicy of ALL_SYSTEM_POLICIES) {
    const permission = await prisma.permission.upsert({
      where: { code: permPolicy.code },
      update: {
        name: permPolicy.name,
        module: permPolicy.module,
        description: permPolicy.description,
      },
      create: {
        code: permPolicy.code,
        name: permPolicy.name,
        module: permPolicy.module,
        description: permPolicy.description,
      },
    });

    // 3. Automatically link all permissions to Super Admin role
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });

    syncedCount++;
    console.log(` ✅ Synced Permission: [${permission.code}] - ${permission.name}`);
  }

  console.log(`🎉 Successfully Synced ${syncedCount} Atomic Action Permissions to Database and Super Admin Role!`);
}

if (require.main === module) {
  syncPermissionsToDatabase()
    .catch((err) => {
      console.error('❌ Error syncing permissions:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
