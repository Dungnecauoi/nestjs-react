import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Upload, Space, Card, Image, Select, Input, Row, Col, Drawer, Form, Divider, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  UploadOutlined,
  CopyOutlined,
  CheckOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { mediaApi, MediaItem } from '../../api/modules/media.api';
import { RefreshCw, Search } from 'lucide-react';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';

export default function MediaModule() {
  const { t } = useTranslation();
  const [detailForm] = Form.useForm();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Selected Attachment for WordPress Details Drawer
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const { data: mediaList = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['media'],
    queryFn: mediaApi.getMediaList,
    enabled: isAuthenticated,
  });

  const handleCustomUpload = async ({ file }: any) => {
    setUploading(true);
    try {
      await mediaApi.uploadMedia(file);
      message.success('Tải lên tập tin mới thành công!');
      setIsUploadModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể tải lên tập tin!');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await mediaApi.deleteMedia(id);
      message.success('Đã xóa tập tin khỏi hệ thống!');
      setIsDrawerOpen(false);
      setSelectedMedia(null);
      refetch();
    } catch {
      message.error('Không thể xóa tập tin!');
    }
  };

  const handleOpenDetail = (item: MediaItem) => {
    setSelectedMedia(item);
    detailForm.setFieldsValue({
      title: item.title || item.filename,
      altText: item.altText || '',
      caption: item.caption || '',
      description: item.description || '',
    });
    setIsDrawerOpen(true);
  };

  const handleSaveDetail = async (values: any) => {
    if (!selectedMedia) return;
    setSavingDetail(true);
    try {
      await mediaApi.updateMedia(selectedMedia.id, values);
      message.success('Đã cập nhật thông tin tập tin WordPress!');
      refetch();
    } catch {
      message.error('Không thể cập nhật thông tin tập tin!');
    } finally {
      setSavingDetail(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    message.success('Đã sao chép đường dẫn URL vào clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filter items by type and search query
  const filteredList = mediaList.filter((item) => {
    if (typeFilter === 'image' && !item.mimetype?.startsWith('image/')) return false;
    if (typeFilter === 'video' && !item.mimetype?.startsWith('video/')) return false;
    if (typeFilter === 'document' && (item.mimetype?.startsWith('image/') || item.mimetype?.startsWith('video/'))) return false;

    if (searchText) {
      const q = searchText.toLowerCase();
      const matchName = item.filename?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAlt = item.altText?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchAlt) return false;
    }
    return true;
  });

  const columns: ColumnsType<MediaItem> = [
    {
      title: t('media.preview'),
      dataIndex: 'url',
      key: 'url',
      width: 90,
      render: (url: string, record: MediaItem) => (
        record.mimetype?.startsWith('image/') ? (
          <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} preview={false} onClick={() => handleOpenDetail(record)} />
        ) : (
          <div
            onClick={() => handleOpenDetail(record)}
            style={{ width: 48, height: 48, backgroundColor: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <FileTextOutlined style={{ fontSize: 20, color: '#64748b' }} />
          </div>
        )
      ),
    },
    {
      title: t('media.filename'),
      dataIndex: 'filename',
      key: 'filename',
      render: (name: string, record: MediaItem) => (
        <div>
          <a onClick={() => handleOpenDetail(record)} style={{ fontWeight: 700 }}>
            {record.title || name}
          </a>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{record.filename}</div>
        </div>
      ),
    },
    {
      title: t('media.altText'),
      dataIndex: 'altText',
      key: 'altText',
      render: (alt: string) => alt || <span style={{ color: '#94a3b8' }}>—</span>,
    },
    {
      title: t('media.mimetype'),
      dataIndex: 'mimetype',
      key: 'mimetype',
      width: 140,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: t('media.size'),
      dataIndex: 'size',
      key: 'size',
      width: 110,
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: t('media.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: t('table.actions'),
      key: 'actions',
      width: 100,
      render: (_: any, record: MediaItem) => (
        <Can permission="media:delete">
          <Popconfirm
            title={t('media.confirmDeletePermanently')}
            onConfirm={() => handleDeleteMedia(record.id)}
            okText={t('table.delete')}
            cancelText={t('users.cancel')}
          >
            <Button size="small" danger icon={<DeleteOutlined style={{ fontSize: 13 }} />} />
          </Popconfirm>
        </Can>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* WordPress Top Controls Card */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('media.title')}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12 }}>
              {t('media.subtitle')}
            </p>
          </div>

          <Space wrap>
            {/* View Mode Toggle */}
            <Button.Group>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
              />
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('table')}
              />
            </Button.Group>

            <Button
              icon={<RefreshCw style={{ width: 14, height: 14 }} className={isRefetching ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
              loading={isRefetching}
            >
              {t('users.refresh')}
            </Button>

            <Can permission="media:create">
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)} style={{ fontWeight: 700 }}>
                {t('media.uploadBtn')}
              </Button>
            </Can>
          </Space>
        </div>

        {/* WordPress Filter Toolbar */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: t('media.filterAll') },
              { value: 'image', label: t('media.filterImages') },
              { value: 'video', label: t('media.filterVideo') },
              { value: 'document', label: t('media.filterDocument') },
            ]}
          />

          <Input
            prefix={<Search style={{ width: 14, height: 14, color: '#94a3b8' }} />}
            placeholder={t('media.searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>
      </Card>

      {/* Main View: Grid vs Table */}
      {viewMode === 'grid' ? (
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <Row gutter={[16, 16]}>
            {filteredList.map((item) => (
              <Col key={item.id} xs={12} sm={8} md={6} lg={4} xl={3}>
                <div
                  onClick={() => handleOpenDetail(item)}
                  style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                  }}
                  className="hover:border-indigo-500 hover:shadow-md"
                >
                  {item.mimetype?.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : item.mimetype?.startsWith('video/') ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <VideoCameraOutlined style={{ fontSize: 32, color: '#0284c7' }} />
                      <span style={{ fontSize: 10, marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>Video</span>
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <FileOutlined style={{ fontSize: 32, color: '#64748b' }} />
                      <span style={{ fontSize: 10, marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>File</span>
                    </div>
                  )}

                  {/* Title Bar Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(9, 9, 11, 0.75)',
                      color: '#ffffff',
                      fontSize: 10,
                      padding: '4px 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title || item.filename}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      ) : (
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <Table
            columns={columns}
            dataSource={filteredList}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 12 }}
          />
        </Card>
      )}

      {/* WordPress Attachment Details Drawer */}
      <Drawer
        title={t('media.attachmentDetails')}
        placement="right"
        width={520}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedMedia && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Preview Box */}
            <div style={{ width: '100%', backgroundColor: '#09090b', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedMedia.mimetype?.startsWith('image/') ? (
                <Image src={selectedMedia.url} style={{ maxHeight: 240, objectFit: 'contain' }} />
              ) : selectedMedia.mimetype?.startsWith('video/') ? (
                <video src={selectedMedia.url} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
              ) : (
                <FileTextOutlined style={{ fontSize: 64, color: '#ffffff' }} />
              )}
            </div>

            {/* Metadata Section */}
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12 }}>
              <div><strong>{t('media.filename')}:</strong> {selectedMedia.filename}</div>
              <div><strong>{t('media.mimetype')}:</strong> {selectedMedia.mimetype}</div>
              <div><strong>{t('media.size')}:</strong> {(selectedMedia.size / 1024).toFixed(1)} KB</div>
              <div><strong>{t('media.createdAt')}:</strong> {new Date(selectedMedia.createdAt).toLocaleString('vi-VN')}</div>
            </div>

            {/* Copy URL Field */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>{t('media.fileUrl')}:</label>
              <Input
                value={selectedMedia.url}
                readOnly
                addonAfter={
                  <Button
                    type="link"
                    size="small"
                    icon={copiedUrl ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                    onClick={() => handleCopyUrl(selectedMedia.url)}
                  >
                    {t('media.copyUrl')}
                  </Button>
                }
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* WordPress Editable Attributes Form */}
            <Form form={detailForm} layout="vertical" onFinish={handleSaveDetail}>
              <Form.Item name="altText" label={t('media.altText')} extra={t('media.altTextHelp')}>
                <Input placeholder="Văn bản thay thế..." />
              </Form.Item>

              <Form.Item name="title" label={t('media.fileTitle')}>
                <Input placeholder="Tiêu đề tập tin..." />
              </Form.Item>

              <Form.Item name="caption" label={t('media.caption')}>
                <Input.TextArea rows={2} placeholder="Chú thích hiển thị dưới ảnh..." />
              </Form.Item>

              <Form.Item name="description" label={t('media.description')}>
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết tập tin..." />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <Can permission="media:delete">
                  <Popconfirm
                    title={t('media.confirmDeletePermanently')}
                    onConfirm={() => handleDeleteMedia(selectedMedia.id)}
                    okText={t('media.deletePermanently')}
                    cancelText={t('users.cancel')}
                  >
                    <Button danger type="link">
                      {t('media.deletePermanently')}
                    </Button>
                  </Popconfirm>
                </Can>

                <Button type="primary" htmlType="submit" loading={savingDetail} style={{ fontWeight: 700 }}>
                  {t('media.saveUpdates')}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Drawer>

      {/* Upload Media Modal */}
      <Modal
        title={t('media.uploadModalTitle')}
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
      >
        <Upload.Dragger customRequest={handleCustomUpload} showUploadList={false} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#4f46e5' }} />
          </p>
          <p className="ant-upload-text" style={{ fontWeight: 700 }}>
            Kéo thả hoặc nhấp vào đây để tải lên tập tin Media
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 12, color: '#64748b' }}>
            Hỗ trợ hình ảnh (.jpg, .png, .webp, .gif), video (.mp4, .webm) và các tài liệu.
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
}
