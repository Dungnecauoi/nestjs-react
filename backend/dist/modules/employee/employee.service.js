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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_i18n_1 = require("nestjs-i18n");
let EmployeeService = class EmployeeService {
    i18n;
    items = [];
    constructor(i18n) {
        this.i18n = i18n;
    }
    findAll() {
        return this.items;
    }
    findOne(id) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        const item = this.items.find((i) => i.id === id);
        if (!item) {
            const message = this.i18n.t('messages.NOT_FOUND', { lang, args: { id } });
            throw new common_1.NotFoundException(message);
        }
        return item;
    }
    create(dto, file) {
        const newItem = {
            id: Date.now().toString(),
            ...dto,
            avatar: file ? `/uploads/${file.filename}` : null,
            createdAt: new Date().toISOString(),
        };
        this.items.push(newItem);
        return newItem;
    }
    remove(id) {
        this.findOne(id);
        this.items = this.items.filter((i) => i.id !== id);
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map