import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImportExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ──────────────────────────────────────────────
  // CSV
  // ──────────────────────────────────────────────

  async exportUsersToCsv(): Promise<string> {
    const users = await this.fetchUsersData();
    const headers = ['ID', 'Email', 'Name', 'Phone', 'IdentityCard', 'Gender', 'IsActive', 'Roles', 'Departments', 'CreatedAt'];
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.email}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.phone || ''}"`,
      `"${u.identityCard || ''}"`,
      `"${u.gender || ''}"`,
      `"${u.isActive ? 'Active' : 'Pending'}"`,
      `"${u.roles.map((r: any) => r.role.code).join(';')}"`,
      `"${u.departments.map((d: any) => d.department.code).join(';')}"`,
      `"${u.createdAt.toISOString()}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  async exportDepartmentsToCsv(): Promise<string> {
    const depts = await this.fetchDepartmentsData();
    const headers = ['ID', 'Code', 'Name', 'Description', 'ParentCode', 'CreatedAt'];
    const rows = depts.map((d) => [
      `"${d.id}"`,
      `"${d.code}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      `"${(d as any).parent?.code || ''}"`,
      `"${d.createdAt.toISOString()}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // ──────────────────────────────────────────────
  // EXCEL (.xlsx)
  // ──────────────────────────────────────────────

  async exportUsersToExcel(): Promise<Buffer> {
    const users = await this.fetchUsersData();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EcomCX ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Users', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Định nghĩa cột
    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Email', key: 'email', width: 36 },
      { header: 'Họ & Tên', key: 'name', width: 28 },
      { header: 'Số Điện Thoại', key: 'phone', width: 18 },
      { header: 'CMND/CCCD', key: 'identityCard', width: 18 },
      { header: 'Giới Tính', key: 'gender', width: 12 },
      { header: 'Trạng Thái', key: 'isActive', width: 14 },
      { header: 'Vai Trò', key: 'roles', width: 30 },
      { header: 'Phòng Ban', key: 'departments', width: 30 },
      { header: 'Ngày Tạo', key: 'createdAt', width: 22 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });
    headerRow.height = 28;

    // Dữ liệu
    users.forEach((u, idx) => {
      const row = sheet.addRow({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone || '',
        identityCard: u.identityCard || '',
        gender: u.gender || '',
        isActive: u.isActive ? 'Hoạt Động' : 'Chờ Duyệt',
        roles: u.roles.map((r: any) => r.role.code).join(', '),
        departments: u.departments.map((d: any) => d.department.name).join(', '),
        createdAt: u.createdAt.toISOString(),
      });

      // Màu nền zebra
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }

      // Màu ô trạng thái
      const statusCell = row.getCell('isActive');
      statusCell.font = {
        bold: true,
        color: { argb: u.isActive ? 'FF059669' : 'FFD97706' },
      };

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        };
      });
      row.height = 22;
    });

    // Auto-filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportDepartmentsToExcel(): Promise<Buffer> {
    const depts = await this.fetchDepartmentsData();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EcomCX ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Departments', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Mã Phòng Ban', key: 'code', width: 20 },
      { header: 'Tên Phòng Ban', key: 'name', width: 30 },
      { header: 'Mô Tả', key: 'description', width: 40 },
      { header: 'Phòng Ban Cha', key: 'parentCode', width: 20 },
      { header: 'Ngày Tạo', key: 'createdAt', width: 22 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF334155' } } };
    });
    headerRow.height = 28;

    depts.forEach((d, idx) => {
      const row = sheet.addRow({
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description || '',
        parentCode: (d as any).parent?.code || '',
        createdAt: d.createdAt.toISOString(),
      });

      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };
      });
      row.height = 22;
    });

    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // ──────────────────────────────────────────────
  // IMPORT từ CSV
  // ──────────────────────────────────────────────

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

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────

  private async fetchUsersData() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        roles: { include: { role: true } },
        departments: { include: { department: true } },
      },
    });
  }

  private async fetchDepartmentsData() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { parent: true },
    });
  }
}
