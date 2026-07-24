import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../database/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { LoginDto } from './dto/login.dto';
interface SessionMeta {
    userAgent?: string;
    ipAddress?: string;
    refreshToken?: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly i18n;
    private readonly prisma;
    private readonly twoFactorService;
    private readonly userIncludeRelations;
    constructor(jwtService: JwtService, configService: ConfigService, i18n: I18nService, prisma: PrismaService, twoFactorService: TwoFactorService);
    private extractUserPermissionsAndRoles;
    login(dto: LoginDto, meta?: SessionMeta): Promise<{
        isTwoFactorRequired: boolean;
        preAuthToken: string;
        message: string;
    } | {
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        isTwoFactorRequired: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            roles: any;
            permissions: any[];
            isTwoFactorEnabled: false;
        };
        preAuthToken?: undefined;
        message?: undefined;
    }>;
    authenticate2FA(preAuthToken: string, otpCode: string, meta?: SessionMeta): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            name: string;
            email: string;
            roles: any;
            permissions: any[];
            isTwoFactorEnabled: boolean;
        };
    }>;
    generate2FASecret(email: string): Promise<{
        secret: string;
        otpAuthUrl: string;
    }>;
    turnOn2FA(email: string, otpCode: string): Promise<{
        success: boolean;
        message: string;
    }>;
    turnOff2FA(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(user: any, meta?: SessionMeta): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            name: string;
            email: string;
            roles: any;
            permissions: any[];
            isTwoFactorEnabled: boolean;
        };
    }>;
    logoutSession(userId: string, refreshToken?: string): Promise<void>;
    private generateTokens;
}
export {};
