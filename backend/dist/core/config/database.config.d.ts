export interface DatabaseConnectionOptions {
    driver: string;
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    [key: string]: any;
}
declare const _default: (() => {
    default: string;
    connections: Record<string, DatabaseConnectionOptions>;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    default: string;
    connections: Record<string, DatabaseConnectionOptions>;
}>;
export default _default;
