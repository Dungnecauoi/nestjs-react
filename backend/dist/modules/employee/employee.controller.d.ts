import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    findAll(): any[];
    findOne(id: string): any;
    create(file: Express.Multer.File, dto: CreateEmployeeDto): {
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
