import { I18nService } from 'nestjs-i18n';
import { CreateEmployeeDto } from './dto/create-employee.dto';
export declare class EmployeeService {
    private readonly i18n;
    private items;
    constructor(i18n: I18nService);
    findAll(): any[];
    findOne(id: string): any;
    create(dto: CreateEmployeeDto, file?: Express.Multer.File): {
        avatar: string | null;
        createdAt: string;
        name: string;
        description?: string;
        id: string;
    };
    remove(id: string): {
        message: string;
    };
}
