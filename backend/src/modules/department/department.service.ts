import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly webhookService: WebhookService,
  ) {}

  async findAll(query: QueryDepartmentDto = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      parentId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' || parentId === '' ? null : parentId;
    }

    const [items, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id, deletedAt: null },
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
      throw new NotFoundException(
        this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }),
      );
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { code: dto.code, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException(
        `Department code "${dto.code}" đã tồn tại!`,
      );
    }

    const created = await this.prisma.department.create({
      data: dto,
    });
    this.webhookService.triggerWebhooks('department.created', created).catch(() => {});
    return created;
  }

  async update(id: string, dto: Partial<CreateDepartmentDto>) {
    await this.findOne(id);

    if (dto.parentId) {
      await this.assertNoCycle(id, dto.parentId);
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: dto,
    });
    this.webhookService.triggerWebhooks('department.updated', updated).catch(() => {});
    return updated;
  }

  /**
   * Chặn gán parentId tạo vòng lặp phân cấp: tự làm cha của chính mình,
   * hoặc gán 1 department con/cháu của chính nó làm cha.
   */
  private async assertNoCycle(departmentId: string, newParentId: string) {
    if (departmentId === newParentId) {
      throw new BadRequestException(
        'Không thể gán phòng ban làm cha của chính nó!',
      );
    }

    let currentId: string | null = newParentId;
    const visited = new Set<string>([departmentId]);

    while (currentId) {
      if (visited.has(currentId)) {
        throw new BadRequestException(
          'Không thể gán phòng ban con làm cha — tạo vòng lặp phân cấp!',
        );
      }
      visited.add(currentId);

      const parent: { parentId: string | null } | null =
        await this.prisma.department.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });
      currentId = parent?.parentId ?? null;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.webhookService.triggerWebhooks('department.deleted', { id }).catch(() => {});
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }

  async restore(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department || !department.deletedAt) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(
        this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }),
      );
    }
    await this.prisma.department.update({
      where: { id },
      data: { deletedAt: null },
    });
    return this.findOne(id);
  }
}
