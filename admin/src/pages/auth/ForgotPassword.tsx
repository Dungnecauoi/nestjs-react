import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Alert, Space, Typography } from 'antd';
import { MailOutlined, ArrowRightOutlined, ThunderboltFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { authApi } from '../../api/modules/auth.api';
import { ROUTES } from '../../routes/routes.config';

const { Text, Title } = Typography;

export default function ForgotPassword() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(values.email);
    } finally {
      // Luôn hiện thông báo chung chung, không tiết lộ email có tồn tại hay không
      setIsSent(true);
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
            QUÊN MẬT KHẨU
          </Title>
          <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
            Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu
          </Text>
        </Space>
      </div>

      {isSent ? (
        <Alert
          message="Đã gửi yêu cầu"
          description="Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label={t('auth.email', 'Địa Chỉ Email')}
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="user@ecomcx.com" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              icon={<ArrowRightOutlined />}
              style={{ height: 40, fontWeight: 700 }}
            >
              Gửi Yêu Cầu
            </Button>
          </Form.Item>
        </Form>
      )}

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
        <Link to={ROUTES.LOGIN.path} style={{ fontWeight: 700 }}>
          <ArrowLeftOutlined /> Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
}
