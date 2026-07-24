import { PrismaService } from '../../core/database/prisma.service';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { AssignUserPermissionsDto } from './dto/assign-user-permissions.dto';
import { AssignUserDepartmentsDto } from './dto/assign-user-departments.dto';
import { I18nService } from 'nestjs-i18n';
export declare class UserService {
    private readonly prisma;
    private readonly i18n;
    private readonly defaultSelect;
    constructor(prisma: PrismaService, i18n: I18nService);
    findAll(): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }[]>;
    findOne(id: string): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    create(dto: any): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    update(id: string, dto: any): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    approve(id: string): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    assignRoles(userId: string, dto: AssignUserRolesDto): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    assignDirectPermissions(userId: string, dto: AssignUserPermissionsDto): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
    assignDepartments(userId: string, dto: AssignUserDepartmentsDto): Promise<{
        name: string;
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
            userId: string;
            permissionId: string;
        })[];
        email: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        identityCard: string | null;
        gender: string | null;
        dateOfBirth: Date | null;
        address: string | null;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        departments: ({
            department: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
    }>;
}
