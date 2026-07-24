import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Vui lòng cung cấp tên module cần xóa! Ví dụ: npm run remove:crud employee');
  process.exit(1);
}

const lowercaseName = moduleName.toLowerCase();
const targetDir = path.join(__dirname, `../src/modules/${lowercaseName}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Module "${lowercaseName}" không tồn tại tại: ${targetDir}`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
console.log(`✨ Đã xóa hoàn toàn CRUD Module "${lowercaseName}" tại: src/modules/${lowercaseName}`);
