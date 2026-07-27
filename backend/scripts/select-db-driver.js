#!/usr/bin/env node
// Chọn schema Prisma theo DB driver mong muốn (mysql/postgresql/sqlite) — copy đè lên
// prisma/schema.prisma. Đổi driver là quyết định lúc setup/deploy, không phải runtime toggle
// (Prisma bắt buộc datasource.provider cố định lúc `prisma generate`).
//
// Dùng: node scripts/select-db-driver.js <mysql|postgresql|sqlite>
// Hoặc qua npm script: npm run db:use:postgresql

const fs = require('fs');
const path = require('path');

const DRIVERS = ['mysql', 'postgresql', 'sqlite'];
const driver = process.argv[2];

if (!driver || !DRIVERS.includes(driver)) {
  console.error(`Vui lòng chọn 1 driver hợp lệ: ${DRIVERS.join(', ')}`);
  console.error(`Ví dụ: node scripts/select-db-driver.js postgresql`);
  process.exit(1);
}

const prismaDir = path.join(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const sourceSchema = path.join(prismaDir, `schema.${driver}.prisma`);

if (!fs.existsSync(sourceSchema)) {
  console.error(`Không tìm thấy ${sourceSchema}`);
  process.exit(1);
}
fs.copyFileSync(sourceSchema, targetSchema);

console.log(`Đã chọn driver: ${driver}`);
console.log(`prisma/schema.prisma hiện dùng datasource.provider = "${driver}"`);
console.log(
  `Nhớ cập nhật DATABASE_URL trong .env cho đúng định dạng của "${driver}", rồi chạy` +
    ` "npx prisma migrate dev" để tạo migration history mới (migration của driver khác` +
    ` không dùng chung được).`,
);
