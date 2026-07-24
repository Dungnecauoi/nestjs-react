declare const _default: (() => {
    mailer: string;
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    fromAddress: string;
    fromName: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    mailer: string;
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    fromAddress: string;
    fromName: string;
}>;
export default _default;
