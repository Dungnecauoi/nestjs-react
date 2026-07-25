import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Result, Button, Space, Typography, Spin } from 'antd';
import { ThunderboltFilled } from '@ant-design/icons';
import { authApi } from '../../api/modules/auth.api';
import { ROUTES } from '../../routes/routes.config';

const { Title } = Typography;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Thiếu token xác minh email.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
      });
  }, [token]);

  return (
    <Card
      bordered={false}
      style={{
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Space direction="vertical" align="center" size="small">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#09090b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <ThunderboltFilled />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            XÁC MINH EMAIL
          </Title>
        </Space>
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" tip="Đang xác minh email..." />
        </div>
      )}

      {status === 'success' && (
        <Result
          status="success"
          title="Xác minh email thành công!"
          extra={
            <Link to={ROUTES.LOGIN.path}>
              <Button type="primary">Về Trang Đăng Nhập</Button>
            </Link>
          }
        />
      )}

      {status === 'error' && (
        <Result
          status="error"
          title="Xác minh email thất bại"
          subTitle={errorMessage}
          extra={
            <Link to={ROUTES.LOGIN.path}>
              <Button type="primary">Về Trang Đăng Nhập</Button>
            </Link>
          }
        />
      )}
    </Card>
  );
}
