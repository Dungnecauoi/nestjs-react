import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Upload, Input, Pagination, Empty, Spin, Button, message } from 'antd';
import { UploadOutlined, FileTextOutlined, VideoCameraOutlined, CustomerServiceOutlined, FileOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { mediaApi, MediaItem } from '../../api/modules/media.api';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  accept?: string; // vd 'image' — lọc theo mimetype chứa chuỗi này
  title?: string;
}

function FileIcon({ mimetype }: { mimetype: string }) {
  if (mimetype.startsWith('video/')) return <VideoCameraOutlined style={{ fontSize: 32, color: '#7c3aed' }} />;
  if (mimetype.startsWith('audio/')) return <CustomerServiceOutlined style={{ fontSize: 32, color: '#059669' }} />;
  if (mimetype.includes('pdf') || mimetype.includes('document')) return <FileTextOutlined style={{ fontSize: 32, color: '#dc2626' }} />;
  return <FileOutlined style={{ fontSize: 32, color: '#64748b' }} />;
}

// Modal chọn media dùng lại kiểu WP Media Library: browse ảnh/file đã tải lên có sẵn,
// hoặc tải file mới lên, rồi chọn 1 để trả về cho nơi gọi (avatar, ảnh cover...).
export function MediaPickerModal({ open, onClose, onSelect, accept, title = 'Chọn Tập Tin Media' }: MediaPickerModalProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const pageSize = 12;

  const { data: mediaResponse, isLoading, refetch } = useQuery({
    queryKey: ['media-picker', page, search, accept],
    queryFn: () => mediaApi.getMediaList({ page, limit: pageSize, search, mimetype: accept }),
    enabled: open,
  });

  const mediaList = mediaResponse?.data || [];
  const total = mediaResponse?.meta?.total || 0;

  const handleUpload = async (file: RcFile) => {
    setUploading(true);
    try {
      const uploaded = await mediaApi.uploadMedia(file);
      message.success('Đã tải lên tập tin mới!');
      onSelect(uploaded);
      onClose();
    } catch {
      message.error('Tải lên thất bại!');
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên file..."
          allowClear
          onSearch={(val) => {
            setPage(1);
            setSearch(val);
          }}
          style={{ flex: 1 }}
        />
        <Upload beforeUpload={handleUpload} showUploadList={false} accept={accept ? `${accept}/*` : undefined}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            Tải Lên Mới
          </Button>
        </Upload>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : mediaList.length === 0 ? (
        <Empty description="Chưa có tập tin nào" style={{ padding: 40 }} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            maxHeight: 420,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          {mediaList.map((media) => {
            const isImage = media.mimetype.startsWith('image/');
            return (
              <div
                key={media.id}
                onClick={() => {
                  onSelect(media);
                  onClose();
                }}
                style={{
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                }}
                title={media.filename}
              >
                {isImage ? (
                  <img src={media.url} alt={media.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FileIcon mimetype={media.mimetype} />
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    fontSize: 10,
                    padding: '2px 4px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {media.filename}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          size="small"
          showSizeChanger={false}
        />
      </div>
    </Modal>
  );
}

export default MediaPickerModal;
