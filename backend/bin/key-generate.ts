import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

function generateAppKey() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    console.error('Không tìm thấy file .env!');
    process.exit(1);
  }

  // Tạo chuỗi 32 random bytes mã hóa base64 chuẩn Laravel (base64:...)
  const randomKey = crypto.randomBytes(32).toString('base64');
  const appKey = `base64:${randomKey}`;

  let envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('APP_KEY=')) {
    // Thay thế APP_KEY cũ bằng APP_KEY mới
    envContent = envContent.replace(/^APP_KEY=.*$/m, `APP_KEY=${appKey}`);
  } else {
    // Thêm APP_KEY nếu chưa có
    envContent += `\nAPP_KEY=${appKey}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log(`Đã tạo thành công APP_KEY mới: ${appKey}`);
  console.log('File .env đã được cập nhật!');
}

generateAppKey();
