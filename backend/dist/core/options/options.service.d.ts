import { PrismaService } from '../database/prisma.service';
export declare class OptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOption(optionName: string, defaultValue?: any): Promise<any>;
    setOption(optionName: string, optionValue: any, autoload?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        optionName: string;
        optionValue: string | null;
        autoload: boolean;
    }>;
    getAllOptions(): Promise<Record<string, any>>;
    setMultipleOptions(options: Record<string, any>): Promise<Record<string, any>>;
}
