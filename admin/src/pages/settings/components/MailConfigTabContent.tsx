import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Row, Col, Select, Radio, InputNumber, Space, Divider, Spin, Alert, message } from 'antd';
import { SaveOutlined, SendOutlined, GoogleOutlined } from '@ant-design/icons';
import { mailConfigApi, MailConfigResponse, MailConfigSaveDto, MailDriverName } from '../../../api/modules/mail-config.api';
import { notify } from '../../../utils/notify';

type SmtpProviderPreset = 'gmail' | 'outlook' | 'yahoo' | 'custom';

const SMTP_PROVIDER_PRESETS: Record<Exclude<SmtpProviderPreset, 'custom'>, { host: string; port: number }> = {
  gmail: { host: 'smtp.gmail.com', port: 587 },
  outlook: { host: 'smtp.office365.com', port: 587 },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 587 },
};

export function MailConfigTabContent() {
  const { t } = useTranslation();
  const [mailForm] = Form.useForm();
  const [driver, setDriver] = useState<MailDriverName>('log');
  const [smtpProvider, setSmtpProvider] = useState<SmtpProviderPreset>('gmail');
  const [config, setConfig] = useState<MailConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await mailConfigApi.getMailConfig();
      setConfig(data);
      setDriver(data.driver);
      mailForm.setFieldsValue({
        driver: data.driver,
        fromAddress: data.fromAddress,
        fromName: data.fromName,
        smtpHost: data.smtp?.host,
        smtpPort: data.smtp?.port,
        smtpUsername: data.smtp?.username,
        sesRegion: data.ses?.region ?? '',
        mailgunDomain: data.mailgun?.domain,
      });
    } catch (err) {
      notify.error(err, t('settings.loadingFromDatabase'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProviderChange = (value: SmtpProviderPreset) => {
    setSmtpProvider(value);
    if (value !== 'custom') {
      mailForm.setFieldsValue(SMTP_PROVIDER_PRESETS[value]);
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const dto: MailConfigSaveDto = {
        driver: values.driver,
        fromAddress: values.fromAddress,
        fromName: values.fromName,
      };

      if (values.driver === 'smtp') {
        dto.smtp = {
          host: values.smtpHost,
          port: values.smtpPort,
          username: values.smtpUsername,
          password: values.smtpPassword || undefined,
        };
      } else if (values.driver === 'resend') {
        dto.resend = { apiKey: values.resendApiKey || undefined };
      } else if (values.driver === 'ses') {
        dto.ses = {
          accessKeyId: values.sesAccessKeyId || undefined,
          secretAccessKey: values.sesSecretAccessKey || undefined,
          region: values.sesRegion,
        };
      } else if (values.driver === 'mailgun') {
        dto.mailgun = {
          apiKey: values.mailgunApiKey || undefined,
          domain: values.mailgunDomain,
        };
      } else if (values.driver === 'sendgrid') {
        dto.sendgrid = { apiKey: values.sendgridApiKey || undefined };
      }

      const updated = await mailConfigApi.saveMailConfig(dto);
      setConfig(updated);
      notify.success(t('settings.savedSuccessDatabase'));
    } catch (err: any) {
      notify.error(err, t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      notify.warning(t('settings.testEmailPlaceholder'));
      return;
    }
    setTesting(true);
    try {
      await mailConfigApi.sendTestEmail(testEmail);
      notify.success(`${t('settings.sendTestEmailBtn')}: ${testEmail}`);
    } catch (err: any) {
      notify.error(err, t('settings.testS3Failed'));
    } finally {
      setTesting(false);
    }
  };

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const url = await mailConfigApi.getGmailConnectUrl();
      window.location.href = url;
    } catch (err: any) {
      message.error(err.response?.data?.message || t('settings.testS3Failed'));
      setConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const updated = await mailConfigApi.disconnectGmail();
      setConfig(updated);
      setDriver(updated.driver);
      mailForm.setFieldValue('driver', updated.driver);
      notify.success(t('settings.savedSuccessDatabase'));
    } catch {
      notify.error(t('settings.testS3Failed'));
    }
  };

  return (
    <Spin spinning={loading}>
      <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Form
          form={mailForm}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ driver: 'log', sesRegion: 'us-east-1' }}
          component={false}
        >
          <Form.Item
            name="driver"
            label={t('settings.emailDriverLabel')}
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => setDriver(value)}
              options={[
                { value: 'log', label: t('settings.driverLog') },
                { value: 'smtp', label: t('settings.driverSmtp') },
                { value: 'gmail_oauth', label: t('settings.driverGmail') },
                { value: 'resend', label: t('settings.driverResend') },
                { value: 'ses', label: t('settings.driverSes') },
                { value: 'mailgun', label: t('settings.driverMailgun') },
                { value: 'sendgrid', label: t('settings.driverSendgrid') },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fromAddress" label={t('settings.fromAddress')}>
                <Input placeholder="noreply@domain.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fromName" label={t('settings.fromName')}>
                <Input placeholder="ECOMCX System" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px 0' }} />

          {/* GMAIL OAUTH DRIVER */}
          {driver === 'gmail_oauth' && (
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              {config?.gmailOauth?.configured ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    type="success"
                    showIcon
                    message={`${t('settings.gmailConnectedMessage')}: ${config.gmailOauth.email || ''}`}
                    description={t('settings.gmailConnectedHelp')}
                  />
                  <Button danger onClick={handleDisconnectGmail}>
                    {t('settings.gmailDisconnectBtn')}
                  </Button>
                </Space>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message={t('settings.gmailConnectTitle')}
                    description={t('settings.gmailConnectHelp')}
                  />
                  <Button
                    type="primary"
                    icon={<GoogleOutlined />}
                    loading={connectingGmail}
                    onClick={handleConnectGmail}
                    style={{ background: '#4285F4', borderColor: '#4285F4' }}
                  >
                    {t('settings.gmailConnectBtn')}
                  </Button>
                </Space>
              )}
            </div>
          )}

          {/* SMTP DRIVER */}
          {driver === 'smtp' && (
            <>
              <Form.Item label={t('settings.smtpProviderLabel')}>
                <Radio.Group
                  value={smtpProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  <Radio.Button value="gmail">Gmail</Radio.Button>
                  <Radio.Button value="outlook">Outlook / Office 365</Radio.Button>
                  <Radio.Button value="yahoo">Yahoo Mail</Radio.Button>
                  <Radio.Button value="custom">Custom Server</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item name="smtpHost" label={t('settings.smtpHost')} rules={[{ required: true }]}>
                    <Input placeholder="smtp.gmail.com" disabled={smtpProvider !== 'custom'} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="smtpPort" label={t('settings.smtpPort')} rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="587" disabled={smtpProvider !== 'custom'} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="smtpUsername" label={t('settings.smtpUsername')}>
                    <Input placeholder="your-email@gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpPassword"
                    label={t('settings.smtpAppPassword')}
                    extra={config?.smtp?.configured ? t('settings.savedPasswordInfo') : t('settings.smtpAppPasswordExtra')}
                  >
                    <Input.Password placeholder="••••••••••••••••" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* RESEND DRIVER */}
          {driver === 'resend' && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="resendApiKey"
                  label="Resend API Key"
                  extra={config?.resend?.configured ? t('settings.savedPasswordInfo') : 'Lấy key tại resend.com/api-keys'}
                >
                  <Input.Password placeholder="re_123456789..." />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* SES DRIVER */}
          {driver === 'ses' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="sesAccessKeyId"
                  label="AWS Access Key ID"
                  extra={config?.ses?.configured ? t('settings.savedPasswordInfo') : undefined}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="sesSecretAccessKey" label="AWS Secret Access Key">
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="sesRegion" label="AWS Region" rules={[{ required: true }]}>
                  <Input placeholder="us-east-1" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* MAILGUN DRIVER */}
          {driver === 'mailgun' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="mailgunApiKey"
                  label="Mailgun API Key"
                  extra={config?.mailgun?.configured ? t('settings.savedPasswordInfo') : undefined}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="mailgunDomain" label="Mailgun Domain" rules={[{ required: true }]}>
                  <Input placeholder="mg.yourdomain.com" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* SENDGRID DRIVER */}
          {driver === 'sendgrid' && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="sendgridApiKey"
                  label="SendGrid API Key"
                  extra={config?.sendgrid?.configured ? t('settings.savedPasswordInfo') : undefined}
                >
                  <Input.Password placeholder="SG...." />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider style={{ margin: '16px 0' }} />

          <Space wrap>
            <Button
              type="primary"
              onClick={() => mailForm.submit()}
              loading={saving}
              icon={<SaveOutlined />}
              style={{ fontWeight: 700 }}
            >
              {t('settings.saveEmailConfigBtn')}
            </Button>
          </Space>

          {/* GỬI MAIL THỬ NGHIỆM */}
          <Divider style={{ margin: '24px 0 16px 0' }} />
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>{t('settings.testEmailSectionTitle')}</h4>
            <Row gutter={12}>
              <Col xs={24} sm={16} md={12}>
                <Input
                  placeholder={t('settings.testEmailPlaceholder')}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Button
                  icon={<SendOutlined />}
                  loading={testing}
                  onClick={handleTestSend}
                  style={{ width: '100%' }}
                >
                  {t('settings.sendTestEmailBtn')}
                </Button>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </Spin>
  );
}
