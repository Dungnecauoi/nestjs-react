"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let TwoFactorService = class TwoFactorService {
    base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    generateSecret(length = 20) {
        const randomBytes = crypto.randomBytes(length);
        let result = '';
        for (let i = 0; i < randomBytes.length; i++) {
            result += this.base32Chars[randomBytes[i] % this.base32Chars.length];
        }
        return result;
    }
    generateOtpauthUrl(email, secret, issuer = 'ECOMCX ERP') {
        return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    }
    verifyCode(secret, token, window = 1) {
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
    generateTotp(secret, counter) {
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
        const code = ((digest[offset] & 0x7f) << 24) |
            ((digest[offset + 1] & 0xff) << 16) |
            ((digest[offset + 2] & 0xff) << 8) |
            (digest[offset + 3] & 0xff);
        const otp = (code % 1000000).toString();
        return otp.padStart(6, '0');
    }
    base32Decode(base32Str) {
        let bits = 0;
        let value = 0;
        const output = [];
        const cleanStr = base32Str.toUpperCase().replace(/=+$/, '');
        for (let i = 0; i < cleanStr.length; i++) {
            const idx = this.base32Chars.indexOf(cleanStr[i]);
            if (idx === -1)
                continue;
            value = (value << 5) | idx;
            bits += 5;
            if (bits >= 8) {
                output.push((value >>> (bits - 8)) & 0xff);
                bits -= 8;
            }
        }
        return Buffer.from(output);
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)()
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map