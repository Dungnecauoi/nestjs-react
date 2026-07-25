import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function deriveKey(appKey: string): Buffer {
  return crypto.createHash('sha256').update(appKey).digest();
}

export function encrypt(plainText: string, appKey: string): string {
  const key = deriveKey(appKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(cipherText: string, appKey: string): string {
  const [ivHex, authTagHex, dataHex] = cipherText.split(':');
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('Chuỗi mã hoá không hợp lệ');
  }

  const key = deriveKey(appKey);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
