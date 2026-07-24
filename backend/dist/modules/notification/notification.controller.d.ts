import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(user: any, query: QueryNotificationDto): Promise<{
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
    markAsRead(id: string, user: any, lang: string): Promise<{
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
    markAllAsRead(user: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    sendTestNotification(dto: CreateNotificationDto, lang: string): Promise<{
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
    remove(id: string, lang: string): Promise<{
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
