import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll() {
    const lang = I18nContext.current()?.lang || 'vi';
    const rawPermissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    const permissions = rawPermissions.map((perm) => ({
      ...perm,
      name: this.i18n.t(perm.name, { lang, defaultValue: perm.name }),
      description: perm.description
        ? this.i18n.t(perm.description, {
            lang,
            defaultValue: perm.description,
          })
        : null,
    }));

    // Gom nhóm theo Module cho giao diện UI phân quyền dễ chọn
    const grouped = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return {
      total: permissions.length,
      grouped,
      list: permissions,
    };
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(
        `Permission code "${dto.code}" đã tồn tại!`,
      );
    }

    return this.prisma.permission.create({
      data: dto,
    });
  }
}
