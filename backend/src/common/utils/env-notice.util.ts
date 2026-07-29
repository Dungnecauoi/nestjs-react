/**
 * Hiển thị thông báo hướng dẫn cấu hình môi trường (.env) thân thiện kiểu Laravel CLI
 * khi phát hiện thiếu biến môi trường quan trọng hoặc dùng key mặc định không an toàn.
 */
export function printMissingEnvNotice(
  varName: string,
  defaultValueHint: string,
  description: string,
): never {
  const border = '════════════════════════════════════════════════════════════════════════════';
  const msg = `
${border}
❌ THIẾU CẤU HÌNH BẢO MẬT BẮT BUỘC (MISSING ENVIRONMENT SECURITY KEY)
${border}

⚠️  Biến môi trường: ${varName} chưa được cấu hình hoặc đang bị comment (#)!
ℹ️  Mô tả: ${description}

👉 HƯỚNG DẪN KHẮC PHỤC BẰNG 2 BƯỚC:
   1. Mở tập tin cấu hình: backend/.env
   2. Tìm và bỏ dấu comment (#) hoặc thêm dòng cấu hình bên dưới:

      ${varName}=${defaultValueHint}

${border}
`;
  console.error(msg);
  throw new Error(`[CONFIG ERROR] Thiếu cấu hình ${varName} trong backend/.env. Vui lòng xem hướng dẫn ở trên.`);
}
