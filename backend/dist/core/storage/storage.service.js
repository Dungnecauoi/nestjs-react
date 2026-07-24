"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const client_s3_1 = require("@aws-sdk/client-s3");
let StorageService = class StorageService {
    configService;
    disk;
    s3Client;
    constructor(configService) {
        this.configService = configService;
        this.disk = this.configService.get('storage.disk') || 'local';
        if (this.disk === 's3' || this.disk === 'minio') {
            const accessKeyId = this.configService.get('storage.aws.accessKeyId');
            const secretAccessKey = this.configService.get('storage.aws.secretAccessKey');
            const region = this.configService.get('storage.aws.region');
            if (accessKeyId && secretAccessKey) {
                this.s3Client = new client_s3_1.S3Client({
                    region,
                    credentials: { accessKeyId, secretAccessKey },
                });
            }
        }
    }
    static getMulterConfig(uploadSubFolder = '') {
        return {
            storage: (0, multer_1.diskStorage)({
                destination: (req, file, callback) => {
                    const uploadPath = `./uploads/${uploadSubFolder}`.replace(/\/+/g, '/');
                    if (!(0, fs_1.existsSync)(uploadPath)) {
                        (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                    }
                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = (0, path_1.extname)(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf|docx|xlsx)$/)) {
                    return callback(new common_1.BadRequestException('Định dạng file không được hỗ trợ!'), false);
                }
                callback(null, true);
            },
        };
    }
    async uploadToS3(file, keyPrefix = 'uploads') {
        if (!this.s3Client) {
            throw new Error('S3 Client chưa được cấu hình AWS credentials');
        }
        const bucket = this.configService.get('storage.aws.bucket');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const key = `${keyPrefix}/${uniqueSuffix}-${file.originalname}`;
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map