import React from 'react';
import { Row, Col, Card, Statistic, Tag } from 'antd';
import { FileOutlined, PieChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface MediaAnalyticsHeaderProps {
  total: number;
  totalCalculatedBytes: number;
  imageCount: number;
  videoCount: number;
  docCount: number;
  formatBytes: (bytes: number) => string;
}

export const MediaAnalyticsHeader: React.FC<MediaAnalyticsHeaderProps> = ({
  total,
  totalCalculatedBytes,
  imageCount,
  videoCount,
  docCount,
  formatBytes,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <Statistic
            title={t('media.totalFiles', 'Tổng Số Tập Tin')}
            value={total}
            prefix={<FileOutlined style={{ color: '#4f46e5' }} />}
            valueStyle={{ fontWeight: 800 }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <Statistic
            title={t('media.totalSize', 'Tổng Dung Lượng Đã Dùng')}
            value={formatBytes(totalCalculatedBytes)}
            prefix={<PieChartOutlined style={{ color: '#059669' }} />}
            valueStyle={{ fontWeight: 800, fontSize: 20 }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Phân Loại Tập Tin</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <Tag color="blue">{imageCount} Ảnh</Tag>
              <Tag color="cyan">{videoCount} Video</Tag>
              <Tag color="purple">{docCount} Tài Liệu</Tag>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Kéo & Thả Tại Chỗ</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Thả tệp trực tiếp vào màn hình để upload</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
