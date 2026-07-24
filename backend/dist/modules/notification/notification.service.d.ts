import { PrismaService } from '../../core/database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { I18nService } from 'nestjs-i18n';
export declare class NotificationService {
    private readonly prisma;
    private readonly gateway;
    private readonly i18n;
    constructor(prisma: PrismaService, gateway: NotificationGateway, i18n: I18nService);
    create(createDto: CreateNotificationDto, lang?: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: string | null;
        userId: string | null;
        content: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    handleSystemNotificationEvent(payload: CreateNotificationDto): Promise<void>;
    findAllForUser(userId: string, query: QueryNotificationDto): Promise<{
        data: {
            type: string;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: string | null;
            userId: string | null;
            content: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markAsRead(id: string, userId: string, lang?: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: string | null;
        userId: string | null;
        content: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    remove(id: string, lang?: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: string | null;
        userId: string | null;
        content: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
}
