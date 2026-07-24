import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
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
