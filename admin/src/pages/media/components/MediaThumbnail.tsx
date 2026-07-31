import React from 'react';
import { Image } from 'antd';
import { VideoCameraOutlined, CustomerServiceOutlined, FileOutlined } from '@ant-design/icons';

interface MediaThumbnailItem {
  mimetype: string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  filename: string;
}

interface MediaThumbnailProps {
  item: MediaThumbnailItem;
  // Bỏ qua khi fill=true (khi đó box lấp đầy 100% parent thay vì kích thước cố định).
  size?: number;
  iconSize: number;
  fill?: boolean;
  showLabel?: boolean;
  borderRadius?: number;
  onClick?: (e: React.MouseEvent) => void;
}

type FallbackKind = 'video' | 'audio' | 'document';

const FALLBACK_STYLES: Record<FallbackKind, { bg: string; color: string; labelColor: string; label: string }> = {
  video: { bg: '#0f172a', color: '#38bdf8', labelColor: '#94a3b8', label: 'Video' },
  audio: { bg: '#18181b', color: '#ec4899', labelColor: '#a1a1aa', label: 'Audio' },
  document: { bg: '#f8fafc', color: '#64748b', labelColor: '#64748b', label: 'Document' },
};

const FALLBACK_ICONS: Record<FallbackKind, React.ComponentType<{ style?: React.CSSProperties }>> = {
  video: VideoCameraOutlined,
  audio: CustomerServiceOutlined,
  document: FileOutlined,
};

// Preview nhỏ dùng chung cho table cell + grid card (2 nơi trước đây copy-paste độc lập cùng 1
// nhánh if/else theo mimetype) — thêm 1 loại mimetype mới giờ chỉ sửa ở đây. Không dùng cho
// preview lớn/playable (lightbox, drawer chi tiết) — xem MediaPreview.tsx cho việc đó.
export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  item,
  size = 48,
  iconSize,
  fill = false,
  showLabel = false,
  borderRadius = 0,
  onClick,
}) => {
  const boxStyle: React.CSSProperties = fill
    ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
    : { width: size, height: size };

  if (item.mimetype?.startsWith('image/')) {
    return fill ? (
      <img src={item.url} alt={item.altText || item.filename} style={{ ...boxStyle, objectFit: 'cover' }} onClick={onClick} />
    ) : (
      <Image src={item.url} width={size} height={size} style={{ objectFit: 'cover', borderRadius }} preview={false} onClick={onClick} />
    );
  }

  const kind: FallbackKind = item.mimetype?.startsWith('video/')
    ? 'video'
    : item.mimetype?.startsWith('audio/')
      ? 'audio'
      : 'document';

  // Video đã có thumbnail thật (do backend tạo qua ffmpeg) thì hiện ảnh chụp thật thay vì icon.
  if (kind === 'video' && item.thumbnailUrl) {
    return fill ? (
      <img src={item.thumbnailUrl} alt={item.altText || item.filename} style={{ ...boxStyle, objectFit: 'cover' }} onClick={onClick} />
    ) : (
      <Image src={item.thumbnailUrl} width={size} height={size} style={{ objectFit: 'cover', borderRadius }} preview={false} onClick={onClick} />
    );
  }

  const { bg, color, labelColor, label } = FALLBACK_STYLES[kind];
  const Icon = FALLBACK_ICONS[kind];

  return (
    <div
      onClick={onClick}
      style={{
        ...boxStyle,
        backgroundColor: bg,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <Icon style={{ fontSize: iconSize, color }} />
      {showLabel && (
        <span style={{ fontSize: 11, marginTop: 6, fontWeight: 700, color: labelColor, textTransform: 'uppercase' }}>{label}</span>
      )}
    </div>
  );
};
