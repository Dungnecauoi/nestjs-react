import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ReactCropperElement } from 'react-cropper';
import {
  Table,
  Button,
  Modal,
  Upload,
  Space,
  Card,
  Image,
  Select,
  Input,
  Row,
  Col,
  Form,
  Popconfirm,
  Tooltip,
  Pagination,
  Checkbox,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  FileOutlined,
  CheckSquareOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { mediaApi, MediaItem } from '../../api/modules/media.api';
import { RefreshCw, Search } from 'lucide-react';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { notify } from '../../utils/notify';

// Modular Child Components
import { MediaAnalyticsHeader } from './components/MediaAnalyticsHeader';
import { MediaBatchActionBar } from './components/MediaBatchActionBar';
import { MediaLightboxModal } from './components/MediaLightboxModal';
import { MediaCropperModal } from './components/MediaCropperModal';
import { MediaDetailsDrawer } from './components/MediaDetailsDrawer';

export default function MediaModule() {
  const { t } = useTranslation();
  const [detailForm] = Form.useForm();
  const cropperRef = useRef<ReactCropperElement>(null);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(36);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Upload & Drag-Drop State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Batch Select State
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected Attachment & Drawer State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Image Cropper State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cropCoords, setCropCoords] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [targetWidth, setTargetWidth] = useState<number | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  const [lockAspect, setLockAspect] = useState<boolean>(false);
  const [savingCrop, setSavingCrop] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const { data: mediaResponse, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['media', page, pageSize, typeFilter, searchText],
    queryFn: () =>
      mediaApi.getMediaList({
        page,
        limit: pageSize,
        search: searchText,
        mimetype: typeFilter !== 'all' ? typeFilter : undefined,
      }),
    enabled: isAuthenticated,
  });

  const mediaList = mediaResponse?.data || [];
  const total = mediaResponse?.meta?.total || 0;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredMediaList = mediaList.filter((item) => {
    if (sizeFilter === 'small') return item.size < 1024 * 1024;
    if (sizeFilter === 'medium') return item.size >= 1024 * 1024 && item.size <= 10 * 1024 * 1024;
    if (sizeFilter === 'large') return item.size > 10 * 1024 * 1024;
    return true;
  });

  const totalCalculatedBytes = mediaList.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const imageCount = mediaList.filter((m) => m.mimetype?.startsWith('image/')).length;
  const videoCount = mediaList.filter((m) => m.mimetype?.startsWith('video/')).length;
  const docCount = mediaList.filter((m) => !m.mimetype?.startsWith('image/') && !m.mimetype?.startsWith('video/')).length;

  // Handlers
  const handleSelectToggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMediaList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMediaList.map((m) => m.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => mediaApi.deleteMedia(id)));
      notify.success(`Đã xóa vĩnh viễn ${selectedIds.length} tập tin media!`);
      setSelectedIds([]);
      refetch();
    } catch {
      notify.error('Không thể xóa hàng loạt tập tin!');
    }
  };

  const handleBatchCopyUrls = () => {
    const selectedItems = mediaList.filter((m) => selectedIds.includes(m.id));
    const urls = selectedItems.map((m) => m.url).join('\n');
    navigator.clipboard.writeText(urls);
    notify.success(`Đã sao chép ${selectedIds.length} đường dẫn URL vào clipboard!`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await mediaApi.uploadMedia(file);
      }
      notify.success(`Đã tải lên ${files.length} tập tin thành công!`);
      refetch();
    } catch (err) {
      notify.error(err, 'Không thể tải tệp lên!');
    } finally {
      setUploading(false);
    }
  };

  const currentLightboxItem = filteredMediaList[lightboxIndex] || null;

  const handleOpenLightbox = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

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
      cropper.setData({ ...data, height: val, width: newW });
    } else {
      cropper.setData({ ...data, height: val });
    }
  };

  const handleCustomUpload = async ({ file }: any) => {
    setUploading(true);
    try {
      await mediaApi.uploadMedia(file);
      notify.success(t('media.uploadSuccess', 'Tải lên tập tin mới thành công!'));
      setIsUploadModalOpen(false);
      refetch();
    } catch (err: any) {
      notify.error(err, t('media.uploadError', 'Không thể tải lên tập tin!'));
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceFile = async ({ file }: any) => {
    if (!selectedMedia) return;
    setReplacing(true);
    try {
      const updatedItem = await mediaApi.replaceMedia(selectedMedia.id, file);
      notify.success(t('media.replaceSuccess', 'Đã tải tệp mới thay thế tệp cũ thành công!'));
      if (updatedItem) {
        setSelectedMedia(updatedItem);
      }
      refetch();
    } catch (err: any) {
      notify.error(err, t('media.replaceError', 'Không thể thay thế tập tin!'));
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
      notify.error('Không thể cắt hình ảnh!');
      setSavingCrop(false);
      return;
    }

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          notify.error('Không thể tạo file ảnh sau khi cắt!');
          setSavingCrop(false);
          return;
        }

        try {
          const croppedFile = new File([blob], selectedMedia.filename, {
            type: 'image/jpeg',
          });

          const updatedMedia = await mediaApi.replaceMedia(selectedMedia.id, croppedFile);
          notify.success(`Đã cắt & resize ảnh chuẩn WordPress thành công (${canvas.width} × ${canvas.height} px)!`);
          if (updatedMedia) {
            setSelectedMedia(updatedMedia);
          }
          setIsCropModalOpen(false);
          refetch();
        } catch (err: any) {
          notify.error(err, 'Không thể lưu ảnh đã cắt!');
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
      notify.success(t('media.deleteSuccess', 'Đã xóa tập tin khỏi hệ thống!'));
      setIsDrawerOpen(false);
      setSelectedMedia(null);
      refetch();
    } catch (err: any) {
      notify.error(err, t('media.deleteError', 'Không thể xóa tập tin!'));
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
      notify.success(t('media.updateSuccess', 'Đã cập nhật thông tin tập tin thành công!'));
      refetch();
    } catch (err: any) {
      notify.error(err, t('media.updateError', 'Không thể cập nhật thông tin tập tin!'));
    } finally {
      setSavingDetail(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    notify.success(t('media.copyUrlSuccess', 'Đã sao chép đường dẫn URL vào clipboard!'));
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
            style={{ width: 48, height: 48, backgroundColor: '#0f172a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <VideoCameraOutlined style={{ fontSize: 24, color: '#38bdf8' }} />
          </div>
        ) : record.mimetype?.startsWith('audio/') ? (
          <div
            onClick={() => handleOpenDetail(record)}
            style={{ width: 48, height: 48, backgroundColor: '#18181b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <CustomerServiceOutlined style={{ fontSize: 24, color: '#ec4899' }} />
          </div>
        ) : (
          <div
            onClick={() => handleOpenDetail(record)}
            style={{ width: 48, height: 48, backgroundColor: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <FileOutlined style={{ fontSize: 24, color: '#64748b' }} />
          </div>
        )
      ),
    },
    {
      title: t('media.filename', 'Tên Tập Tin'),
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string, record: MediaItem) => (
        <div>
          <a onClick={() => handleOpenDetail(record)} style={{ fontWeight: 700, color: '#0f172a' }}>
            {record.title || text}
          </a>
          <div style={{ fontSize: 11, color: '#64748b' }}>{text}</div>
        </div>
      ),
    },
    {
      title: t('media.mimetype', 'Định Dạng'),
      dataIndex: 'mimetype',
      key: 'mimetype',
      width: 140,
      render: (mime: string) => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{mime}</span>,
    },
    {
      title: t('media.size', 'Dung Lượng'),
      dataIndex: 'size',
      key: 'size',
      width: 110,
      render: (size: number) => formatBytes(size),
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}
    >
      {/* Overlay Drag & Drop Zone */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(79, 70, 229, 0.9)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <InboxOutlined style={{ fontSize: 72, color: '#ffffff', marginBottom: 16 }} />
          <h2 style={{ color: '#ffffff', fontSize: 24, fontWeight: 800, margin: 0 }}>
            {t('media.dragDropTip', 'Kéo & thả tập tin vào đây để tải lên ngay lập tức')}
          </h2>
        </div>
      )}

      {/* 1. Storage Analytics Header Bar */}
      <MediaAnalyticsHeader
        total={total}
        totalCalculatedBytes={totalCalculatedBytes}
        imageCount={imageCount}
        videoCount={videoCount}
        docCount={docCount}
        formatBytes={formatBytes}
      />

      {/* 2. Floating Batch Actions Bar */}
      <MediaBatchActionBar
        selectedCount={selectedIds.length}
        totalFilteredCount={filteredMediaList.length}
        onSelectAll={handleSelectAll}
        onCopyUrls={handleBatchCopyUrls}
        onBatchDelete={handleBatchDelete}
      />

      {/* Top Controls Card */}
      <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('media.title', 'Quản Lý Media & Tập Tin')}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12 }}>
              {t('media.subtitle', 'Thư viện quản lý hình ảnh, video, âm thanh (.mp3) và tài liệu hệ thống')}
            </p>
          </div>

          <Space wrap>
            {/* Batch Select Toggle */}
            <Button
              type={isBatchMode ? 'primary' : 'default'}
              icon={<CheckSquareOutlined />}
              onClick={() => {
                const nextMode = !isBatchMode;
                setIsBatchMode(nextMode);
                if (!nextMode) setSelectedIds([]);
              }}
              style={{ fontWeight: 600 }}
            >
              {t('media.batchSelect', 'Chọn Hàng Loạt')}
            </Button>

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
            style={{ width: 200, borderRadius: 6 }}
            options={[
              { value: 'all', label: t('media.filterAll', 'Tất Cả Loại Tập Tin') },
              { value: 'image', label: t('media.filterImages', 'Hình Ảnh (.jpg, .png, .webp)') },
              { value: 'video', label: t('media.filterVideo', 'Video (.mp4, .webm)') },
              { value: 'audio', label: t('media.filterAudio', 'Âm Thanh (.mp3, .wav, .aac)') },
              { value: 'document', label: t('media.filterDocument', 'Tài Liệu (.pdf, .doc...)') },
            ]}
          />

          <Select
            value={sizeFilter}
            onChange={setSizeFilter}
            style={{ width: 170, borderRadius: 6 }}
            options={[
              { value: 'all', label: 'Tất Cả Dung Lượng' },
              { value: 'small', label: 'Nhỏ (< 1 MB)' },
              { value: 'medium', label: 'Vừa (1 MB - 10 MB)' },
              { value: 'large', label: 'Lớn (> 10 MB)' },
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
            style={{ width: 240, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* Main View: Grid vs Table */}
      {viewMode === 'grid' ? (
        <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
          {filteredMediaList.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <FileOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }} />
              <p style={{ color: '#64748b', fontSize: 14 }}>Không tìm thấy tập tin media nào trong thư viện</p>
            </div>
          ) : (
            <Row gutter={[20, 20]}>
              {filteredMediaList.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Col key={item.id} xs={12} sm={8} md={6} lg={6} xl={4}>
                    <div
                      onClick={() => {
                        if (isBatchMode) {
                          handleSelectToggle(item.id);
                        } else {
                          handleOpenDetail(item);
                        }
                      }}
                      style={{
                        width: '100%',
                        paddingBottom: '85%',
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        backgroundColor: '#09090b',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                      className="hover:scale-[1.02] hover:shadow-lg hover:border-indigo-500"
                    >
                      {/* Batch Selection Checkbox */}
                      {isBatchMode && (
                        <div
                          onClick={(e) => handleSelectToggle(item.id, e)}
                          style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
                        >
                          <Checkbox checked={isSelected} />
                        </div>
                      )}

                      {/* Quick Lightbox Action Button */}
                      <div
                        onClick={(e) => handleOpenLightbox(idx, e)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: 6,
                          padding: '3px 8px',
                          color: '#ffffff',
                          fontSize: 13,
                        }}
                      >
                        <EyeOutlined />
                      </div>

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
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                          <VideoCameraOutlined style={{ fontSize: 40, color: '#38bdf8' }} />
                          <span style={{ fontSize: 11, marginTop: 6, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Video</span>
                        </div>
                      ) : item.mimetype?.startsWith('audio/') ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#18181b' }}>
                          <CustomerServiceOutlined style={{ fontSize: 40, color: '#ec4899' }} />
                          <span style={{ fontSize: 11, marginTop: 6, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase' }}>Audio</span>
                        </div>
                      ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                          <FileOutlined style={{ fontSize: 40, color: '#64748b' }} />
                          <span style={{ fontSize: 11, marginTop: 6, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Document</span>
                        </div>
                      )}

                      {/* Title Bar Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(9, 9, 11, 0.9), rgba(9, 9, 11, 0.3))',
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '8px 10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title || item.filename}
                        </span>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
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
        <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
          <Table
            columns={columns}
            dataSource={filteredMediaList}
            rowKey="id"
            loading={isLoading}
            rowSelection={
              isBatchMode
                ? {
                    selectedRowKeys: selectedIds,
                    onChange: (keys) => setSelectedIds(keys as string[]),
                  }
                : undefined
            }
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

      {/* Upload Modal */}
      <Modal
        title={t('media.uploadModalTitle', 'Tải Lên Tập Tin Media Mới')}
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
      >
        <Upload.Dragger
          customRequest={handleCustomUpload}
          multiple
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 36, color: '#4f46e5' }} />
          </p>
          <p className="ant-upload-text">{t('media.dragDropText', 'Nhấp hoặc kéo thả tập tin vào đây để tải lên')}</p>
          <p className="ant-upload-hint">{t('media.dragDropHint', 'Hỗ trợ tải lên nhiều tập tin cùng lúc.')}</p>
        </Upload.Dragger>
      </Modal>

      {/* 3. Fullscreen Lightbox Modal */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        currentItem={currentLightboxItem}
        currentIndex={lightboxIndex}
        totalCount={filteredMediaList.length}
        onPrev={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setLightboxIndex((prev) => Math.min(filteredMediaList.length - 1, prev + 1))}
        onCopyUrl={handleCopyUrl}
        onOpenDetail={handleOpenDetail}
        formatBytes={formatBytes}
      />

      {/* 4. WordPress Interactive Image Cropper Modal */}
      <MediaCropperModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        selectedMedia={selectedMedia}
        cropperRef={cropperRef}
        aspect={aspect}
        setAspect={setAspect}
        originalSize={originalSize}
        cropCoords={cropCoords}
        targetWidth={targetWidth}
        targetHeight={targetHeight}
        lockAspect={lockAspect}
        setLockAspect={setLockAspect}
        handleTargetWidthChange={handleTargetWidthChange}
        handleTargetHeightChange={handleTargetHeightChange}
        handleCropperCrop={handleCropperCrop}
        handleSaveCrop={handleSaveCrop}
        savingCrop={savingCrop}
      />

      {/* 5. Attachment Details & Edit Drawer */}
      <MediaDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedMedia={selectedMedia}
        detailForm={detailForm}
        onSaveDetail={handleSaveDetail}
        onDeleteMedia={handleDeleteMedia}
        onReplaceFile={handleReplaceFile}
        onOpenCropModal={() => setIsCropModalOpen(true)}
        onCopyUrl={handleCopyUrl}
        copiedUrl={copiedUrl}
        savingDetail={savingDetail}
        replacing={replacing}
        formatBytes={formatBytes}
      />
    </div>
  );
}
