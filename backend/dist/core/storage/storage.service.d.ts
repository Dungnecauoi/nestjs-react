import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly configService;
    private disk;
    private s3Client?;
    constructor(configService: ConfigService);
    static getMulterConfig(uploadSubFolder?: string): {
        storage: import("multer").StorageEngine;
        limits: {
            fileSize: number;
        };
        fileFilter: (req: any, file: any, callback: any) => any;
    };
    uploadToS3(file: Express.Multer.File, keyPrefix?: string): Promise<string>;
}
