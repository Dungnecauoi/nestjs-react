import React from 'react';
import { Card, Tag, Button, Space, Popconfirm } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Can } from '../../../components/common/Can';

interface MediaBatchActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAll: () => void;
  onCopyUrls: () => void;
  onBatchDelete: () => void;
}

export const MediaBatchActionBar: React.FC<MediaBatchActionBarProps> = ({
  selectedCount,
  totalFilteredCount,
  onSelectAll,
  onCopyUrls,
  onBatchDelete,
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <Card
      variant="borderless"
      style={{
        position: 'sticky',
        top: 16,
        zIndex: 100,
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color="blue" style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', margin: 0 }}>
            {t('media.selectedItems', `Đã chọn ${selectedCount} tập tin`, { count: selectedCount })}
          </Tag>
          <Button size="small" type="link" onClick={onSelectAll} style={{ color: '#38bdf8', fontWeight: 700 }}>
            {selectedCount === totalFilteredCount
              ? t('media.deselectAll', 'Bỏ chọn tất cả')
              : t('media.selectAll', 'Chọn tất cả')}
          </Button>
        </div>

        <Space>
          <Button icon={<CopyOutlined />} onClick={onCopyUrls} style={{ fontWeight: 600 }}>
            {t('media.batchCopyUrl', 'Sao Chép Mảng URL')}
          </Button>

          <Can permission="media:delete">
            <Popconfirm
              title={t('media.confirmBatchDelete', `Xóa ${selectedCount} tập tin đã chọn khỏi thư viện?`, { count: selectedCount })}
              onConfirm={onBatchDelete}
              okText={t('media.batchDelete', 'Xóa Hàng Loạt')}
              cancelText={t('common.cancel', 'Hủy')}
            >
              <Button type="primary" danger icon={<DeleteOutlined />} style={{ fontWeight: 700 }}>
                {t('media.batchDelete', 'Xóa Hàng Loạt')} ({selectedCount})
              </Button>
            </Popconfirm>
          </Can>
        </Space>
      </div>
    </Card>
  );
};
