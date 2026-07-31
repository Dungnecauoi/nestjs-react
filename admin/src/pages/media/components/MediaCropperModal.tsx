import React, { RefObject } from 'react';
import { Modal, Card, Tag, Button, InputNumber, Tooltip } from 'antd';
import {
  ScissorOutlined,
  CompressOutlined,
  LockOutlined,
  UnlockOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useTranslation } from 'react-i18next';
import { MediaItem } from '../../../api/modules/media.api';

interface MediaCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedia: MediaItem | null;
  cropperRef: RefObject<ReactCropperElement | null>;
  aspect: number | undefined;
  setAspect: (aspect: number | undefined) => void;
  originalSize: { width: number; height: number };
  cropCoords: { x: number; y: number; width: number; height: number };
  targetWidth: number | null;
  targetHeight: number | null;
  lockAspect: boolean;
  setLockAspect: (lock: boolean) => void;
  handleTargetWidthChange: (val: number | null) => void;
  handleTargetHeightChange: (val: number | null) => void;
  handleCropperCrop: () => void;
  handleSaveCrop: () => void;
  savingCrop: boolean;
}

export const MediaCropperModal: React.FC<MediaCropperModalProps> = ({
  isOpen,
  onClose,
  selectedMedia,
  cropperRef,
  aspect,
  setAspect,
  originalSize,
  cropCoords,
  targetWidth,
  targetHeight,
  lockAspect,
  setLockAspect,
  handleTargetWidthChange,
  handleTargetHeightChange,
  handleCropperCrop,
  handleSaveCrop,
  savingCrop,
}) => {
  const { t } = useTranslation();

  if (!selectedMedia || !selectedMedia.mimetype?.startsWith('image/')) return null;

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800 }}>
          <ScissorOutlined style={{ color: '#2563eb' }} />
          {t('media.cropModalTitle', 'Chỉnh Sửa & Cắt Ảnh Chuẩn WordPress')}
        </span>
      }
      open={isOpen}
      onCancel={onClose}
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
                  suffix="px"
                  placeholder="Rộng"
                  style={{ width: 130 }}
                />

                <span style={{ fontWeight: 700, color: '#64748b' }}>×</span>

                <InputNumber
                  value={targetHeight}
                  onChange={handleTargetHeightChange}
                  min={10}
                  max={8000}
                  suffix="px"
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

            {/* Preset Aspect Ratios */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Tỷ lệ:</span>
              <Button.Group size="small">
                <Button
                  type={aspect === undefined ? 'primary' : 'default'}
                  onClick={() => {
                    setAspect(undefined);
                    cropperRef.current?.cropper.setAspectRatio(NaN);
                  }}
                >
                  Tự Do
                </Button>
                <Button
                  type={aspect === 1 ? 'primary' : 'default'}
                  onClick={() => {
                    setAspect(1);
                    cropperRef.current?.cropper.setAspectRatio(1);
                  }}
                >
                  1:1 (Vuông)
                </Button>
                <Button
                  type={aspect === 16 / 9 ? 'primary' : 'default'}
                  onClick={() => {
                    setAspect(16 / 9);
                    cropperRef.current?.cropper.setAspectRatio(16 / 9);
                  }}
                >
                  16:9 (Ngang)
                </Button>
                <Button
                  type={aspect === 4 / 3 ? 'primary' : 'default'}
                  onClick={() => {
                    setAspect(4 / 3);
                    cropperRef.current?.cropper.setAspectRatio(4 / 3);
                  }}
                >
                  4:3
                </Button>
              </Button.Group>
            </div>
          </div>
        </Card>

        {/* Cropper Marquee Canvas */}
        <div
          style={{
            width: '100%',
            height: 380,
            backgroundColor: '#09090b',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Cropper
            ref={cropperRef}
            src={selectedMedia.url}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={aspect}
            guides={true}
            viewMode={1}
            minCropBoxWidth={20}
            minCropBoxHeight={20}
            background={true}
            responsive={true}
            autoCropArea={0.9}
            checkOrientation={false}
            crop={handleCropperCrop}
          />
        </div>

        {/* Transform Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<RotateLeftOutlined />}
              onClick={() => cropperRef.current?.cropper.rotate(-90)}
            >
              Xoay Trái 90°
            </Button>
            <Button
              size="small"
              icon={<RotateRightOutlined />}
              onClick={() => cropperRef.current?.cropper.rotate(90)}
            >
              Xoay Phải 90°
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => cropperRef.current?.cropper.zoom(0.1)}
            >
              Phóng To
            </Button>
            <Button
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={() => cropperRef.current?.cropper.zoom(-0.1)}
            >
              Thu Nhỏ
            </Button>
            <Button
              size="small"
              onClick={() => {
                const cropper = cropperRef.current?.cropper;
                if (cropper) {
                  cropper.reset();
                  setAspect(undefined);
                }
              }}
            >
              Đặt Lai Mặc Định
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
