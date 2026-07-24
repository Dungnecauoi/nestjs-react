import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  private items: any[] = [];

  constructor(private readonly i18n: I18nService) {}

  findAll() {
    return this.items;
  }

  findOne(id: string) {
    const lang = I18nContext.current()?.lang;
    const item = this.items.find((i) => i.id === id);

    if (!item) {
      const message = this.i18n.t('messages.NOT_FOUND', { lang, args: { id } });
      throw new NotFoundException(message);
    }
    return item;
  }

  create(dto: CreateEmployeeDto, file?: Express.Multer.File) {
    const newItem = {
      id: Date.now().toString(),
      ...dto,
      avatar: file ? `/uploads/${file.filename}` : null,
      createdAt: new Date().toISOString(),
    };
    this.items.push(newItem);
    return newItem;
  }

  remove(id: string) {
    this.findOne(id);
    this.items = this.items.filter((i) => i.id !== id);
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }
}
