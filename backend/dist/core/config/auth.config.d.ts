declare const _default: (() => {
    driver: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
    cookieName: string;
    bcryptRounds: number;
    sessionDriver: string;
    sessionLifetime: number;
    enableCsrf: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    driver: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
    cookieName: string;
    bcryptRounds: number;
    sessionDriver: string;
    sessionLifetime: number;
    enableCsrf: boolean;
}>;
export default _default;
