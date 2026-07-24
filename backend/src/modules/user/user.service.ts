import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { AssignUserPermissionsDto } from './dto/assign-user-permissions.dto';
import { AssignUserDepartmentsDto } from './dto/assign-user-departments.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly defaultSelect = {
    id: true,
    email: true,
    name: true,
    avatar: true,
    phone: true,
    identityCard: true,
    gender: true,
    dateOfBirth: true,
    address: true,
    bio: true,
    isActive: true,
    createdAt: true,
    roles: {
      include: { role: true },
    },
    permissions: {
      include: { permission: true },
    },
    departments: {
      include: { department: true },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: this.defaultSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.defaultSelect,
    });

    if (!user) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    return user;
  }

  async create(dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(dto.password || '123456', 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        avatar: dto.avatar || null,
        phone: dto.phone || null,
        identityCard: dto.identityCard || null,
        gender: dto.gender || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        address: dto.address || null,
        bio: dto.bio || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    // 1. Link Roles if provided
    if (dto.roleCodes && Array.isArray(dto.roleCodes) && dto.roleCodes.length > 0) {
      const dbRoles = await this.prisma.role.findMany({
        where: { code: { in: dto.roleCodes } },
      });
      if (dbRoles.length > 0) {
        await this.prisma.userRole.createMany({
          data: dbRoles.map((r) => ({ userId: user.id, roleId: r.id })),
        });
      }
    }

    // 2. Link Direct Permissions if provided
    if (dto.permissionCodes && Array.isArray(dto.permissionCodes) && dto.permissionCodes.length > 0) {
      const dbPerms = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissionCodes } },
      });
      if (dbPerms.length > 0) {
        await this.prisma.userPermission.createMany({
          data: dbPerms.map((p) => ({ userId: user.id, permissionId: p.id })),
        });
      }
    }

    // 3. Link Departments if provided
    if (dto.departmentIds && Array.isArray(dto.departmentIds) && dto.departmentIds.length > 0) {
      await this.prisma.userDepartment.createMany({
        data: dto.departmentIds.map((dId, idx) => ({
          userId: user.id,
          departmentId: dId,
          isPrimary: idx === 0,
        })),
      });
    }

    return this.findOne(user.id);
  }

  async update(id: string, dto: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.identityCard !== undefined) updateData.identityCard = dto.identityCard;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    // Verify current password if user is attempting to change password
    const targetPassword = dto.newPassword || dto.password;
    if (targetPassword) {
      if (dto.currentPassword) {
        const isMatch = await bcrypt.compare(dto.currentPassword, existingUser.password);
        if (!isMatch) {
          throw new BadRequestException('Mật khẩu hiện tại không chính xác!');
        }
      }
      updateData.password = await bcrypt.hash(targetPassword, 10);
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 1. Update Roles if provided
    if (dto.roleCodes && Array.isArray(dto.roleCodes)) {
      const dbRoles = await this.prisma.role.findMany({
        where: { code: { in: dto.roleCodes } },
      });
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      if (dbRoles.length > 0) {
        await this.prisma.userRole.createMany({
          data: dbRoles.map((r) => ({ userId: id, roleId: r.id })),
        });
      }
    }

    // 2. Update Direct Permissions if provided
    if (dto.permissionCodes && Array.isArray(dto.permissionCodes)) {
      const dbPerms = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissionCodes } },
      });
      await this.prisma.userPermission.deleteMany({ where: { userId: id } });
      if (dbPerms.length > 0) {
        await this.prisma.userPermission.createMany({
          data: dbPerms.map((p) => ({ userId: id, permissionId: p.id })),
        });
      }
    }

    // 3. Update Departments if provided
    if (dto.departmentIds && Array.isArray(dto.departmentIds)) {
      await this.prisma.userDepartment.deleteMany({ where: { userId: id } });
      if (dto.departmentIds.length > 0) {
        await this.prisma.userDepartment.createMany({
          data: dto.departmentIds.map((dId, idx) => ({
            userId: id,
            departmentId: dId,
            isPrimary: idx === 0,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Đã xóa người dùng thành công' };
  }

  async approve(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
    return this.findOne(id);
  }

  async assignRoles(userId: string, dto: AssignUserRolesDto) {
    await this.findOne(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      });

      return this.findOne(userId);
    });
  }

  async assignDirectPermissions(userId: string, dto: AssignUserPermissionsDto) {
    await this.findOne(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({ where: { userId } });
      await tx.userPermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          userId,
          permissionId,
        })),
      });

      return this.findOne(userId);
    });
  }

  async assignDepartments(userId: string, dto: AssignUserDepartmentsDto) {
    await this.findOne(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.userDepartment.deleteMany({ where: { userId } });
      await tx.userDepartment.createMany({
        data: dto.departmentIds.map((departmentId) => ({
          userId,
          departmentId,
          isPrimary: dto.primaryDepartmentId === departmentId,
        })),
      });

      return this.findOne(userId);
    });
  }
}
