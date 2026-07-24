import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    findAll(): Promise<({
        users: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
        parent: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        } | null;
        children: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        users: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            userId: string;
            departmentId: string;
            isPrimary: boolean;
        })[];
        parent: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        } | null;
        children: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    }>;
    create(dto: CreateDepartmentDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    }>;
    update(id: string, dto: Partial<CreateDepartmentDto>): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
