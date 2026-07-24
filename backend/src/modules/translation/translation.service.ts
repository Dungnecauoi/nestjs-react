import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const KNOWN_LANGUAGES: Record<string, string> = {
  vi: '🇻🇳 Tiếng Việt (vi)',
  en: '🇺🇸 English (en)',
  zh: '🇨🇳 Tiếng Trung (zh)',
  ja: '🇯🇵 Tiếng Nhật (ja)',
  kr: '🇰🇷 Tiếng Hàn (kr)',
  ko: '🇰🇷 Tiếng Hàn (ko)',
  fr: '🇫🇷 Tiếng Pháp (fr)',
  de: '🇩🇪 Tiếng Đức (de)',
  es: '🇪🇸 Tiếng Tây Ban Nha (es)',
  th: '🇹🇭 Tiếng Thái (th)',
  ru: '🇷🇺 Tiếng Nga (ru)',
  it: '🇮🇹 Tiếng Ý (it)',
  pt: '🇵🇹 Tiếng Bồ Đào Nha (pt)',
  id: '🇮🇩 Tiếng Indonesia (id)',
  ms: '🇲🇾 Tiếng Mã Lai (ms)',
};

@Injectable()
export class TranslationService {
  private readonly backendI18nPath = path.join(process.cwd(), 'src', 'i18n');
  private readonly frontendLocalesPath = path.join(
    process.cwd(),
    '..',
    'admin',
    'src',
    'locales',
  );

  getLanguagesList() {
    if (!fs.existsSync(this.backendI18nPath)) {
      return [
        { code: 'vi', name: '🇻🇳 Tiếng Việt (vi)' },
        { code: 'en', name: '🇺🇸 English (en)' },
      ];
    }

    const dirs = fs
      .readdirSync(this.backendI18nPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Ensure vi and en are always present
    const langCodes = Array.from(new Set(['vi', 'en', ...dirs]));

    return langCodes.map((code) => ({
      code,
      name: KNOWN_LANGUAGES[code] || `🌐 Ngôn Ngữ (${code})`,
    }));
  }

  getDomains() {
    return {
      scopes: [
        { key: 'backend', name: 'Dịch Hệ Thống Backend (API & Permissions)' },
        { key: 'frontend', name: 'Dịch Giao Diện Frontend (React Admin)' },
      ],
      backendDomains: [
        'permissions',
        'messages',
        'auth',
        'notification',
        'audit',
        'validation',
      ],
      frontendDomains: ['locales'],
      languages: this.getLanguagesList(),
    };
  }

  private flattenObject(obj: any, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    if (!obj || typeof obj !== 'object') return result;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          Object.assign(result, this.flattenObject(val, newKey));
        } else if (val !== null && val !== undefined) {
          result[newKey] = String(val);
        }
      }
    }
    return result;
  }

  private unflattenObject(flatObj: Record<string, string>): any {
    const result: any = {};
    if (!flatObj || typeof flatObj !== 'object') return result;

    // Process deeper paths first to avoid parent string key collisions
    const keys = Object.keys(flatObj).sort(
      (a, b) => b.split('.').length - a.split('.').length,
    );

    for (const key of keys) {
      const val = flatObj[key];
      const parts = key.split('.');
      let current = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          if (typeof current[part] === 'object' && current[part] !== null) {
            continue;
          }
          current[part] = val !== undefined ? String(val) : '';
        } else {
          if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
    return result;
  }

  async getTranslations(scope: string, domain: string, lang: string) {
    const targetLang = (lang || 'vi').toLowerCase();

    if (scope === 'backend') {
      const filePath = path.join(
        this.backendI18nPath,
        targetLang,
        `${domain}.json`,
      );
      if (!fs.existsSync(filePath)) {
        return { scope, domain, lang: targetLang, data: {} };
      }
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const rawJson = JSON.parse(content);
        const flatData = this.flattenObject(rawJson);
        return { scope, domain, lang: targetLang, data: flatData };
      } catch (err: any) {
        throw new BadRequestException(`Không thể đọc tệp dịch: ${err.message}`);
      }
    }

    if (scope === 'frontend') {
      const filePath = path.join(this.frontendLocalesPath, `${targetLang}.ts`);
      if (!fs.existsSync(filePath)) {
        return { scope, domain: 'locales', lang: targetLang, data: {} };
      }
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const jsonMatch = content.match(/export\s+default\s+({[\s\S]*});?/);
        if (jsonMatch && jsonMatch[1]) {
          const rawObj = Function(`"use strict"; return (${jsonMatch[1]})`)();
          const flatData = this.flattenObject(rawObj);
          return { scope, domain: 'locales', lang: targetLang, data: flatData };
        }
        return { scope, domain: 'locales', lang: targetLang, data: {} };
      } catch (err: any) {
        throw new BadRequestException(
          `Không thể đọc tệp dịch Frontend: ${err.message}`,
        );
      }
    }

    throw new NotFoundException('Scope dịch không hợp lệ!');
  }

  async updateTranslations(
    scope: string,
    domain: string,
    lang: string,
    flatPayload: Record<string, string>,
  ) {
    const targetLang = (lang || 'vi').toLowerCase();

    if (scope === 'backend') {
      const dirPath = path.join(this.backendI18nPath, targetLang);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const filePath = path.join(dirPath, `${domain}.json`);
      const nestedObj = this.unflattenObject(flatPayload);
      fs.writeFileSync(filePath, JSON.stringify(nestedObj, null, 2), 'utf-8');
      return {
        success: true,
        message: `Đã cập nhật tệp dịch Backend ${domain}.json cho ngôn ngữ ${targetLang} thành công!`,
      };
    }

    if (scope === 'frontend') {
      const dirPath = this.frontendLocalesPath;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const filePath = path.join(dirPath, `${targetLang}.ts`);
      const nestedObj = this.unflattenObject(flatPayload);
      const tsContent = `export default ${JSON.stringify(nestedObj, null, 2)};\n`;
      fs.writeFileSync(filePath, tsContent, 'utf-8');
      return {
        success: true,
        message: `Đã cập nhật tệp dịch Frontend ${targetLang}.ts thành công!`,
      };
    }

    throw new BadRequestException('Scope cập nhật không hợp lệ!');
  }

  async addLanguage(dto: { code: string; name?: string; cloneFrom?: string }) {
    const cleanCode = dto.code.trim().toLowerCase();
    if (!cleanCode || !/^[a-z]{2,5}$/.test(cleanCode)) {
      throw new BadRequestException(
        'Mã ngôn ngữ (ISO Code) phải chứa từ 2-5 ký tự chữ cái (Ví dụ: zh, ja, kr)!',
      );
    }

    const templateLang = (dto.cloneFrom || 'vi').toLowerCase();

    // 1. Create Backend i18n directory and copy JSON templates
    const templateBackendDir = path.join(this.backendI18nPath, templateLang);
    const targetBackendDir = path.join(this.backendI18nPath, cleanCode);

    if (!fs.existsSync(targetBackendDir)) {
      fs.mkdirSync(targetBackendDir, { recursive: true });
    }

    if (fs.existsSync(templateBackendDir)) {
      const files = fs.readdirSync(templateBackendDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.copyFileSync(
            path.join(templateBackendDir, file),
            path.join(targetBackendDir, file),
          );
        }
      }
    }

    // 2. Create Frontend Locales file and copy template
    const templateFrontendFile = path.join(
      this.frontendLocalesPath,
      `${templateLang}.ts`,
    );
    const targetFrontendFile = path.join(
      this.frontendLocalesPath,
      `${cleanCode}.ts`,
    );

    if (fs.existsSync(templateFrontendFile)) {
      fs.copyFileSync(templateFrontendFile, targetFrontendFile);
    } else {
      fs.writeFileSync(targetFrontendFile, `export default {};\n`, 'utf-8');
    }

    return {
      success: true,
      message: `Đã khởi tạo thành công gói ngôn ngữ mới [${cleanCode}] từ bản mẫu [${templateLang}]!`,
      language: {
        code: cleanCode,
        name:
          KNOWN_LANGUAGES[cleanCode] ||
          dto.name ||
          `🌐 Ngôn Ngữ (${cleanCode})`,
      },
    };
  }

  async deleteLanguage(code: string) {
    const cleanCode = code.trim().toLowerCase();
    if (cleanCode === 'vi' || cleanCode === 'en') {
      throw new BadRequestException(
        'Không thể xóa ngôn ngữ mặc định (vi, en) của hệ thống!',
      );
    }

    // Delete Backend directory
    const targetBackendDir = path.join(this.backendI18nPath, cleanCode);
    if (fs.existsSync(targetBackendDir)) {
      fs.rmSync(targetBackendDir, { recursive: true, force: true });
    }

    // Delete Frontend locale file
    const targetFrontendFile = path.join(
      this.frontendLocalesPath,
      `${cleanCode}.ts`,
    );
    if (fs.existsSync(targetFrontendFile)) {
      fs.unlinkSync(targetFrontendFile);
    }

    return {
      success: true,
      message: `Đã xóa gói ngôn ngữ [${cleanCode}] khỏi hệ thống thành công!`,
    };
  }
}
