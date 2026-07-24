import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    // Gom nhóm theo Module cho giao diện UI phân quyền dễ chọn
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return {
      total: permissions.length,
      grouped,
      list: permissions,
    };
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Permission code "${dto.code}" đã tồn tại!`);
    }

    return this.prisma.permission.create({
      data: dto,
    });
  }
}
