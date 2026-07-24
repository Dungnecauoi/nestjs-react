import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        children: true,
        parent: true,
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!department) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Department code "${dto.code}" đã tồn tại!`);
    }

    return this.prisma.department.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateDepartmentDto>) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.department.delete({ where: { id } });
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }
}
