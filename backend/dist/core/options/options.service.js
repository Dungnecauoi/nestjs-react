"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let OptionsService = class OptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOption(optionName, defaultValue = null) {
        const record = await this.prisma.option.findUnique({
            where: { optionName },
        });
        if (!record || record.optionValue === null) {
            return defaultValue;
        }
        try {
            return JSON.parse(record.optionValue);
        }
        catch {
            return record.optionValue;
        }
    }
    async setOption(optionName, optionValue, autoload = true) {
        const valueStr = typeof optionValue === 'object' ? JSON.stringify(optionValue) : String(optionValue);
        return this.prisma.option.upsert({
            where: { optionName },
            update: { optionValue: valueStr, autoload },
            create: { optionName, optionValue: valueStr, autoload },
        });
    }
    async getAllOptions() {
        const records = await this.prisma.option.findMany({
            where: { autoload: true },
        });
        const result = {};
        for (const item of records) {
            if (item.optionValue !== null) {
                try {
                    result[item.optionName] = JSON.parse(item.optionValue);
                }
                catch {
                    result[item.optionName] = item.optionValue;
                }
            }
        }
        return result;
    }
    async setMultipleOptions(options) {
        const promises = Object.entries(options).map(([key, val]) => this.setOption(key, val));
        await Promise.all(promises);
        return this.getAllOptions();
    }
};
exports.OptionsService = OptionsService;
exports.OptionsService = OptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OptionsService);
//# sourceMappingURL=options.service.js.map