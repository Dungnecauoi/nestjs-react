import { OptionsService } from './options.service';
export declare class OptionsController {
    private readonly optionsService;
    constructor(optionsService: OptionsService);
    getAllOptions(): Promise<{
        success: boolean;
        data: Record<string, any>;
    }>;
    setOptions(options: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        data: Record<string, any>;
    }>;
}
