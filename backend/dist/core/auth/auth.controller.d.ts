import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    private getCookieName;
    private getCookieMaxAge;
    private getCookieOptions;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
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
    authenticate2FA(body: {
        preAuthToken: string;
        otpCode: string;
    }, req: Request, res: Response): Promise<{
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
    generate2FASecret(body: {
        email: string;
    }): Promise<{
        secret: string;
        otpAuthUrl: string;
    }>;
    turnOn2FA(body: {
        email: string;
        otpCode: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    turnOff2FA(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(user: any, req: Request, res: Response): Promise<{
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
    logout(req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(user: any): {
        message: string;
        data: any;
    };
}
