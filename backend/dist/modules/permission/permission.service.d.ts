import { PrismaService } from '../../core/database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
export declare class PermissionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        total: number;
        grouped: Record<string, {
            description: string | null;
            name: string;
            module: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
        }[]>;
        list: {
            description: string | null;
            name: string;
            module: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
        }[];
    }>;
    create(dto: CreatePermissionDto): Promise<{
        description: string | null;
        name: string;
        module: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }>;
}
