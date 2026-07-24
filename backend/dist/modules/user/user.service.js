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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const nestjs_i18n_1 = require("nestjs-i18n");
const bcrypt = __importStar(require("bcrypt"));
let UserService = class UserService {
    prisma;
    i18n;
    defaultSelect = {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        identityCard: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        bio: true,
        isActive: true,
        createdAt: true,
        roles: {
            include: { role: true },
        },
        permissions: {
            include: { permission: true },
        },
        departments: {
            include: { department: true },
        },
    };
    constructor(prisma, i18n) {
        this.prisma = prisma;
        this.i18n = i18n;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: this.defaultSelect,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.defaultSelect,
        });
        if (!user) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            throw new common_1.NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
        }
        return user;
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.BadRequestException('Email này đã được sử dụng!');
        }
        const hashedPassword = await bcrypt.hash(dto.password || '123456', 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
                avatar: dto.avatar || null,
                phone: dto.phone || null,
                identityCard: dto.identityCard || null,
                gender: dto.gender || null,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                address: dto.address || null,
                bio: dto.bio || null,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
        if (dto.roleCodes && Array.isArray(dto.roleCodes) && dto.roleCodes.length > 0) {
            const dbRoles = await this.prisma.role.findMany({
                where: { code: { in: dto.roleCodes } },
            });
            if (dbRoles.length > 0) {
                await this.prisma.userRole.createMany({
                    data: dbRoles.map((r) => ({ userId: user.id, roleId: r.id })),
                });
            }
        }
        if (dto.permissionCodes && Array.isArray(dto.permissionCodes) && dto.permissionCodes.length > 0) {
            const dbPerms = await this.prisma.permission.findMany({
                where: { code: { in: dto.permissionCodes } },
            });
            if (dbPerms.length > 0) {
                await this.prisma.userPermission.createMany({
                    data: dbPerms.map((p) => ({ userId: user.id, permissionId: p.id })),
                });
            }
        }
        if (dto.departmentIds && Array.isArray(dto.departmentIds) && dto.departmentIds.length > 0) {
            await this.prisma.userDepartment.createMany({
                data: dto.departmentIds.map((dId, idx) => ({
                    userId: user.id,
                    departmentId: dId,
                    isPrimary: idx === 0,
                })),
            });
        }
        return this.findOne(user.id);
    }
    async update(id, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, password: true },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng!');
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.avatar !== undefined)
            updateData.avatar = dto.avatar;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.identityCard !== undefined)
            updateData.identityCard = dto.identityCard;
        if (dto.gender !== undefined)
            updateData.gender = dto.gender;
        if (dto.dateOfBirth !== undefined)
            updateData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
        if (dto.address !== undefined)
            updateData.address = dto.address;
        if (dto.bio !== undefined)
            updateData.bio = dto.bio;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        const targetPassword = dto.newPassword || dto.password;
        if (targetPassword) {
            if (dto.currentPassword) {
                const isMatch = await bcrypt.compare(dto.currentPassword, existingUser.password);
                if (!isMatch) {
                    throw new common_1.BadRequestException('Mật khẩu hiện tại không chính xác!');
                }
            }
            updateData.password = await bcrypt.hash(targetPassword, 10);
        }
        await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        if (dto.roleCodes && Array.isArray(dto.roleCodes)) {
            const dbRoles = await this.prisma.role.findMany({
                where: { code: { in: dto.roleCodes } },
            });
            await this.prisma.userRole.deleteMany({ where: { userId: id } });
            if (dbRoles.length > 0) {
                await this.prisma.userRole.createMany({
                    data: dbRoles.map((r) => ({ userId: id, roleId: r.id })),
                });
            }
        }
        if (dto.permissionCodes && Array.isArray(dto.permissionCodes)) {
            const dbPerms = await this.prisma.permission.findMany({
                where: { code: { in: dto.permissionCodes } },
            });
            await this.prisma.userPermission.deleteMany({ where: { userId: id } });
            if (dbPerms.length > 0) {
                await this.prisma.userPermission.createMany({
                    data: dbPerms.map((p) => ({ userId: id, permissionId: p.id })),
                });
            }
        }
        if (dto.departmentIds && Array.isArray(dto.departmentIds)) {
            await this.prisma.userDepartment.deleteMany({ where: { userId: id } });
            if (dto.departmentIds.length > 0) {
                await this.prisma.userDepartment.createMany({
                    data: dto.departmentIds.map((dId, idx) => ({
                        userId: id,
                        departmentId: dId,
                        isPrimary: idx === 0,
                    })),
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: 'Đã xóa người dùng thành công' };
    }
    async approve(id) {
        await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
        return this.findOne(id);
    }
    async assignRoles(userId, dto) {
        await this.findOne(userId);
        return this.prisma.$transaction(async (tx) => {
            await tx.userRole.deleteMany({ where: { userId } });
            await tx.userRole.createMany({
                data: dto.roleIds.map((roleId) => ({
                    userId,
                    roleId,
                })),
            });
            return this.findOne(userId);
        });
    }
    async assignDirectPermissions(userId, dto) {
        await this.findOne(userId);
        return this.prisma.$transaction(async (tx) => {
            await tx.userPermission.deleteMany({ where: { userId } });
            await tx.userPermission.createMany({
                data: dto.permissionIds.map((permissionId) => ({
                    userId,
                    permissionId,
                })),
            });
            return this.findOne(userId);
        });
    }
    async assignDepartments(userId, dto) {
        await this.findOne(userId);
        return this.prisma.$transaction(async (tx) => {
            await tx.userDepartment.deleteMany({ where: { userId } });
            await tx.userDepartment.createMany({
                data: dto.departmentIds.map((departmentId) => ({
                    userId,
                    departmentId,
                    isPrimary: dto.primaryDepartmentId === departmentId,
                })),
            });
            return this.findOne(userId);
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService])
], UserService);
//# sourceMappingURL=user.service.js.map