import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  // Generate Base32 Secret Key for TOTP
  generateSecret(length: number = 20): string {
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < randomBytes.length; i++) {
      result += this.base32Chars[randomBytes[i] % this.base32Chars.length];
    }
    return result;
  }

  // Generate OTPAuth URL for Google Authenticator QR Code
  generateOtpauthUrl(
    email: string,
    secret: string,
    issuer: string = 'ECOMCX ERP',
  ): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }

  // Verify 6-digit TOTP OTP Token using HMAC-SHA1
  verifyCode(secret: string, token: string, window: number = 1): boolean {
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      return false;
    }

    const counter = Math.floor(Date.now() / 1000 / 30);
    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
      const generatedCode = this.generateTotp(secret, counter + errorWindow);
      if (generatedCode === token) {
        return true;
      }
    }
    return false;
  }

  private generateTotp(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      buffer[7 - i] = counter & 0xff;
      counter = counter >> 8;
    }

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const otp = (code % 1000000).toString();
    return otp.padStart(6, '0');
  }

  private base32Decode(base32Str: string): Buffer {
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    const cleanStr = base32Str.toUpperCase().replace(/=+$/, '');
    for (let i = 0; i < cleanStr.length; i++) {
      const idx = this.base32Chars.indexOf(cleanStr[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return Buffer.from(output);
  }
}
