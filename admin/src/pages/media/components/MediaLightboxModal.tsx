import React, { useEffect } from 'react';
import { Modal, Space, Button } from 'antd';
import { DownloadOutlined, CopyOutlined, LeftOutlined, RightOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MediaItem } from '../../../api/modules/media.api';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: MediaItem | null;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onCopyUrl: (url: string) => void;
  onOpenDetail: (item: MediaItem) => void;
  formatBytes: (bytes: number) => string;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onCopyUrl,
  onOpenDetail,
  formatBytes,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext]);

  if (!currentItem) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      styles={{ body: { padding: 0, backgroundColor: '#09090b', borderRadius: 12, overflow: 'hidden' } }}
      closeIcon={<span style={{ color: '#ffffff', fontSize: 18, fontWeight: 700 }}>✕</span>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
          <div style={{ overflow: 'hidden', paddingRight: 12 }}>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentItem.filename}
            </h3>
            <span style={{ fontSize: 12, color: '#a1a1aa' }}>
              {formatBytes(currentItem.size)} • {currentItem.mimetype}
            </span>
          </div>

          <Space style={{ marginRight: 40 }}>
            <Button size="small" icon={<CopyOutlined />} onClick={() => onCopyUrl(currentItem.url)}>
              Sao Chép Link
            </Button>
            <a href={currentItem.url} download target="_blank" rel="noreferrer">
              <Button type="primary" icon={<DownloadOutlined />} size="small">
                {t('media.downloadOriginal', 'Tải Gốc')}
              </Button>
            </a>
            <Button
              size="small"
              onClick={() => {
                onClose();
                onOpenDetail(currentItem);
              }}
            >
              Sửa Chi Tiết
            </Button>
          </Space>
        </div>

        {/* Media Content */}
        <div style={{ minHeight: 400, maxHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', position: 'relative', padding: 16 }}>
          {currentIndex > 0 && (
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              style={{ position: 'absolute', left: 16, zIndex: 10, opacity: 0.8 }}
            />
          )}

          {currentItem.mimetype?.startsWith('image/') ? (
            <img
              src={currentItem.url}
              alt={currentItem.filename}
              style={{ maxHeight: 540, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          ) : currentItem.mimetype?.startsWith('video/') ? (
            <video
              src={currentItem.url}
              controls
              autoPlay
              style={{ maxHeight: 540, maxWidth: '100%', borderRadius: 8 }}
            />
          ) : currentItem.mimetype?.startsWith('audio/') ? (
            <CustomAudioPlayer url={currentItem.url} filename={currentItem.filename} />
          ) : (
            <div style={{ color: '#ffffff', textAlign: 'center', padding: 40 }}>
              <FileTextOutlined style={{ fontSize: 64, color: '#6366f1' }} />
              <p style={{ marginTop: 12, fontSize: 14 }}>Tập tin tài liệu ({currentItem.mimetype})</p>
            </div>
          )}

          {currentIndex < totalCount - 1 && (
            <Button
              shape="circle"
              icon={<RightOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              style={{ position: 'absolute', right: 16, zIndex: 10, opacity: 0.8 }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
