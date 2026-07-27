import { useEffect } from 'react';
import { useSystemOptions } from '../hooks/useSystemOptions';

// Áp dụng siteTitle/siteFavicon (Settings -> Cài Đặt Chung) vào <title>/<link rel="icon"> thật
// của trang — trước đây 2 setting này chỉ lưu DB, không có nơi nào đọc lại/áp dụng.
export function SiteMetaSync() {
  const { data: options } = useSystemOptions();

  useEffect(() => {
    if (!options) return;

    if (options.siteTitle) {
      document.title = options.siteTitle;
    }

    if (options.siteFavicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = options.siteFavicon;
    }
  }, [options]);

  return null;
}

export default SiteMetaSync;
