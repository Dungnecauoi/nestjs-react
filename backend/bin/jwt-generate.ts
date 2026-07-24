import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

function generateJwtSecrets() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    console.error('Lỗi: Không tìm thấy file .env!');
    process.exit(1);
  }

  // Generate cryptographically secure 64-byte hex strings
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update JWT_SECRET
  if (/^JWT_SECRET=/m.test(envContent)) {
    envContent = envContent.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${jwtSecret}`);
  } else {
    envContent += `\nJWT_SECRET=${jwtSecret}\n`;
  }

  // Update JWT_REFRESH_SECRET
  if (/^JWT_REFRESH_SECRET=/m.test(envContent)) {
    envContent = envContent.replace(/^JWT_REFRESH_SECRET=.*$/m, `JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
  } else {
    envContent += `\nJWT_REFRESH_SECRET=${jwtRefreshSecret}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('====================================================');
  console.log('✅ ĐÃ TẠO MỚI THÀNH CÔNG BỘ KHÓA BẢO MẬT JWT AN TOÀN CAO:');
  console.log(`🔑 JWT_SECRET=${jwtSecret}`);
  console.log(`🔄 JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
  console.log('====================================================');
  console.log('🎉 Đã cập nhật tự động vào tệp .env!');
}

generateJwtSecrets();
