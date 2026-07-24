import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-role.dto';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
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
