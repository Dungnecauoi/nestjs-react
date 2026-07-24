import { PrismaService } from '../../core/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-role.dto';
import { I18nService } from 'nestjs-i18n';
export declare class RoleService {
    private readonly prisma;
    private readonly i18n;
    constructor(prisma: PrismaService, i18n: I18nService);
    findAll(): Promise<({
        permissions: ({
            permission: {
                description: string | null;
                name: string;
                module: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            permissionId: string;
            roleId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    })[]>;
    findOne(id: string): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                name: string;
                module: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            permissionId: string;
            roleId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }>;
    create(dto: CreateRoleDto): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                name: string;
                module: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            permissionId: string;
            roleId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }>;
    update(id: string, dto: Partial<CreateRoleDto>): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                name: string;
                module: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            permissionId: string;
            roleId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }>;
    assignPermissions(id: string, dto: AssignPermissionsToRoleDto): Promise<({
        permissions: ({
            permission: {
                description: string | null;
                name: string;
                module: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            permissionId: string;
            roleId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }) | null>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
