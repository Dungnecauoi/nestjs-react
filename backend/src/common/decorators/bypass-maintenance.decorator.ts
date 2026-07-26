import { SetMetadata } from '@nestjs/common';

export const BYPASS_MAINTENANCE_KEY = 'bypassMaintenance';

/**
 * Đánh dấu route/controller được phép hoạt động ngay cả khi hệ thống đang ở chế độ bảo trì
 * (vd: đăng nhập để admin tắt bảo trì, đọc site settings, health probe cho load balancer).
 * Thay cho cách so khớp chuỗi URL cũ (dễ bị route mới trùng substring bypass nhầm).
 */
export const BypassMaintenance = () => SetMetadata(BYPASS_MAINTENANCE_KEY, true);
