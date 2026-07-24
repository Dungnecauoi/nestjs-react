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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const nestjs_i18n_1 = require("nestjs-i18n");
let DepartmentService = class DepartmentService {
    prisma;
    i18n;
    constructor(prisma, i18n) {
        this.prisma = prisma;
        this.i18n = i18n;
    }
    async findAll() {
        return this.prisma.department.findMany({
            include: {
                children: true,
                parent: true,
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
            },
        });
    }
    async findOne(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
            },
        });
        if (!department) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            throw new common_1.NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
        }
        return department;
    }
    async create(dto) {
        const existing = await this.prisma.department.findUnique({ where: { code: dto.code } });
        if (existing) {
            throw new common_1.BadRequestException(`Department code "${dto.code}" đã tồn tại!`);
        }
        return this.prisma.department.create({
            data: dto,
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.department.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.department.delete({ where: { id } });
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService])
], DepartmentService);
//# sourceMappingURL=department.service.js.map