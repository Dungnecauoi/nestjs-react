import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Result, Button, Spin } from 'antd';
import { mailConfigApi } from '../../api/modules/mail-config.api';
import { ROUTES } from '../../routes/routes.config';

export default function GmailOAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      setStatus('error');
      setMessage('Bạn đã từ chối cấp quyền hoặc có lỗi từ Google.');
      return;
    }
    if (!code) {
      setStatus('error');
      setMessage('Thiếu authorization code từ Google.');
      return;
    }

    mailConfigApi
      .exchangeGmailCode(code)
      .then((data) => {
        setStatus('success');
        setMessage(data.gmailOauth?.email ? `Đã kết nối: ${data.gmailOauth.email}` : 'Kết nối thành công!');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Không thể hoàn tất kết nối Gmail');
      });
  }, [code, errorParam]);

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '48px auto' }}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin size="large" tip="Đang hoàn tất kết nối Gmail..." />
          </div>
        )}
        {status === 'success' && (
          <Result
            status="success"
            title="Kết nối Gmail thành công!"
            subTitle={message}
            extra={
              <Link to={ROUTES.ADMIN_SETTINGS.path}>
                <Button type="primary">Về Trang Cấu Hình</Button>
              </Link>
            }
          />
        )}
        {status === 'error' && (
          <Result
            status="error"
            title="Kết nối Gmail thất bại"
            subTitle={message}
            extra={
              <Link to={ROUTES.ADMIN_SETTINGS.path}>
                <Button type="primary">Về Trang Cấu Hình</Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
