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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const notification_gateway_1 = require("./notification.gateway");
const event_emitter_1 = require("@nestjs/event-emitter");
const nestjs_i18n_1 = require("nestjs-i18n");
let NotificationService = class NotificationService {
    prisma;
    gateway;
    i18n;
    constructor(prisma, gateway, i18n) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.i18n = i18n;
    }
    async create(createDto, lang = 'vi') {
        const notification = await this.prisma.notification.create({
            data: {
                userId: createDto.userId || null,
                title: createDto.title,
                content: createDto.content,
                type: createDto.type || 'info',
                data: createDto.data || null,
            },
        });
        this.gateway.sendNotificationToUser(notification.userId, notification);
        return notification;
    }
    async handleSystemNotificationEvent(payload) {
        await this.create(payload);
    }
    async findAllForUser(userId, query) {
        const { page = 1, limit = 10, search, isRead, type, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { userId: userId },
                { userId: null },
            ],
        };
        if (search) {
            where.AND = [
                {
                    OR: [
                        { title: { contains: search } },
                        { content: { contains: search } },
                    ],
                },
            ];
        }
        if (isRead !== undefined && isRead !== '') {
            where.isRead = isRead === 'true';
        }
        if (type) {
            where.type = type;
        }
        const [items, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: {
                    OR: [{ userId: userId }, { userId: null }],
                    isRead: false,
                },
            }),
        ]);
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async markAsRead(id, userId, lang = 'vi') {
        const existing = await this.prisma.notification.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(this.i18n.t('notification.NOT_FOUND', { lang }));
        }
        return this.prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: {
                OR: [{ userId }, { userId: null }],
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async remove(id, lang = 'vi') {
        const existing = await this.prisma.notification.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(this.i18n.t('notification.NOT_FOUND', { lang }));
        }
        return this.prisma.notification.delete({ where: { id } });
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, event_emitter_1.OnEvent)('notification.send'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleSystemNotificationEvent", null);
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway,
        nestjs_i18n_1.I18nService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map