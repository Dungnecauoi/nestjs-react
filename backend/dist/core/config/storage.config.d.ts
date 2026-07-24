declare const _default: (() => {
    disk: string;
    localUploadDir: string;
    aws: {
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        region: string;
        bucket: string | undefined;
        usePathStyle: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    disk: string;
    localUploadDir: string;
    aws: {
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        region: string;
        bucket: string | undefined;
        usePathStyle: boolean;
    };
}>;
export default _default;
