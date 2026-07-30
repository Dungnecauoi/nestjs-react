import { message as staticMessage } from 'antd';
import i18n from '../i18n/config';

let messageInstance: any = staticMessage;

export const setGlobalMessageInstance = (inst: any) => {
  if (inst) {
    messageInstance = inst;
  }
};

/**
 * Utility Toast & Notification toàn cục tích hợp sẵn i18n
 * Giúp hiển thị thông báo ngắn gọn, tự động dịch đa ngôn ngữ mà không cần viết lại `t(...)` ở nhiều nơi.
 */
export const notify = {
  /**
   * Hiển thị thông báo thành công
   */
  success: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    messageInstance.success(text);
  },

  /**
   * Hiển thị thông báo lỗi
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
    messageInstance.error(msgText);
  },

  /**
   * Hiển thị thông báo cảnh báo
   */
  warning: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    messageInstance.warning(text);
  },

  /**
   * Hiển thị thông báo tin tức / thông tin
   */
  info: (keyOrMsg: string, fallback?: string, params?: Record<string, any>) => {
    const text = i18n.t(keyOrMsg, { defaultValue: fallback || keyOrMsg, ...params });
    messageInstance.info(text);
  },
};
