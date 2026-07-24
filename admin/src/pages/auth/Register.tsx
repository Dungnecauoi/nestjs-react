import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Alert, Space, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowRightOutlined, ThunderboltFilled, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { ROUTES } from '../../routes/routes.config';

const { Text, Title } = Typography;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const isRegistrationAllowed = localStorage.getItem('allow_registration') !== 'false';

  const onFinish = async (values: any) => {
    if (!isRegistrationAllowed) {
      setErrorMessage('Hệ thống hiện tại đã tắt tính năng tự đăng ký tài khoản mới');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setIsPendingApproval(true);
      message.success('Đăng ký tài khoản thành công! Đang chờ Quản Trị Viên (Admin) phê duyệt.');
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err);
      setErrorMessage(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRegistrationAllowed) {
    return (
      <Card
        bordered={false}
        style={{
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Alert
          message="Tính Năng Đăng Ký Đang Tắt"
          description="Quản trị viên đã tạm thời đóng cổng đăng ký tài khoản mới. Vui lòng liên hệ Admin để được cấp tài khoản."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Button type="primary" onClick={() => navigate(ROUTES.LOGIN.path)}>
          Quay Về Trang Đăng Nhập
        </Button>
      </Card>
    );
  }

  if (isPendingApproval) {
    return (
      <Card
        bordered={false}
        style={{
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <ClockCircleOutlined style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
        <Title level={4} style={{ fontWeight: 800 }}>Đăng Ký Thành Công & Chờ Phê Duyệt</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Tài khoản của bạn đã được gửi tới Quản Trị Viên (Admin) hệ thống. Bạn sẽ có thể đăng nhập sau khi được chấp thuận.
        </Text>
        <Button type="primary" onClick={() => navigate(ROUTES.LOGIN.path)}>
          Quay Về Trang Đăng Nhập
        </Button>
      </Card>
    );
  }

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
            TẠO TÀI KHOẢN ECOMCX ERP
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đăng ký thành viên mới (Cần Admin Phê Duyệt)
          </Text>
        </Space>
      </div>

      {errorMessage && (
        <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label={t('auth.fullName', 'Họ và Tên')}
          rules={[{ required: true, message: 'Vui lòng nhập Họ và Tên!' }]}
        >
          <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" />
        </Form.Item>

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

        <Form.Item
          name="password"
          label={t('auth.password', 'Mật Khẩu')}
          rules={[
            { required: true, message: 'Vui lòng nhập Mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" />
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
            Gửi Yêu Cầu Đăng Ký
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
        <Text type="secondary">Đã có tài khoản? </Text>
        <Link to={ROUTES.LOGIN.path} style={{ fontWeight: 700 }}>
          Đăng nhập ngay
        </Link>
      </div>
    </Card>
  );
}
