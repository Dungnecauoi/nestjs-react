import React from 'react';
import {
  Drawer,
  Image,
  Space,
  Button,
  Upload,
  Form,
  Input,
  Divider,
  Popconfirm,
  Tag,
  FormInstance,
} from 'antd';
import {
  CustomerServiceOutlined,
  FileTextOutlined,
  ScissorOutlined,
  SwapOutlined,
  CopyOutlined,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MediaItem } from '../../../api/modules/media.api';
import { Can } from '../../../components/common/Can';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface MediaDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedia: MediaItem | null;
  detailForm: FormInstance;
  onSaveDetail: (values: any) => void;
  onDeleteMedia: (id: string) => void;
  onReplaceFile: (options: any) => void;
  onOpenCropModal: () => void;
  onCopyUrl: (url: string) => void;
  copiedUrl: boolean;
  savingDetail: boolean;
  replacing: boolean;
  formatBytes: (bytes: number) => string;
}

export const MediaDetailsDrawer: React.FC<MediaDetailsDrawerProps> = ({
  isOpen,
  onClose,
  selectedMedia,
  detailForm,
  onSaveDetail,
  onDeleteMedia,
  onReplaceFile,
  onOpenCropModal,
  onCopyUrl,
  copiedUrl,
  savingDetail,
  replacing,
  formatBytes,
}) => {
  const { t } = useTranslation();

  if (!selectedMedia) return null;

  return (
    <Drawer
      title={t('media.attachmentDetails', 'Chi Tiết & Sửa Tập Tin Media')}
      placement="right"
      width={540}
      onClose={onClose}
      open={isOpen}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Preview Box for Image, Video, Audio & File */}
        <div style={{ width: '100%', backgroundColor: '#09090b', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          {selectedMedia.mimetype?.startsWith('image/') ? (
            <Image src={selectedMedia.url} style={{ maxHeight: 240, objectFit: 'contain' }} />
          ) : selectedMedia.mimetype?.startsWith('video/') ? (
            <video src={selectedMedia.url} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
          ) : selectedMedia.mimetype?.startsWith('audio/') ? (
            <CustomAudioPlayer url={selectedMedia.url} filename={selectedMedia.filename} />
          ) : (
            <FileTextOutlined style={{ fontSize: 64, color: '#ffffff' }} />
          )}

          {/* Action Buttons: Crop Image & Replace File */}
          <Can permission="media:update">
            <Space wrap>
              {selectedMedia.mimetype?.startsWith('image/') && (
                <Button
                  size="small"
                  icon={<ScissorOutlined />}
                  onClick={onOpenCropModal}
                  style={{ borderRadius: 6, fontWeight: 600, backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  {t('media.cropImageBtn', 'Cắt & Chỉnh Sửa Ảnh')}
                </Button>
              )}

              <Upload customRequest={onReplaceFile} showUploadList={false} disabled={replacing}>
                <Button size="small" icon={<SwapOutlined />} loading={replacing} style={{ borderRadius: 6, fontWeight: 600 }}>
                  {t('media.replaceFileBtn', 'Tải Tệp Mới Thay Thế Tệp Cũ')}
                </Button>
              </Upload>
            </Space>
          </Can>
        </div>

        {/* Metadata Section */}
        <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12 }}>
          <div><strong>{t('media.filename', 'Tên file')}:</strong> {selectedMedia.filename}</div>
          <div><strong>{t('media.mimetype', 'Định dạng')}:</strong> {selectedMedia.mimetype}</div>
          <div><strong>{t('media.size', 'Dung lượng')}:</strong> {formatBytes(selectedMedia.size)}</div>
          <div><strong>{t('media.createdAt', 'Ngày tải lên')}:</strong> {selectedMedia.createdAt}</div>
        </div>

        {/* Copy URL Box */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value={selectedMedia.url} readOnly style={{ borderRadius: 6 }} />
          <Button
            type="primary"
            icon={copiedUrl ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => onCopyUrl(selectedMedia.url)}
            style={{ fontWeight: 600 }}
          >
            {copiedUrl ? 'Đã Chép' : t('media.copyUrl', 'Sao Chép')}
          </Button>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Attachment Properties Form */}
        <Form form={detailForm} layout="vertical" onFinish={onSaveDetail}>
          <Form.Item name="altText" label={t('media.altText', 'Văn Bản Thay Thế (Alt Text)')} extra={t('media.altTextHelp')}>
            <Input placeholder="Mô tả hình ảnh..." />
          </Form.Item>

          <Form.Item name="title" label={t('media.fileTitle', 'Tiêu Đề (Title)')}>
            <Input placeholder="Tiêu đề hình ảnh..." />
          </Form.Item>

          <Form.Item name="caption" label={t('media.caption', 'Chú Thích (Caption)')}>
            <Input.TextArea rows={2} placeholder="Chú thích..." />
          </Form.Item>

          <Form.Item name="description" label={t('media.description', 'Mô Tả (Description)')}>
            <Input.TextArea rows={3} placeholder="Mô tả..." />
          </Form.Item>

          <Can permission="media:update">
            <Button type="primary" htmlType="submit" loading={savingDetail} block style={{ fontWeight: 700 }}>
              {t('media.saveUpdates', 'Lưu Cập Nhật')}
            </Button>
          </Can>
        </Form>

        <Divider style={{ margin: '8px 0' }} />

        <Can permission="media:delete">
          <Popconfirm
            title={t('media.confirmDeletePermanently', 'Xóa tập tin này khỏi thư viện?')}
            onConfirm={() => onDeleteMedia(selectedMedia.id)}
            okText={t('table.delete', 'Xóa')}
            cancelText={t('common.cancel', 'Hủy')}
          >
            <Button danger block icon={<DeleteOutlined />} style={{ fontWeight: 700 }}>
              {t('media.deletePermanently', 'Xóa Tập Tin')}
            </Button>
          </Popconfirm>
        </Can>
      </div>
    </Drawer>
  );
};
