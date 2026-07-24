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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let PermissionService = class PermissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: [{ module: 'asc' }, { code: 'asc' }],
        });
        const grouped = permissions.reduce((acc, perm) => {
            if (!acc[perm.module]) {
                acc[perm.module] = [];
            }
            acc[perm.module].push(perm);
            return acc;
        }, {});
        return {
            total: permissions.length,
            grouped,
            list: permissions,
        };
    }
    async create(dto) {
        const existing = await this.prisma.permission.findUnique({ where: { code: dto.code } });
        if (existing) {
            throw new common_1.BadRequestException(`Permission code "${dto.code}" đã tồn tại!`);
        }
        return this.prisma.permission.create({
            data: dto,
        });
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionService);
//# sourceMappingURL=permission.service.js.map