import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Input, Button, Avatar, Space, Tag, Descriptions, Row, Col, Modal, QRCode, Alert, message, Table, Popconfirm } from 'antd';
import { UserOutlined, SaveOutlined, SafetyCertificateOutlined, QrcodeOutlined, CheckCircleOutlined, StopOutlined, DesktopOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/modules/auth.api';
import { sessionsApi, SessionItem } from '../../api/modules/sessions.api';

export default function UserProfile() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user, setUser } = useAuthStore();

  const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false);
  const [is2FADisableModalOpen, setIs2FADisableModalOpen] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(user?.isTwoFactorEnabled || false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const primaryRole = user?.roles && user.roles.length > 0 ? String(user.roles[0]).toUpperCase() : '';

  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.revokeSession(id),
    onSuccess: () => {
      message.success('Đã thu hồi phiên đăng nhập!');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Không thể thu hồi phiên đăng nhập!');
    },
  });

  const sessionColumns: ColumnsType<SessionItem> = [
    {
      title: 'Thiết Bị / Trình Duyệt',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (userAgent: string | null, record) => (
        <Space>
          <DesktopOutlined />
          <span style={{ fontSize: 12 }}>{userAgent || 'Không xác định'}</span>
          {record.isCurrent && <Tag color="green">Thiết bị hiện tại</Tag>}
        </Space>
      ),
    },
    {
      title: 'Địa Chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (ip: string | null) => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{ip || '-'}</span>,
    },
    {
      title: 'Đăng Nhập Lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => <span style={{ fontSize: 12 }}>{new Date(date).toLocaleString('vi-VN')}</span>,
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record) =>
        !record.isCurrent && (
          <Popconfirm
            title="Thu hồi phiên đăng nhập này?"
            onConfirm={() => revokeMutation.mutate(record.id)}
            okText="Thu hồi"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ];

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

  const openSetupModal = async () => {
    setOtpError(null);
    setOtpCode('');
    setIs2FASetupModalOpen(true);
    setQrLoading(true);
    try {
      const data = await authApi.generate2FASecret();
      setOtpAuthUrl(data.otpAuthUrl);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tạo mã QR 2FA!');
      setIs2FASetupModalOpen(false);
    } finally {
      setQrLoading(false);
    }
  };

  const openDisableModal = () => {
    setOtpError(null);
    setOtpCode('');
    setIs2FADisableModalOpen(true);
  };

  const handleVerify2FA = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Vui lòng nhập đúng 6 chữ số OTP từ ứng dụng điện thoại!');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await authApi.turnOn2FA(otpCode);
      setIs2FAActive(true);
      if (user) setUser({ ...user, isTwoFactorEnabled: true });
      setIs2FASetupModalOpen(false);
      setOtpCode('');
      message.success('Đã xác minh mã OTP và kích hoạt 2FA thành công!');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Vui lòng nhập đúng 6 chữ số OTP từ ứng dụng điện thoại!');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await authApi.turnOff2FA(otpCode);
      setIs2FAActive(false);
      if (user) setUser({ ...user, isTwoFactorEnabled: false });
      setIs2FADisableModalOpen(false);
      setOtpCode('');
      message.success('Đã tắt xác thực 2FA!');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Mã OTP không chính xác!');
    } finally {
      setOtpLoading(false);
    }
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
                  {is2FAActive ? (
                    <Button size="small" danger icon={<StopOutlined />} onClick={openDisableModal}>
                      Tắt 2FA
                    </Button>
                  ) : (
                    <Button size="small" type="primary" icon={<QrcodeOutlined />} onClick={openSetupModal}>
                      Cấu Hình 2FA
                    </Button>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Ứng Dụng OTP">
                Google Authenticator / Authy
              </Descriptions.Item>

              <Descriptions.Item label="Đăng Nhập Gần Nhất">
                {sessions[0]?.createdAt ? new Date(sessions[0].createdAt).toLocaleString('vi-VN') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Phiên Đăng Nhập Đang Hoạt Động"
            bordered={false}
            style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', marginTop: 16 }}
          >
            <Table
              rowKey="id"
              size="small"
              loading={sessionsLoading}
              columns={sessionColumns}
              dataSource={sessions}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 2FA Setup Modal - QR thật từ backend */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#059669' }} />
            Cấu Hình Xác Thực 2 Lớp (2FA / TOTP)
          </Space>
        }
        open={is2FASetupModalOpen}
        onCancel={() => setIs2FASetupModalOpen(false)}
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

          {qrLoading ? (
            <div style={{ padding: 24 }}>Đang tạo mã QR...</div>
          ) : otpAuthUrl ? (
            <QRCode value={otpAuthUrl} size={180} style={{ padding: 12, borderRadius: 12 }} />
          ) : null}

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
            loading={otpLoading}
            icon={<CheckCircleOutlined />}
            onClick={handleVerify2FA}
            style={{ backgroundColor: '#059669', height: 40, fontWeight: 700 }}
          >
            Xác Nhận & Kích Hoạt 2FA
          </Button>
        </div>
      </Modal>

      {/* 2FA Disable Modal - yêu cầu OTP hiện tại */}
      <Modal
        title={
          <Space>
            <StopOutlined style={{ color: '#dc2626' }} />
            Tắt Xác Thực 2 Lớp (2FA)
          </Space>
        }
        open={is2FADisableModalOpen}
        onCancel={() => setIs2FADisableModalOpen(false)}
        footer={null}
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 12 }}>
          <Alert
            message="Nhập mã OTP 6 chữ số hiện tại từ ứng dụng điện thoại để xác nhận tắt 2FA:"
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
            danger
            type="primary"
            block
            size="large"
            loading={otpLoading}
            icon={<StopOutlined />}
            onClick={handleDisable2FA}
            style={{ height: 40, fontWeight: 700 }}
          >
            Xác Nhận Tắt 2FA
          </Button>
        </div>
      </Modal>
    </div>
  );
}
