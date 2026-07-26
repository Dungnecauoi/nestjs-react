import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly webhookService: WebhookService,
  ) {}

  private translateRolePermissions(role: any, lang: string) {
    if (!role || !role.permissions) return role;
    return {
      ...role,
      permissions: role.permissions.map((rp: any) => ({
        ...rp,
        permission: rp.permission
          ? {
              ...rp.permission,
              name: this.i18n.t(rp.permission.name, {
                lang,
                defaultValue: rp.permission.name,
              }),
              description: rp.permission.description
                ? this.i18n.t(rp.permission.description, {
                    lang,
                    defaultValue: rp.permission.description,
                  })
                : null,
            }
          : rp.permission,
      })),
    };
  }

  async findAll(query: QueryRoleDto = {}) {
    const lang = I18nContext.current()?.lang || 'vi';
    const {
      page = 1,
      limit = 10,
      search,
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

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const items = roles.map((role) => this.translateRolePermissions(role, lang));

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
    const lang = I18nContext.current()?.lang || 'vi';
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(
        this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }),
      );
    }

    return this.translateRolePermissions(role, lang);
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { code: dto.code, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException(`Role code "${dto.code}" đã tồn tại!`);
    }

    const created = await this.prisma.role.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              create: dto.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    this.webhookService.triggerWebhooks('role.created', created).catch(() => {});
    return created;
  }

  async update(id: string, dto: Partial<CreateRoleDto>) {
    await this.findOne(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.permissionIds) {
        // Xóa hết liên kết permission cũ
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        // Thêm liên kết permission mới
        await tx.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }

      return tx.role.update({
        where: { id },
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
        include: {
          permissions: { include: { permission: true } },
        },
      });
    });
    this.webhookService.triggerWebhooks('role.updated', updated).catch(() => {});
    return updated;
  }

  async assignPermissions(id: string, dto: AssignPermissionsToRoleDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });

      return tx.role.findUnique({
        where: { id },
        include: { permissions: { include: { permission: true } } },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.webhookService.triggerWebhooks('role.deleted', { id }).catch(() => {});
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }

  async restore(id: string) {
    const lang = I18nContext.current()?.lang;
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role || !role.deletedAt) {
      throw new NotFoundException(
        this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }),
      );
    }
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: null },
    });
    return this.findOne(id);
  }
}
