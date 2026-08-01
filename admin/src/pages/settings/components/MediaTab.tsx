import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Row, Col, Select, InputNumber, Divider } from 'antd';
import { StorageConfigTabContent } from './StorageConfigTabContent';

export function MediaTab() {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Nơi Lưu Trữ Media & Driver - Đặt lên đầu theo yêu cầu */}
      <StorageConfigTabContent />

      <Divider orientation="left" style={{ margin: '8px 0 12px 0', fontSize: 15, fontWeight: 700, borderColor: '#e2e8f0' }}>
        {t('settings.tabMedia')}
      </Divider>

      {/* 2. Cấu Hình Tập Tin Media & Nén */}
      <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item name="allowedImageTypes" label={t('settings.allowedImageTypes')}>
              <Select
                mode="tags"
                placeholder={t('settings.selectImageTypesPlaceholder')}
                options={[
                  { value: 'jpg', label: 'JPG / JPEG' },
                  { value: 'png', label: 'PNG' },
                  { value: 'webp', label: 'WEBP' },
                  { value: 'gif', label: 'GIF' },
                  { value: 'svg', label: 'SVG' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="maxImageSizeMb" label={t('settings.maxImageSizeMb')}>
              <InputNumber min={1} max={500} style={{ width: '100%' }} suffix="MB" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="convertToWebp"
              label={t('settings.convertToWebp')}
              valuePropName="checked"
              extra={t('settings.convertToWebpHelp')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="media_compression_quality" label={t('settings.mediaCompressionQuality')}>
              <InputNumber min={50} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="media_enable_sha256_deduplication"
              label={t('settings.mediaDeduplication')}
              valuePropName="checked"
              extra={t('settings.mediaDeduplicationHelp')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="media_strip_exif_metadata"
              label={t('settings.mediaStripExif')}
              valuePropName="checked"
              extra={t('settings.mediaStripExifHelp')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="media_enable_watermark"
              label={t('settings.mediaEnableWatermark')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="media_watermark_text" label={t('settings.mediaWatermarkText')}>
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="media_enable_chunked_upload"
              label={t('settings.mediaChunkedUpload')}
              valuePropName="checked"
              extra={t('settings.mediaChunkedUploadHelp')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '8px 0 16px 0' }} />
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="allowedVideoTypes" label={t('settings.allowedVideoTypes')}>
              <Select
                mode="tags"
                placeholder={t('settings.selectVideoTypesPlaceholder')}
                options={[
                  { value: 'mp4', label: 'MP4' },
                  { value: 'webm', label: 'WEBM' },
                  { value: 'mov', label: 'MOV' },
                  { value: 'mkv', label: 'MKV' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="maxVideoSizeMb" label={t('settings.maxVideoSizeMb')}>
              <InputNumber min={1} max={10000} style={{ width: '100%' }} suffix="MB" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
