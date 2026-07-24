import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly configService;
    private readonly i18n;
    constructor(configService: ConfigService, i18n: I18nService);
    validate(req: Request, payload: any): Promise<{
        id: any;
        email: any;
        roles: any;
        permissions: any;
        refreshToken: any;
    }>;
}
export {};
