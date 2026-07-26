import { message } from 'antd';
import i18n from '../i18n/config';

/**
 * Utility Toast & Notification toàn cục tích hợp sẵn i18n
 * Giúp hiển thị thông báo ngắn gọn, tự động dịch đa ngôn ngữ mà không cần viết lại `t(...)` ở nhiều nơi.
 */
export const notify = {
  /**
   * Hiển thị thông báo thành công
   * @param keyOrMsg Mã i18n key (ví dụ 'messages.SUCCESS') hoặc câu thông báo trực tiếp
   * @param fallback Mẫu văn bản mặc định nếu chưa khai báo key trong i18n
   * @param params Tham số biến số truyền vào i18n (nếu có)
   */
  success: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    message.success(text);
  },

  /**
   * Hiển thị thông báo lỗi
   * @param errorOrKey Object lỗi Axios, mã i18n key hoặc văn bản lỗi
   * @param fallback Mẫu văn bản mặc định
   * @param params Tham số biến số truyền vào i18n
   */
  error: (errorOrKey: any, fallback?: string, params?: Record<string, any>) => {
    let msgText = '';
    if (typeof errorOrKey === 'string') {
      msgText = i18n.t(errorOrKey, { defaultValue: fallback || errorOrKey, ...params });
    } else if (errorOrKey?.response?.data?.message) {
      msgText = errorOrKey.response.data.message;
    } else if (errorOrKey?.message) {
      msgText = errorOrKey.message;
    } else {
      msgText = fallback || 'Đã có lỗi xảy ra, vui lòng thử lại sau!';
    }
    message.error(msgText);
  },

  /**
   * Hiển thị thông báo cảnh báo
   */
  warning: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    message.warning(text);
  },

  /**
   * Hiển thị thông báo tin tức / thông tin
   */
  info: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    message.info(text);
  },
};
