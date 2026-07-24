export declare class TwoFactorService {
    private base32Chars;
    generateSecret(length?: number): string;
    generateOtpauthUrl(email: string, secret: string, issuer?: string): string;
    verifyCode(secret: string, token: string, window?: number): boolean;
    private generateTotp;
    private base32Decode;
}
