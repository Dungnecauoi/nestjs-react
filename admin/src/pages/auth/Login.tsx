import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Checkbox, Alert, Space, Typography, Modal, message } from 'antd';
import { LockOutlined, MailOutlined, ArrowRightOutlined, ThunderboltFilled, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authApi } from '../../api/modules/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../routes/routes.config';

const { Text, Title } = Typography;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2-Step 2FA Login Interception State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const onFinish = async (values: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const responseData = await authApi.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      // Intercept 2FA login step if required by backend
      if (responseData?.isTwoFactorRequired) {
        setPreAuthToken(responseData.preAuthToken);
        setIs2FAModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (responseData?.accessToken) {
        setAuth(responseData.accessToken, responseData.user);
        message.success(t('auth.loginSuccess', 'Đăng nhập hệ thống thành công!'));
        navigate(ROUTES.DASHBOARD.path);
      } else {
        setErrorMessage(t('auth.invalidCredentials', 'Tên đăng nhập hoặc mật khẩu không chính xác'));
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || t('auth.loginFailed', 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FAOTP = async () => {
    if (!otpCode || otpCode.length < 6 || !preAuthToken) {
      setOtpError('Vui lòng nhập đủ 6 chữ số OTP từ Google Authenticator!');
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError(null);

    try {
      const responseData = await authApi.authenticate2FA({
        preAuthToken,
        otpCode,
      });

      if (responseData?.accessToken) {
        setAuth(responseData.accessToken, responseData.user);
        setIs2FAModalOpen(false);
        message.success(t('auth.twoFactorSuccess', 'Xác thực 2FA 2 bước thành công! Chào mừng bạn trở lại.'));
        navigate(ROUTES.DASHBOARD.path);
      } else {
        setOtpError(t('auth.otpIncorrect', 'Mã OTP 2FA không chính xác!'));
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  return (
    <>
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
              ECOMCX ERP CORE
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Enterprise Resource Planning & Security
            </Text>
          </Space>
        </div>

        {errorMessage && (
          <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="user@ecomcx.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -8, marginBottom: 8, fontSize: 12 }}>
            <Form.Item name="rememberMe" valuePropName="checked" noStyle initialValue={false}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Link to={ROUTES.FORGOT_PASSWORD.path} style={{ fontWeight: 600 }}>
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              icon={<ArrowRightOutlined />}
              style={{ height: 40, fontWeight: 700 }}
            >
              {t('auth.loginButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 2-Step OTP Verification Login Interception Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#059669' }} />
            Xác Thực 2 Lớp (2FA OTP)
          </Space>
        }
        open={is2FAModalOpen}
        onCancel={() => setIs2FAModalOpen(false)}
        footer={null}
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 12 }}>
          <Alert
            message="Tài khoản này đã bật bảo mật 2FA. Vui lòng nhập mã 6 số từ Google Authenticator trên điện thoại:"
            type="warning"
            showIcon
            style={{ width: '100%', fontSize: 12 }}
          />

          {otpError && <Alert message={otpError} type="error" showIcon style={{ width: '100%' }} />}

          <Input
            maxLength={6}
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 800, height: 48 }}
          />

          <Button
            type="primary"
            block
            size="large"
            loading={isVerifyingOTP}
            icon={<CheckCircleOutlined />}
            onClick={handleVerify2FAOTP}
            style={{ backgroundColor: '#059669', height: 44, fontWeight: 700 }}
          >
            Xác Nhận OTP & Đăng Nhập
          </Button>
        </div>
      </Modal>
    </>
  );
}
