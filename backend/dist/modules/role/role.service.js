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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const nestjs_i18n_1 = require("nestjs-i18n");
let RoleService = class RoleService {
    prisma;
    i18n;
    constructor(prisma, i18n) {
        this.prisma = prisma;
        this.i18n = i18n;
    }
    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (!role) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            throw new common_1.NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
        }
        return role;
    }
    async create(dto) {
        const existing = await this.prisma.role.findUnique({ where: { code: dto.code } });
        if (existing) {
            throw new common_1.BadRequestException(`Role code "${dto.code}" đã tồn tại!`);
        }
        return this.prisma.role.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
                permissions: dto.permissionIds
                    ? {
                        create: dto.permissionIds.map((permissionId) => ({ permissionId })),
                    }
                    : undefined,
            },
            include: {
                permissions: { include: { permission: true } },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            if (dto.permissionIds) {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });
                await tx.rolePermission.createMany({
                    data: dto.permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                });
            }
            return tx.role.update({
                where: { id },
                data: {
                    code: dto.code,
                    name: dto.name,
                    description: dto.description,
                },
                include: {
                    permissions: { include: { permission: true } },
                },
            });
        });
    }
    async assignPermissions(id, dto) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            await tx.rolePermission.deleteMany({ where: { roleId: id } });
            await tx.rolePermission.createMany({
                data: dto.permissionIds.map((permissionId) => ({
                    roleId: id,
                    permissionId,
                })),
            });
            return tx.role.findUnique({
                where: { id },
                include: { permissions: { include: { permission: true } } },
            });
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.role.delete({ where: { id } });
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService])
], RoleService);
//# sourceMappingURL=role.service.js.map