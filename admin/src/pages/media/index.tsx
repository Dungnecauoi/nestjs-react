import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
  Table,
  Tag,
  Button,
  Modal,
  Upload,
  Space,
  Card,
  Image,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Drawer,
  Form,
  Divider,
  Popconfirm,
  Radio,
  Tooltip,
  Pagination,
  message,
} from 'antd';
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
  CustomerServiceOutlined,
  FileOutlined,
  SwapOutlined,
  ScissorOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  LockOutlined,
  UnlockOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { mediaApi, MediaItem } from '../../api/modules/media.api';
import { RefreshCw, Search } from 'lucide-react';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';

export default function MediaModule() {
  const { t } = useTranslation();
  const [detailForm] = Form.useForm();
  const cropperRef = useRef<ReactCropperElement>(null);

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  // Selected Attachment for Details Drawer
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  // Image Cropper Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cropCoords, setCropCoords] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Explicit Target Dimensions Inputs State
  const [targetWidth, setTargetWidth] = useState<number | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  const [lockAspect, setLockAspect] = useState<boolean>(false);
  const [savingCrop, setSavingCrop] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const { data: mediaResponse, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['media', page, pageSize, typeFilter, searchText],
    queryFn: () => mediaApi.getMediaList({
      page,
      limit: pageSize,
      search: searchText,
      mimetype: typeFilter !== 'all' ? typeFilter : undefined,
    }),
    enabled: isAuthenticated,
  });

  const mediaList = mediaResponse?.data || [];
  const total = mediaResponse?.meta?.total || 0;

  const handleCropperCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const data = cropper.getData(true);
    setCropCoords({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    });

    const imageProps = cropper.getImageData();
    if (imageProps) {
      setOriginalSize({
        width: imageProps.naturalWidth,
        height: imageProps.naturalHeight,
      });
    }

    setTargetWidth(data.width);
    setTargetHeight(data.height);
  };

  const handleTargetWidthChange = (val: number | null) => {
    setTargetWidth(val);
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !val || val <= 0) return;

    const data = cropper.getData(true);
    if (lockAspect && data.width > 0) {
      const ratio = data.height / data.width;
      const newH = Math.round(val * ratio);
      setTargetHeight(newH);
      cropper.setData({ ...data, width: val, height: newH });
    } else {
      cropper.setData({ ...data, width: val });
    }
  };

  const handleTargetHeightChange = (val: number | null) => {
    setTargetHeight(val);
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !val || val <= 0) return;

    const data = cropper.getData(true);
    if (lockAspect && data.height > 0) {
      const ratio = data.width / data.height;
      const newW = Math.round(val * ratio);
      setTargetWidth(newW);
      cropper.setData({ ...data, width: newW, height: val });
    } else {
      cropper.setData({ ...data, height: val });
    }
  };

  const applyPresetSize = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
    setAspect(w / h);

    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(w / h);
      const data = cropper.getData(true);
      cropper.setData({ ...data, width: w, height: h });
    }
  };

  const handleRotate = (degree: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(degree);
    }
  };

  const handleZoom = (ratio: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(ratio);
    }
  };

  const handleFlipX = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const scaleX = cropper.getData().scaleX || 1;
      cropper.scaleX(-scaleX);
    }
  };

  const handleFlipY = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const scaleY = cropper.getData().scaleY || 1;
      cropper.scaleY(-scaleY);
    }
  };

  const handleResetCropper = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
      setAspect(undefined);
    }
  };

  const handleCustomUpload = async ({ file }: any) => {
    setUploading(true);
    try {
      await mediaApi.uploadMedia(file);
      message.success(t('media.uploadSuccess', 'Tải lên tập tin mới thành công!'));
      setIsUploadModalOpen(false);
      refetch();
    } catch {
      message.error(t('media.uploadError', 'Không thể tải lên tập tin!'));
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceFile = async ({ file }: any) => {
    if (!selectedMedia) return;
    setReplacing(true);
    try {
      const updatedItem = await mediaApi.replaceMedia(selectedMedia.id, file);
      message.success(t('media.replaceSuccess', 'Đã tải tệp mới thay thế tệp cũ thành công!'));
      if (updatedItem) {
        setSelectedMedia(updatedItem);
      }
      refetch();
    } catch {
      message.error(t('media.replaceError', 'Không thể thay thế tập tin!'));
    } finally {
      setReplacing(false);
    }
  };

  const handleSaveCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !selectedMedia) return;

    setSavingCrop(true);
    const canvas = cropper.getCroppedCanvas({
      width: targetWidth && targetWidth > 0 ? targetWidth : undefined,
      height: targetHeight && targetHeight > 0 ? targetHeight : undefined,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!canvas) {
      message.error('Không thể cắt hình ảnh!');
      setSavingCrop(false);
      return;
    }

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          message.error('Không thể tạo file ảnh sau khi cắt!');
          setSavingCrop(false);
          return;
        }

        try {
          const croppedFile = new File([blob], selectedMedia.filename, {
            type: 'image/jpeg',
          });

          const updatedMedia = await mediaApi.replaceMedia(selectedMedia.id, croppedFile);
          message.success(`Đã cắt & resize ảnh chuẩn WordPress thành công (${canvas.width} × ${canvas.height} px)!`);
          if (updatedMedia) {
            setSelectedMedia(updatedMedia);
          }
          setIsCropModalOpen(false);
          refetch();
        } catch {
          message.error('Không thể lưu ảnh đã cắt!');
        } finally {
          setSavingCrop(false);
        }
      },
      'image/jpeg',
      0.95,
    );
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await mediaApi.deleteMedia(id);
      message.success(t('media.deleteSuccess', 'Đã xóa tập tin khỏi hệ thống!'));
      setIsDrawerOpen(false);
      setSelectedMedia(null);
      refetch();
    } catch {
      message.error(t('media.deleteError', 'Không thể xóa tập tin!'));
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
      message.success(t('media.updateSuccess', 'Đã cập nhật thông tin tập tin thành công!'));
      refetch();
    } catch {
      message.error(t('media.updateError', 'Không thể cập nhật thông tin tập tin!'));
    } finally {
      setSavingDetail(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    message.success(t('media.copyUrlSuccess', 'Đã sao chép đường dẫn URL vào clipboard!'));
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const columns: ColumnsType<MediaItem> = [
    {
      title: t('media.preview', 'Xem Trước'),
      dataIndex: 'url',
      key: 'url',
      width: 90,
      render: (url: string, record: MediaItem) => (
        record.mimetype?.startsWith('image/') ? (
          <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} preview={false} onClick={() => handleOpenDetail(record)} />
        ) : record.mimetype?.startsWith('video/') ? (
          <div
            onClick={() => handleOpenDetail(record)}
            style={{ width: 48, height: 48, backgroundColor: '#e0f2fe', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <VideoCameraOutlined style={{ fontSize: 20, color: '#0284c7' }} />
          </div>
        ) : record.mimetype?.startsWith('audio/') ? (
          <div
            onClick={() => handleOpenDetail(record)}
            style={{ width: 48, height: 48, backgroundColor: '#fce7f3', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <CustomerServiceOutlined style={{ fontSize: 20, color: '#db2777' }} />
          </div>
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
      title: t('media.filename', 'Tên Tập Tin'),
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
      title: t('media.altText', 'Alt Text'),
      dataIndex: 'altText',
      key: 'altText',
      render: (alt: string) => alt || <span style={{ color: '#94a3b8' }}>—</span>,
    },
    {
      title: t('media.mimetype', 'Loại Tập Tin'),
      dataIndex: 'mimetype',
      key: 'mimetype',
      width: 140,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: t('media.size', 'Dung Lượng'),
      dataIndex: 'size',
      key: 'size',
      width: 110,
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: t('media.createdAt', 'Ngày Tải Lên'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => date,
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 100,
      render: (_: any, record: MediaItem) => (
        <Can permission="media:delete">
          <Popconfirm
            title={t('media.confirmDeletePermanently', 'Xóa vĩnh viễn tập tin này?')}
            onConfirm={() => handleDeleteMedia(record.id)}
            okText={t('table.delete', 'Xóa')}
            cancelText={t('common.cancel', 'Hủy')}
          >
            <Button size="small" danger icon={<DeleteOutlined style={{ fontSize: 13 }} />} />
          </Popconfirm>
        </Can>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Controls Card */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('media.title', 'Quản Lý Media & Tập Tin')}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12 }}>
              {t('media.subtitle', 'Thư viện quản lý hình ảnh, video, âm thanh (.mp3) và tài liệu hệ thống')}
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
              {t('table.refresh', 'Làm Mới')}
            </Button>

            <Can permission="media:create">
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)} style={{ fontWeight: 700 }}>
                {t('media.uploadBtn', 'Tải Tập Tin Mới')}
              </Button>
            </Can>
          </Space>
        </div>

        {/* Filter Toolbar */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            style={{ width: 220, borderRadius: 6 }}
            options={[
              { value: 'all', label: t('media.filterAll', 'Tất Cả Loại Tập Tin') },
              { value: 'image', label: t('media.filterImages', '🖼️ Hình Ảnh (.jpg, .png, .webp)') },
              { value: 'video', label: t('media.filterVideo', '🎥 Video (.mp4, .webm)') },
              { value: 'audio', label: t('media.filterAudio', '🎵 Âm Thanh (.mp3, .wav, .aac)') },
              { value: 'document', label: t('media.filterDocument', '📄 Tài Liệu (.pdf, .doc...)') },
            ]}
          />

          <Input
            prefix={<Search style={{ width: 14, height: 14, color: '#94a3b8' }} />}
            placeholder={t('media.searchPlaceholder', 'Tìm kiếm theo tên tập tin, tiêu đề...')}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* Main View: Grid vs Table */}
      {viewMode === 'grid' ? (
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
          <Row gutter={[16, 16]}>
            {mediaList.map((item) => (
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
                  ) : item.mimetype?.startsWith('audio/') ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <CustomerServiceOutlined style={{ fontSize: 32, color: '#db2777' }} />
                      <span style={{ fontSize: 10, marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>Audio</span>
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
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
            />
          </div>
        </Card>
      ) : (
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
          <Table
            columns={columns}
            dataSource={mediaList}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        </Card>
      )}

      {/* Media Details & Edit Drawer */}
      <Drawer
        title={t('media.attachmentDetails', 'Chi Tiết & Sửa Tập Tin Media')}
        placement="right"
        width={540}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedMedia && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Preview Box for Image, Video, Audio & File */}
            <div style={{ width: '100%', backgroundColor: '#09090b', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              {selectedMedia.mimetype?.startsWith('image/') ? (
                <Image src={selectedMedia.url} style={{ maxHeight: 240, objectFit: 'contain' }} />
              ) : selectedMedia.mimetype?.startsWith('video/') ? (
                <video src={selectedMedia.url} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
              ) : selectedMedia.mimetype?.startsWith('audio/') ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <CustomerServiceOutlined style={{ fontSize: 48, color: '#ec4899' }} />
                  <audio src={selectedMedia.url} controls style={{ width: '100%' }} />
                </div>
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
                      onClick={() => setIsCropModalOpen(true)}
                      style={{ borderRadius: 6, fontWeight: 600, backgroundColor: '#2563eb', color: '#ffffff' }}
                    >
                      {t('media.cropImageBtn', 'Cắt & Chỉnh Sửa Ảnh')}
                    </Button>
                  )}

                  <Upload customRequest={handleReplaceFile} showUploadList={false} disabled={replacing}>
                    <Button size="small" icon={<SwapOutlined />} loading={replacing} style={{ borderRadius: 6, fontWeight: 600 }}>
                      {t('media.replaceFileBtn', 'Tải Tệp Mới Thay Thế Tệp Cũ')}
                    </Button>
                  </Upload>
                </Space>
              </Can>
            </div>

            {/* Metadata Section */}
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12 }}>
              <div><strong>{t('media.filename', 'Tên tập tin')}:</strong> {selectedMedia.filename}</div>
              <div><strong>{t('media.mimetype', 'Loại tập tin')}:</strong> {selectedMedia.mimetype}</div>
              <div><strong>{t('media.size', 'Dung lượng')}:</strong> {(selectedMedia.size / 1024).toFixed(1)} KB</div>
              <div><strong>{t('media.createdAt', 'Ngày tải lên')}:</strong> {selectedMedia.createdAt}</div>
            </div>

            {/* Copy URL Field */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>{t('media.fileUrl', 'URL Đường Dẫn Tập Tin')}:</label>
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
                    {t('media.copyUrl', 'Sao Chép URL')}
                  </Button>
                }
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Editable Attributes Form (Title, Alt Text, Caption, Description) */}
            <Form form={detailForm} layout="vertical" onFinish={handleSaveDetail}>
              <Form.Item name="altText" label={t('media.altText', 'Alt Text (Văn bản thay thế)')} extra={t('media.altTextHelp', 'Mô tả hình ảnh cho SEO và trình đọc màn hình')}>
                <Input placeholder="Văn bản thay thế..." style={{ borderRadius: 6 }} />
              </Form.Item>

              <Form.Item name="title" label={t('media.fileTitle', 'Tiêu Đề Tập Tin')}>
                <Input placeholder="Tiêu đề tập tin..." style={{ borderRadius: 6 }} />
              </Form.Item>

              <Form.Item name="caption" label={t('media.caption', 'Chú Thích (Caption)')}>
                <Input.TextArea rows={2} placeholder="Chú thích hiển thị dưới ảnh/video..." style={{ borderRadius: 6 }} />
              </Form.Item>

              <Form.Item name="description" label={t('media.description', 'Mô Tả Chi Tiết')}>
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết tập tin..." style={{ borderRadius: 6 }} />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <Can permission="media:delete">
                  <Popconfirm
                    title={t('media.confirmDeletePermanently', 'Xóa vĩnh viễn tập tin này?')}
                    onConfirm={() => handleDeleteMedia(selectedMedia.id)}
                    okText={t('table.delete', 'Xóa')}
                    cancelText={t('common.cancel', 'Hủy')}
                  >
                    <Button danger type="link">
                      {t('media.deletePermanently', 'Xóa Vĩnh Viễn')}
                    </Button>
                  </Popconfirm>
                </Can>

                <Button type="primary" htmlType="submit" loading={savingDetail} style={{ fontWeight: 700, borderRadius: 6 }}>
                  {t('media.saveUpdates', 'Lưu Cập Nhật')}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Drawer>

      {/* WordPress Standard Interactive Image Cropper (cropperjs with 8 Resizable Handles) */}
      {selectedMedia && selectedMedia.mimetype?.startsWith('image/') && (
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800 }}>
              <ScissorOutlined style={{ color: '#2563eb' }} />
              {t('media.cropModalTitle', 'Chỉnh Sửa & Cắt Ảnh Chuẩn WordPress (Interactive Marquee & Handles)')}
            </span>
          }
          open={isCropModalOpen}
          onCancel={() => setIsCropModalOpen(false)}
          onOk={handleSaveCrop}
          confirmLoading={savingCrop}
          okText={t('media.saveCrop', 'Lưu Ảnh Đã Cắt')}
          cancelText={t('common.cancel', 'Hủy')}
          width={820}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {/* Real-time Dimensions Metrics Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 13,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Ảnh gốc: </span>
                  <strong style={{ color: '#f8fafc' }}>
                    {originalSize.width > 0 ? `${originalSize.width} × ${originalSize.height} px` : 'Đang đo...'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>Tọa độ (X, Y): </span>
                  <span style={{ color: '#f8fafc', fontFamily: 'monospace', fontWeight: 700 }}>
                    ({cropCoords.x}, {cropCoords.y})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CompressOutlined style={{ color: '#38bdf8' }} />
                <span style={{ color: '#94a3b8' }}>Khung cắt hiện tại: </span>
                <Tag color="blue" style={{ fontSize: 13, fontWeight: 800, padding: '2px 10px', borderRadius: 6, margin: 0 }}>
                  {cropCoords.width} × {cropCoords.height} px
                </Tag>
              </div>
            </div>

            {/* Target Dimensions Inputs */}
            <Card size="small" style={{ backgroundColor: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Kích Thước Xuất Tùy Chỉnh:</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InputNumber
                      value={targetWidth}
                      onChange={handleTargetWidthChange}
                      min={10}
                      max={8000}
                      addonAfter="px"
                      placeholder="Rộng"
                      style={{ width: 130 }}
                    />

                    <span style={{ fontWeight: 700, color: '#64748b' }}>×</span>

                    <InputNumber
                      value={targetHeight}
                      onChange={handleTargetHeightChange}
                      min={10}
                      max={8000}
                      addonAfter="px"
                      placeholder="Cao"
                      style={{ width: 130 }}
                    />

                    <Tooltip title={lockAspect ? 'Đang khóa tỷ lệ khung hình' : 'Đang mở tỷ lệ tự do'}>
                      <Button
                        type={lockAspect ? 'primary' : 'default'}
                        icon={lockAspect ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => {
                          const nextLock = !lockAspect;
                          setLockAspect(nextLock);
                          const cropper = cropperRef.current?.cropper;
                          if (cropper) {
                            cropper.setAspectRatio(nextLock && targetWidth && targetHeight ? targetWidth / targetHeight : NaN);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Quick Presets */}
                <Space wrap size="small">
                  <span style={{ fontSize: 11, color: '#64748b' }}>Presets:</span>
                  <Button size="small" onClick={() => applyPresetSize(800, 800)}>800x800</Button>
                  <Button size="small" onClick={() => applyPresetSize(1200, 630)}>1200x630 (FB)</Button>
                  <Button size="small" onClick={() => applyPresetSize(1920, 1080)}>1920x1080 (HD)</Button>
                  <Button size="small" onClick={() => applyPresetSize(1080, 1920)}>1080x1920</Button>
                </Space>
              </div>
            </Card>

            {/* WordPress Cropper Canvas (cropperjs instance) */}
            <div style={{ width: '100%', height: 420, backgroundColor: '#09090b', borderRadius: 8, overflow: 'hidden' }}>
              <Cropper
                ref={cropperRef}
                src={selectedMedia.url}
                style={{ height: 420, width: '100%' }}
                aspectRatio={aspect}
                guides={true}
                viewMode={1}
                minCropBoxWidth={20}
                minCropBoxHeight={20}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                checkOrientation={false}
                crop={handleCropperCrop}
              />
            </div>

            {/* Cropper Toolbar Controls (Rotate, Zoom, Flip, Reset) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, flexWrap: 'wrap', gap: 12 }}>
              {/* Aspect Ratio Presets */}
              <div>
                <Radio.Group
                  value={aspect}
                  onChange={(e) => {
                    setAspect(e.target.value);
                    const cropper = cropperRef.current?.cropper;
                    if (cropper) {
                      cropper.setAspectRatio(e.target.value !== undefined ? e.target.value : NaN);
                    }
                  }}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value={undefined}>Tự Do (Freeform)</Radio.Button>
                  <Radio.Button value={1 / 1}>1:1 (Vuông)</Radio.Button>
                  <Radio.Button value={16 / 9}>16:9 (Widescreen)</Radio.Button>
                  <Radio.Button value={4 / 3}>4:3 (Chuẩn)</Radio.Button>
                  <Radio.Button value={9 / 16}>9:16 (Story)</Radio.Button>
                </Radio.Group>
              </div>

              {/* Manipulation Buttons */}
              <Space wrap>
                <Tooltip title="Xoay trái 90°">
                  <Button icon={<RotateLeftOutlined />} onClick={() => handleRotate(-90)} />
                </Tooltip>
                <Tooltip title="Xoay phải 90°">
                  <Button icon={<RotateRightOutlined />} onClick={() => handleRotate(90)} />
                </Tooltip>
                <Tooltip title="Phóng to">
                  <Button icon={<ZoomInOutlined />} onClick={() => handleZoom(0.1)} />
                </Tooltip>
                <Tooltip title="Thu nhỏ">
                  <Button icon={<ZoomOutOutlined />} onClick={() => handleZoom(-0.1)} />
                </Tooltip>
                <Tooltip title="Lật ngang (Flip Horizontal)">
                  <Button icon={<SwapOutlined />} onClick={handleFlipX} />
                </Tooltip>
                <Tooltip title="Lật dọc (Flip Vertical)">
                  <Button icon={<VerticalAlignMiddleOutlined />} onClick={handleFlipY} />
                </Tooltip>
                <Button danger type="dashed" onClick={handleResetCropper}>
                  Đặt Lại (Reset)
                </Button>
              </Space>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Media Modal */}
      <Modal
        title={t('media.uploadModalTitle', 'Tải Lên Tập Tin Media Mới')}
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
            Hỗ trợ hình ảnh (.jpg, .png, .webp, .gif), video (.mp4, .webm), âm thanh (.mp3, .wav) và tài liệu (.pdf, .docx...).
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
}
