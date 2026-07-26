export interface DateFormatOptions {
  dateFormat?: string; // 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY'
  timeFormat?: string; // 'HH:mm:ss' | 'hh:mm A'
  timezone?: string; // IANA timezone, vd 'Asia/Ho_Chi_Minh'
}

const DEFAULT_OPTIONS: Required<DateFormatOptions> = {
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  timezone: 'Asia/Ho_Chi_Minh',
};

// Field mang tính dữ liệu chỉnh sửa được qua DatePicker/form -> giữ nguyên ISO, không format hiển thị.
// Thêm field mới vào đây nếu sau này có thêm date field dùng để chỉnh sửa (không phải chỉ hiển thị).
export const NON_DISPLAY_DATE_FIELDS = ['dateOfBirth'];

export function formatDateTime(date: Date, opts: DateFormatOptions = {}): string {
  const dateFormat = opts.dateFormat || DEFAULT_OPTIONS.dateFormat;
  const timeFormat = opts.timeFormat || DEFAULT_OPTIONS.timeFormat;
  const timezone = opts.timezone || DEFAULT_OPTIONS.timezone;

  const parts24 = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const part of parts24) {
    map[part.type] = part.value;
  }
  // Intl trả '24' cho giờ 0h ở 1 số môi trường khi hour12=false, chuẩn hoá về '00'
  if (map.hour === '24') map.hour = '00';

  const datePart = dateFormat
    .replace('YYYY', map.year)
    .replace('MM', map.month)
    .replace('DD', map.day);

  let timePart: string;
  if (timeFormat === 'hh:mm A') {
    const parts12 = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(date);
    const map12: Record<string, string> = {};
    for (const part of parts12) {
      map12[part.type] = part.value;
    }
    timePart = `${map12.hour}:${map12.minute} ${(map12.dayPeriod || '').toUpperCase()}`;
  } else {
    timePart = `${map.hour}:${map.minute}:${map.second}`;
  }

  return `${datePart} ${timePart}`;
}

export function deepFormatDates(
  value: any,
  opts: DateFormatOptions = {},
  excludeKeys: string[] = NON_DISPLAY_DATE_FIELDS,
  key?: string,
): any {
  if (value instanceof Date) {
    if (key && excludeKeys.includes(key)) {
      return value;
    }
    return formatDateTime(value, opts);
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepFormatDates(item, opts, excludeKeys));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = deepFormatDates(v, opts, excludeKeys, k);
    }
    return result;
  }

  return value;
}
