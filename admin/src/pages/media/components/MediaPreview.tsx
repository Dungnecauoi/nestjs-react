import React from 'react';
import { Image } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface MediaPreviewItem {
  mimetype: string;
  url: string;
  filename: string;
}

interface MediaPreviewProps {
  item: MediaPreviewItem;
  // 'lightbox' (fullscreen dark modal, autoplay video, plain <img>) vs 'drawer' (chi tiết bên
  // phải, ảnh zoom được qua antd Image, video không autoplay) — 2 nơi có hành vi khác nhau nên
  // giữ nguyên qua variant thay vì ép chung 1 output.
  variant: 'lightbox' | 'drawer';
}

// Preview lớn/playable dùng chung cho Lightbox + Drawer chi tiết (trước đây copy-paste độc lập
// cùng 1 nhánh if/else theo mimetype ở 2 file). Không dùng cho preview nhỏ table/grid — xem
// MediaThumbnail.tsx cho việc đó.
export const MediaPreview: React.FC<MediaPreviewProps> = ({ item, variant }) => {
  const { t } = useTranslation();
  const isLightbox = variant === 'lightbox';

  if (item.mimetype?.startsWith('image/')) {
    return isLightbox ? (
      <img src={item.url} alt={item.filename} style={{ maxHeight: 540, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
    ) : (
      <Image src={item.url} style={{ maxHeight: 240, objectFit: 'contain' }} />
    );
  }

  if (item.mimetype?.startsWith('video/')) {
    return isLightbox ? (
      <video src={item.url} controls autoPlay style={{ maxHeight: 540, maxWidth: '100%', borderRadius: 8 }} />
    ) : (
      <video src={item.url} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
    );
  }

  if (item.mimetype?.startsWith('audio/')) {
    return <CustomAudioPlayer url={item.url} filename={item.filename} />;
  }

  return isLightbox ? (
    <div style={{ color: '#ffffff', textAlign: 'center', padding: 40 }}>
      <FileTextOutlined style={{ fontSize: 64, color: '#6366f1' }} />
      <p style={{ marginTop: 12, fontSize: 14 }}>
        {t('media.documentFilePreview', `Tập tin tài liệu (${item.mimetype})`, { mimetype: item.mimetype })}
      </p>
    </div>
  ) : (
    <FileTextOutlined style={{ fontSize: 64, color: '#ffffff' }} />
  );
};
