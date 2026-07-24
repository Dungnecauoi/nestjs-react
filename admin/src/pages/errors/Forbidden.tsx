import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Result, Button, Card } from 'antd';
import { HomeOutlined, LockOutlined } from '@ant-design/icons';
import { ROUTES } from '../../routes/routes.config';

export default function Forbidden() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 16px' }}>
      <Card bordered={false} style={{ width: '100%', maxWidth: 560, textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <Result
          status="403"
          icon={<LockOutlined style={{ color: '#ef4444', fontSize: 64 }} />}
          title={<span style={{ fontWeight: 800, fontSize: 24 }}>403 - {t('errors.forbiddenTitle', 'Không Có Quyền Truy Cập')}</span>}
          subTitle={
            <span style={{ color: '#64748b', fontSize: 14 }}>
              {t('errors.forbiddenSub', 'Tài khoản của bạn không có đủ quyền hạn để xem trang hoặc thực hiện thao tác này. Vui lòng liên hệ Quản Trị Viên (Admin) để cấp quyền.')}
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
