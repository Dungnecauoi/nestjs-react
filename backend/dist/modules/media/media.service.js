"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MediaService = class MediaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.media.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.media.findUnique({
            where: { id },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Không tìm thấy tập tin media với ID: ${id}`);
        }
        return item;
    }
    async createMedia(file, createdById) {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(filePath, file.buffer);
        const host = process.env.APP_URL || 'http://localhost:3000';
        const publicUrl = `${host}/uploads/${uniqueFilename}`;
        return this.prisma.media.create({
            data: {
                filename: file.originalname,
                filepath: `/uploads/${uniqueFilename}`,
                url: publicUrl,
                mimetype: file.mimetype,
                size: file.size,
                title: file.originalname,
                altText: file.originalname,
                createdById: createdById || null,
            },
        });
    }
    async updateMedia(id, dto) {
        await this.findOne(id);
        return this.prisma.media.update({
            where: { id },
            data: dto,
        });
    }
    async removeMedia(id) {
        const item = await this.findOne(id);
        const relativePath = item.filepath.startsWith('/') ? item.filepath.substring(1) : item.filepath;
        const fullPath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            }
            catch (err) {
                console.error('Lỗi khi xóa file vật lý:', err);
            }
        }
        return this.prisma.media.delete({
            where: { id },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map