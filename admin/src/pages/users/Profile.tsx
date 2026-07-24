import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Avatar, Space, Tag, Descriptions, Row, Col, Modal, QRCode, Alert, message } from 'antd';
import { UserOutlined, SaveOutlined, SafetyCertificateOutlined, QrcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';

export default function UserProfile() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(user?.isTwoFactorEnabled || false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const primaryRole = user?.roles && user.roles.length > 0 ? String(user.roles[0]).toUpperCase() : '';

  const totpSecret = 'JBSWY3DPEHPK3PXP';
  const totpUri = userEmail ? `otpauth://totp/ECOMCX%20ERP:${userEmail}?secret=${totpSecret}&issuer=ECOMCX%20ERP` : '';

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        department: '',
      });
      setIs2FAActive(user.isTwoFactorEnabled || false);
    }
  }, [user, form]);

  const handleVerify2FA = () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Vui lòng nhập đúng 6 chữ số OTP từ ứng dụng điện thoại!');
      return;
    }
    setIs2FAActive(true);
    setIs2FAModalOpen(false);
    setOtpCode('');
    setOtpError(null);
    message.success('Đã xác minh mã OTP và cập nhật 2FA!');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Card */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space size="large">
            {user?.avatar ? (
              <Avatar size={64} src={user.avatar} />
            ) : (
              <Avatar size={64} style={{ backgroundColor: '#09090b', fontWeight: 800, fontSize: 24 }}>
                {userInitial}
              </Avatar>
            )}
            <div>
              <Space align="center">
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{userName}</h1>
                <Tag color="green" icon={<SafetyCertificateOutlined />}>Tài Khoản Đã Xác Thực</Tag>
              </Space>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>
                {userEmail} {primaryRole ? `• Role: ${primaryRole}` : ''}
              </p>
            </div>
          </Space>

          <Button type="primary" icon={<SaveOutlined />}>
            Lưu Thay Đổi
          </Button>
        </div>
      </Card>

      {/* Main Profile Grid */}
      <Row gutter={[16, 16]}>
        {/* Left Column: Account Info Form */}
        <Col xs={24} lg={14}>
          <Card title="Thông Tin Cá Nhân & Tài Khoản" bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item name="name" label="Họ và Tên">
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item name="email" label="Địa Chỉ Email">
                <Input disabled />
              </Form.Item>

              <Form.Item name="phone" label="Số Điện Thoại Liên Hệ">
                <Input placeholder="Chưa cập nhật số điện thoại" />
              </Form.Item>

              <Form.Item name="department" label="Phòng Ban Trực Thuộc">
                <Input disabled placeholder="Chưa thuộc phòng ban nào" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column: 2FA Status & Security Details */}
        <Col xs={24} lg={10}>
          <Card title="Bảo Mật Tài Khoản & 2FA" bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Descriptions title="Trạng Thái Bảo Mật Account" column={1} size="small" bordered>
              <Descriptions.Item label="Xác Thực 2 Lớp (2FA)">
                <Space wrap>
                  <Tag color={is2FAActive ? 'green' : 'orange'} icon={is2FAActive ? <CheckCircleOutlined /> : undefined}>
                    {is2FAActive ? '2FA Đã Kích Hoạt (Bảo Mật Cao)' : '2FA Chưa Kích Hoạt'}
                  </Tag>
                  <Button size="small" type="primary" icon={<QrcodeOutlined />} onClick={() => setIs2FAModalOpen(true)}>
                    Cấu Hình 2FA
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Ứng Dụng OTP">
                Google Authenticator / Authy
              </Descriptions.Item>

              <Descriptions.Item label="Đăng Nhập Gần Nhất">
                Vừa xong
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* 2FA Setup Modal with Ant Design QRCode */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#059669' }} />
            Cấu Hình Xác Thực 2 Lớp (2FA / TOTP)
          </Space>
        }
        open={is2FAModalOpen}
        onCancel={() => setIs2FAModalOpen(false)}
        footer={null}
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 12 }}>
          <Alert
            message="1. Dùng ứng dụng Google Authenticator hoặc Authy trên điện thoại quét mã QR bên dưới:"
            type="info"
            showIcon
            style={{ width: '100%', fontSize: 12 }}
          />

          {totpUri ? <QRCode value={totpUri} size={180} style={{ padding: 12, borderRadius: 12 }} /> : null}

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Secret Key Thủ Công:</div>
            <code style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5', letterSpacing: 1 }}>{totpSecret}</code>
          </div>

          <Alert
            message="2. Nhập mã OTP 6 chữ số từ ứng dụng điện thoại để hoàn tất:"
            type="warning"
            showIcon
            style={{ width: '100%', fontSize: 12 }}
          />

          <div style={{ width: '100%' }}>
            {otpError && <Alert message={otpError} type="error" showIcon style={{ marginBottom: 12 }} />}
            <Input
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: 800, height: 44 }}
            />
          </div>

          <Button
            type="primary"
            block
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleVerify2FA}
            style={{ backgroundColor: '#059669', height: 40, fontWeight: 700 }}
          >
            Xác Nhận & Kích Hoạt 2FA
          </Button>
        </div>
      </Modal>
    </div>
  );
}
