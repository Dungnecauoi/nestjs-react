import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImportExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async exportUsersToCsv(): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        roles: { include: { role: true } },
        departments: { include: { department: true } },
      },
    });

    const headers = ['ID', 'Email', 'Name', 'Phone', 'IdentityCard', 'Gender', 'IsActive', 'Roles', 'Departments', 'CreatedAt'];
    const rows = users.map((u) => {
      const rolesStr = u.roles.map((r) => r.role.code).join(';');
      const deptsStr = u.departments.map((d) => d.department.code).join(';');
      return [
        `"${u.id}"`,
        `"${u.email}"`,
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.phone || ''}"`,
        `"${u.identityCard || ''}"`,
        `"${u.gender || ''}"`,
        `"${u.isActive ? 'Active' : 'Pending'}"`,
        `"${rolesStr}"`,
        `"${deptsStr}"`,
        `"${u.createdAt.toISOString()}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  async exportDepartmentsToCsv(): Promise<string> {
    const depts = await this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { parent: true },
    });

    const headers = ['ID', 'Code', 'Name', 'Description', 'ParentCode', 'CreatedAt'];
    const rows = depts.map((d) => [
      `"${d.id}"`,
      `"${d.code}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      `"${d.parent?.code || ''}"`,
      `"${d.createdAt.toISOString()}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  async importUsersFromCsv(fileBuffer: Buffer) {
    const content = fileBuffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length <= 1) {
      throw new BadRequestException('File CSV rỗng hoặc không có dữ liệu dòng hợp lệ!');
    }

    const rounds = this.configService.get<number>('auth.bcryptRounds') || 12;
    const defaultPasswordHash = await bcrypt.hash('12345678aA@', rounds);

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Header index mapping
    const headerLine = lines[0].toLowerCase().replace(/"/g, '');
    const headers = headerLine.split(',').map((h) => h.trim());

    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('họtên') || h.includes('tên'));
    const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('sđt'));
    const cccdIdx = headers.findIndex((h) => h.includes('identity') || h.includes('cccd'));

    if (emailIdx === -1 || nameIdx === -1) {
      throw new BadRequestException('File CSV bắt buộc phải chứa cột "Email" và "Name"!');
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // CSV regex split handling quotes
      const values = line.match(/(?:[^\s",]+|"[^"]*")+/g)?.map((v) => v.replace(/^"|"$/g, '').trim()) || [];
      const email = values[emailIdx];
      const name = values[nameIdx];
      const phone = phoneIdx !== -1 ? values[phoneIdx] : undefined;
      const identityCard = cccdIdx !== -1 ? values[cccdIdx] : undefined;

      if (!email || !name) {
        skippedCount++;
        continue;
      }

      try {
        const existing = await this.prisma.user.findUnique({
          where: { email, deletedAt: null },
        });

        if (existing) {
          skippedCount++;
          errors.push(`Dòng ${i + 1}: Email "${email}" đã tồn tại -> Bỏ qua`);
          continue;
        }

        await this.prisma.user.create({
          data: {
            email,
            name,
            phone: phone || null,
            identityCard: identityCard || null,
            password: defaultPasswordHash,
            isActive: true,
          },
        });
        importedCount++;
      } catch (err: any) {
        skippedCount++;
        errors.push(`Dòng ${i + 1}: Lỗi khi thêm email "${email}": ${err.message}`);
      }
    }

    return {
      success: true,
      importedCount,
      skippedCount,
      errors,
      defaultPasswordNotice: 'Các tài khoản mới tạo từ CSV được cấp mật khẩu mặc định: 12345678aA@',
    };
  }
}
