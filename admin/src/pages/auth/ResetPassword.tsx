import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Alert, Space, Typography, message } from 'antd';
import { LockOutlined, CheckCircleOutlined, ThunderboltFilled } from '@ant-design/icons';
import { authApi } from '../../api/modules/auth.api';
import { ROUTES } from '../../routes/routes.config';

const { Text, Title } = Typography;

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.resetPassword(token, values.newPassword);
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate(ROUTES.LOGIN.path);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

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
            ĐẶT LẠI MẬT KHẨU
          </Title>
        </Space>
      </div>

      {!token && (
        <Alert
          message="Thiếu token đặt lại mật khẩu"
          description="Vui lòng dùng link được gửi qua email."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {errorMessage && (
        <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="newPassword"
          label="Mật Khẩu Mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác Nhận Mật Khẩu Mới"
          rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!token}
            block
            icon={<CheckCircleOutlined />}
            style={{ height: 40, fontWeight: 700 }}
          >
            Đặt Lại Mật Khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
        <Text type="secondary">Nhớ mật khẩu? </Text>
        <Link to={ROUTES.LOGIN.path} style={{ fontWeight: 700 }}>
          Đăng nhập ngay
        </Link>
      </div>
    </Card>
  );
}
