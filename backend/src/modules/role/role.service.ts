import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-role.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
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
              name: this.i18n.t(rp.permission.name, { lang, defaultValue: rp.permission.name }),
              description: rp.permission.description
                ? this.i18n.t(rp.permission.description, { lang, defaultValue: rp.permission.description })
                : null,
            }
          : rp.permission,
      })),
    };
  }

  async findAll() {
    const lang = I18nContext.current()?.lang || 'vi';
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles.map((role) => this.translateRolePermissions(role, lang));
  }

  async findOne(id: string) {
    const lang = I18nContext.current()?.lang || 'vi';
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    return this.translateRolePermissions(role, lang);
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Role code "${dto.code}" đã tồn tại!`);
    }

    return this.prisma.role.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              create: dto.permissionIds.map((permissionId) => ({ permissionId })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async update(id: string, dto: Partial<CreateRoleDto>) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
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
    await this.prisma.role.delete({ where: { id } });
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }
}
