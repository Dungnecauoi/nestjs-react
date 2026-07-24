import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Result, Button, Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { ROUTES } from '../../routes/routes.config';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 16px' }}>
      <Card bordered={false} style={{ width: '100%', maxWidth: 560, textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <Result
          status="404"
          title={<span style={{ fontWeight: 800, fontSize: 28 }}>404 - Không Tìm Thấy Trang</span>}
          subTitle={
            <span style={{ color: '#64748b', fontSize: 14 }}>
              Đường dẫn bạn yêu cầu không tồn tại trên hệ thống ECOMCX ERP hoặc đã bị di chuyển.
            </span>
          }
          extra={
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate(ROUTES.DASHBOARD.path)}
              style={{ fontWeight: 700 }}
            >
              {t('errors.backHome', 'Quay Về Trang Chủ Dashboard')}
            </Button>
          }
        />
      </Card>
    </div>
  );
}
