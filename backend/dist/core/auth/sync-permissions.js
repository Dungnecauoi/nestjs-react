"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPermissionsToDatabase = syncPermissionsToDatabase;
const client_1 = require("@prisma/client");
const policies_1 = require("./policies");
const prisma = new client_1.PrismaClient();
async function syncPermissionsToDatabase() {
    console.log('🔄 --- Start Syncing Modular System Policies to MySQL Database ---');
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
    for (const permPolicy of policies_1.ALL_SYSTEM_POLICIES) {
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
//# sourceMappingURL=sync-permissions.js.map