import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Button, Row, Col, Select, Tabs, Radio, InputNumber, Upload, Space, Divider, Spin, Alert, message } from 'antd';
import { SaveOutlined, CheckOutlined, SettingOutlined, PictureOutlined, ReadOutlined, EditOutlined, UploadOutlined, MailOutlined, GoogleOutlined, SendOutlined, CloudServerOutlined } from '@ant-design/icons';
import { optionsApi } from '../../api/modules/options.api';
import { mailConfigApi, MailConfigResponse, MailConfigSaveDto, MailDriverName } from '../../api/modules/mail-config.api';
import { storageConfigApi, StorageConfigResponse, StorageConfigSaveDto, StorageDriverName } from '../../api/modules/storage-config.api';
import { queryClient } from '../../lib/query-client';
import { SYSTEM_OPTIONS_QUERY_KEY } from '../../hooks/useSystemOptions';
import { notify } from '../../utils/notify';

type SmtpProviderPreset = 'gmail' | 'outlook' | 'yahoo' | 'custom';

const SMTP_PROVIDER_PRESETS: Record<Exclude<SmtpProviderPreset, 'custom'>, { host: string; port: number }> = {
  gmail: { host: 'smtp.gmail.com', port: 587 },
  outlook: { host: 'smtp.office365.com', port: 587 },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 587 },
};

function MailConfigTabContent() {
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
        sesRegion: data.ses?.region || 'us-east-1',
        mailgunDomain: data.mailgun?.domain,
      });
    } catch (err) {
      notify.error(err, 'Không thể tải cấu hình email. Vui lòng thử lại.');
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
      message.success('Đã lưu cấu hình gửi mail thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu cấu hình gửi mail!');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      message.warning('Vui lòng nhập email nhận thử nghiệm!');
      return;
    }
    setTesting(true);
    try {
      await mailConfigApi.sendTestEmail(testEmail);
      message.success(`Đã gửi email thử nghiệm tới ${testEmail}!`);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Gửi email thử nghiệm thất bại!');
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
      message.error(err.response?.data?.message || 'Không thể lấy URL kết nối Google!');
      setConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const updated = await mailConfigApi.disconnectGmail();
      setConfig(updated);
      setDriver(updated.driver);
      mailForm.setFieldValue('driver', updated.driver);
      message.success('Đã ngắt kết nối Gmail!');
    } catch {
      message.error('Không thể ngắt kết nối Gmail!');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Form
          form={mailForm}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ driver: 'log', sesRegion: 'us-east-1' }}
        >
          <Form.Item
            name="driver"
            label="Nhà Cung Cấp Gửi Mail (Driver)"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => setDriver(value)}
              options={[
                { value: 'log', label: 'Ghi Log (Development — không gửi mail thật)' },
                { value: 'smtp', label: 'SMTP (App Password)' },
                { value: 'gmail_oauth', label: 'Gmail — Kết Nối Google (Khuyến Nghị)' },
                { value: 'resend', label: 'Resend' },
                { value: 'ses', label: 'Amazon SES' },
                { value: 'mailgun', label: 'Mailgun' },
                { value: 'sendgrid', label: 'SendGrid' },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fromAddress" label="Email Người Gửi (From Address)">
                <Input placeholder="no-reply@yourdomain.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fromName" label="Tên Người Gửi (From Name)">
                <Input placeholder="ECOMCX ERP" />
              </Form.Item>
            </Col>
          </Row>

          {driver === 'smtp' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Form.Item label="Nhà Cung Cấp SMTP">
                <Select
                  value={smtpProvider}
                  onChange={handleProviderChange}
                  options={[
                    { value: 'gmail', label: 'Gmail' },
                    { value: 'outlook', label: 'Outlook / Office365' },
                    { value: 'yahoo', label: 'Yahoo Mail' },
                    { value: 'custom', label: 'Custom SMTP Server' },
                  ]}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="smtpHost" label="SMTP Host" rules={[{ required: true }]}>
                    <Input disabled={smtpProvider !== 'custom'} placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="smtpPort" label="SMTP Port" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} disabled={smtpProvider !== 'custom'} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="smtpUsername" label="Email / Username">
                    <Input placeholder="you@gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpPassword"
                    label="Mật Khẩu Ứng Dụng (App Password)"
                    extra={
                      config?.smtp?.configured
                        ? 'Đã lưu — để trống nếu không muốn đổi'
                        : 'Gmail: tạo tại myaccount.google.com/apppasswords (bật xác minh 2 bước trước)'
                    }
                  >
                    <Input.Password placeholder={config?.smtp?.configured ? '••••••••' : ''} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {driver === 'gmail_oauth' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              {config?.gmailOauth?.configured ? (
                <Alert
                  type="success"
                  showIcon
                  message={`Đã kết nối: ${config.gmailOauth.email}`}
                  description="Hệ thống sẽ gửi mail qua Gmail API bằng tài khoản đã kết nối, không cần mật khẩu."
                  action={
                    <Button danger size="small" onClick={handleDisconnectGmail}>
                      Ngắt Kết Nối
                    </Button>
                  }
                />
              ) : (
                <Button
                  icon={<GoogleOutlined />}
                  loading={connectingGmail}
                  onClick={handleConnectGmail}
                  style={{ fontWeight: 700 }}
                >
                  Kết Nối Với Google
                </Button>
              )}
            </>
          )}

          {driver === 'resend' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Form.Item
                name="resendApiKey"
                label="Resend API Key"
                extra={config?.resend?.configured ? 'Đã lưu — để trống nếu không muốn đổi' : 'Lấy tại resend.com/api-keys'}
              >
                <Input.Password placeholder={config?.resend?.configured ? '••••••••' : 're_xxxxxxxxxxxx'} />
              </Form.Item>
            </>
          )}

          {driver === 'ses' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="sesAccessKeyId"
                    label="AWS Access Key ID"
                    extra={config?.ses?.configured ? 'Đã lưu — để trống nếu không muốn đổi' : undefined}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="sesSecretAccessKey" label="AWS Secret Access Key">
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="sesRegion" label="AWS Region" rules={[{ required: true }]}>
                    <Input placeholder="us-east-1" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {driver === 'mailgun' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="mailgunApiKey"
                    label="Mailgun API Key"
                    extra={config?.mailgun?.configured ? 'Đã lưu — để trống nếu không muốn đổi' : undefined}
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
            </>
          )}

          {driver === 'sendgrid' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Form.Item
                name="sendgridApiKey"
                label="SendGrid API Key"
                extra={config?.sendgrid?.configured ? 'Đã lưu — để trống nếu không muốn đổi' : undefined}
              >
                <Input.Password placeholder={config?.sendgrid?.configured ? '••••••••' : 'SG.xxxxxxxxxxxx'} />
              </Form.Item>
            </>
          )}

          <Divider style={{ margin: '16px 0' }} />
          <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} style={{ fontWeight: 700 }}>
            Lưu Cấu Hình Email
          </Button>
        </Form>

        <Divider style={{ margin: '24px 0 16px 0' }} />

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Gửi Email Thử Nghiệm</div>
          <Space.Compact style={{ width: '100%', maxWidth: 440 }}>
            <Input
              placeholder="nhap-email-nhan@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button type="primary" icon={<SendOutlined />} loading={testing} onClick={handleTestSend}>
              Gửi Thử
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </Spin>
  );
}

function StorageConfigTabContent() {
  const [storageForm] = Form.useForm();
  const [disk, setDisk] = useState<StorageDriverName>('local');
  const [config, setConfig] = useState<StorageConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await storageConfigApi.getStorageConfig();
      setConfig(data);
      setDisk(data.disk);
      storageForm.setFieldsValue({
        disk: data.disk,
        s3Region: data.s3?.region || 'us-east-1',
        s3Bucket: data.s3?.bucket,
        s3Endpoint: data.s3?.endpoint,
        s3ForcePathStyle: data.s3?.forcePathStyle,
      });
    } catch (err) {
      notify.error(err, 'Không thể tải cấu hình lưu trữ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const dto: StorageConfigSaveDto = { disk: values.disk };
      if (values.disk === 's3') {
        dto.s3 = {
          accessKeyId: values.s3AccessKeyId || undefined,
          secretAccessKey: values.s3SecretAccessKey || undefined,
          region: values.s3Region,
          bucket: values.s3Bucket,
          endpoint: values.s3Endpoint || undefined,
          forcePathStyle: values.s3ForcePathStyle,
        };
      }
      const updated = await storageConfigApi.saveStorageConfig(dto);
      setConfig(updated);
      message.success('Đã lưu cấu hình lưu trữ media thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu cấu hình lưu trữ!');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await storageConfigApi.testConnection();
      message.success('Kết nối S3/MinIO thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Kết nối thất bại!');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Form
          form={storageForm}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ disk: 'local', s3Region: 'us-east-1' }}
        >
          <Form.Item name="disk" label="Nơi Lưu Trữ Media (Driver)" rules={[{ required: true }]}>
            <Select
              onChange={(value) => setDisk(value)}
              options={[
                { value: 'local', label: 'Local Disk (Lưu trên server, mặc định)' },
                { value: 's3', label: 'Amazon S3 / MinIO / S3-Compatible' },
              ]}
            />
          </Form.Item>

          {disk === 's3' && (
            <>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="s3AccessKeyId"
                    label="Access Key ID"
                    extra={config?.s3?.configured ? 'Đã lưu — để trống nếu không muốn đổi' : undefined}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="s3SecretAccessKey" label="Secret Access Key">
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="s3Region" label="Region" rules={[{ required: true }]}>
                    <Input placeholder="us-east-1" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="s3Bucket" label="Bucket" rules={[{ required: true }]}>
                    <Input placeholder="my-app-media" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="s3Endpoint"
                    label="Endpoint (chỉ cần cho MinIO / S3-Compatible khác AWS)"
                  >
                    <Input placeholder="https://minio.yourdomain.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="s3ForcePathStyle"
                    label="Path-Style Access"
                    valuePropName="checked"
                    extra="Bật khi dùng MinIO"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Divider style={{ margin: '16px 0' }} />
          <Space>
            <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} style={{ fontWeight: 700 }}>
              Lưu Cấu Hình Lưu Trữ
            </Button>
            {disk === 's3' && (
              <Button icon={<CloudServerOutlined />} loading={testing} onClick={handleTestConnection}>
                Kiểm Tra Kết Nối
              </Button>
            )}
          </Space>
        </Form>
      </Card>
    </Spin>
  );
}

export default function SettingsModule() {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [homepageDisplayType, setHomepageDisplayType] = useState<'latest' | 'static'>('latest');

  // Load all settings live from NestJS Options API
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const options = await optionsApi.getOptions();

        form.setFieldsValue({
          // General Settings
          siteTitle: options.siteTitle || 'ECOMCX Enterprise ERP Core',
          siteTagline: options.siteTagline || 'Nền Tảng Quản Trị Doanh Nghiệp Tối Ưu',
          adminEmail: options.adminEmail || 'admin@ecomcx.com',
          enableDepartments: options.enableDepartments !== false,
          defaultUserRole: options.defaultUserRole || 'STAFF',
          siteLanguage: options.siteLanguage || i18n.language || 'vi',
          timezone: options.timezone || 'Asia/Ho_Chi_Minh',
          dateFormat: options.dateFormat || 'DD/MM/YYYY',
          timeFormat: options.timeFormat || 'HH:mm:ss',
          weekStartDay: options.weekStartDay || 'Monday',

          // Media Settings
          allowedImageTypes: options.allowedImageTypes || ['jpg', 'png', 'webp', 'gif', 'svg'],
          maxImageSizeMb: options.maxImageSizeMb || 10,
          convertToWebp: options.convertToWebp !== false,
          allowedVideoTypes: options.allowedVideoTypes || ['mp4', 'webm', 'mov'],
          maxVideoSizeMb: options.maxVideoSizeMb || 100,

          // Reading Settings
          homepageType: options.homepageType || 'latest',
          staticHomepageId: options.staticHomepageId || 'home',
          staticPostsPageId: options.staticPostsPageId || 'blog',
          postsPerPage: options.postsPerPage || 10,
          allowSearchIndexing: options.allowSearchIndexing !== false,

          // Writing Settings
          defaultCategory: options.defaultCategory || 'general',
          defaultPostFormat: options.defaultPostFormat || 'standard',
        });

        setHomepageDisplayType(options.homepageType || 'latest');
      } catch (err) {
        console.error('Lỗi khi nạp cấu hình:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [form, i18n.language]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await optionsApi.saveOptions(values);

      if (values.siteLanguage && values.siteLanguage !== i18n.language) {
        i18n.changeLanguage(values.siteLanguage);
      }

      await queryClient.invalidateQueries({ queryKey: SYSTEM_OPTIONS_QUERY_KEY });

      setSaved(true);
      message.success(t('settings.savedSuccessDatabase'));
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình:', err);
      message.error('Không thể lưu cấu hình vào Database!');
    } finally {
      setSaving(false);
    }
  };

  const generalTabContent = (
    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="siteTitle" label={t('settings.siteTitle')} rules={[{ required: true }]}>
            <Input placeholder="ECOMCX Enterprise ERP" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteTagline" label={t('settings.siteTagline')}>
            <Input placeholder="Nền tảng quản trị tổng thể doanh nghiệp" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteFavicon" label={t('settings.siteFavicon')}>
            <Upload listType="picture" maxCount={1} action="#">
              <Button icon={<UploadOutlined />}>{t('settings.uploadFaviconButton')}</Button>
            </Upload>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="adminEmail" label={t('settings.adminEmail')} rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@ecomcx.com" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="enable2FA"
            label={t('settings.enable2FA')}
            valuePropName="checked"
            extra={t('settings.enable2FAHelp')}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="defaultUserRole" label={t('settings.defaultRole')}>
            <Select
              options={[
                { value: 'STAFF', label: 'Nhân Viên (Staff)' },
                { value: 'MANAGER', label: 'Quản Lý (Manager)' },
                { value: 'DEVELOPER', label: 'Lập Trình Viên (Developer)' },
                { value: 'USER', label: 'Người Dùng Cơ Bản (User)' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteLanguage" label={t('settings.siteLanguage')}>
            <Select
              options={[
                { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
                { value: 'en', label: 'English (Mỹ)' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="timezone" label={t('settings.timezone')}>
            <Select
              options={[
                { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (UTC +07:00)' },
                { value: 'UTC', label: 'UTC (Giờ Phối Hợp Quốc Tế)' },
                { value: 'America/New_York', label: 'America/New_York (UTC -05:00)' },
                { value: 'Europe/London', label: 'Europe/London (UTC +00:00)' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="dateFormat" label={t('settings.dateFormat')}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Radio value="DD/MM/YYYY">DD/MM/YYYY (24/07/2026)</Radio>
              <Radio value="YYYY-MM-DD">YYYY-MM-DD (2026-07-24)</Radio>
              <Radio value="MM/DD/YYYY">MM/DD/YYYY (07/24/2026)</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="timeFormat" label={t('settings.timeFormat')}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Radio value="HH:mm:ss">24 Giờ (14:30:00)</Radio>
              <Radio value="hh:mm A">12 Giờ (02:30 PM)</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="weekStartDay" label={t('settings.weekStartDay')}>
            <Select
              options={[
                { value: 'Monday', label: 'Thứ Hai (Monday)' },
                { value: 'Sunday', label: 'Chủ Nhật (Sunday)' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const mediaTabContent = (
    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="allowedImageTypes" label={t('settings.allowedImageTypes')}>
            <Select
              mode="tags"
              placeholder={t('settings.selectImageTypesPlaceholder')}
              options={[
                { value: 'jpg', label: 'JPG / JPEG' },
                { value: 'png', label: 'PNG' },
                { value: 'webp', label: 'WEBP' },
                { value: 'gif', label: 'GIF' },
                { value: 'svg', label: 'SVG' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="maxImageSizeMb" label={t('settings.maxImageSizeMb')}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="MB" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="convertToWebp"
            label={t('settings.convertToWebp')}
            valuePropName="checked"
            extra={t('settings.convertToWebpHelp')}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="allowedVideoTypes" label={t('settings.allowedVideoTypes')}>
            <Select
              mode="tags"
              placeholder={t('settings.selectVideoTypesPlaceholder')}
              options={[
                { value: 'mp4', label: 'MP4' },
                { value: 'webm', label: 'WEBM' },
                { value: 'mov', label: 'MOV' },
                { value: 'mkv', label: 'MKV' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="maxVideoSizeMb" label={t('settings.maxVideoSizeMb')}>
            <InputNumber min={10} max={1000} style={{ width: '100%' }} addonAfter="MB" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const readingTabContent = (
    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item name="homepageType" label={t('settings.homepageType')}>
            <Radio.Group
              onChange={(e) => setHomepageDisplayType(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <Radio value="latest">{t('settings.latestPosts')}</Radio>
              <Radio value="static">{t('settings.staticPage')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        {homepageDisplayType === 'static' && (
          <Col xs={24} style={{ paddingLeft: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="staticHomepageId" label={t('settings.selectHomepage')}>
                  <Select
                    options={[
                      { value: 'home', label: '— Chọn Trang Chủ tĩnh —' },
                      { value: 'dashboard', label: 'Trang Dashboard Tổng Quan' },
                      { value: 'landing', label: 'Trang Giới Thiệu Doanh Nghiệp' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="staticPostsPageId" label={t('settings.selectPostsPage')}>
                  <Select
                    options={[
                      { value: 'blog', label: '— Chọn Trang Bài Viết —' },
                      { value: 'news', label: 'Trang Tin Tức & Thông Báo Nội Bộ' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        )}

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="postsPerPage" label={t('settings.postsPerPage')}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="Bài viết" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="allowSearchIndexing"
            label={t('settings.allowSearchIndexing')}
            valuePropName="checked"
            extra={t('settings.allowSearchIndexingHelp')}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const writingTabContent = (
    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="defaultCategory" label={t('settings.defaultCategory')}>
            <Select
              options={[
                { value: 'general', label: 'Chưa Phân Loại (General)' },
                { value: 'news', label: 'Tin Tức Doanh Nghiệp' },
                { value: 'tech', label: 'Thông Báo Công Nghệ' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="defaultPostFormat" label={t('settings.defaultPostFormat')}>
            <Select
              options={[
                { value: 'standard', label: 'Chuẩn (Standard Article)' },
                { value: 'gallery', label: 'Bộ Ảnh (Image Gallery)' },
                { value: 'video', label: 'Video Clip' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const tabItems = [
    {
      key: '1',
      label: (
        <Space>
          <SettingOutlined />
          {t('settings.tabGeneral')}
        </Space>
      ),
      children: generalTabContent,
    },
    {
      key: '2',
      label: (
        <Space>
          <PictureOutlined />
          {t('settings.tabMedia')}
        </Space>
      ),
      children: mediaTabContent,
    },
    {
      key: '3',
      label: (
        <Space>
          <ReadOutlined />
          {t('settings.tabReading')}
        </Space>
      ),
      children: readingTabContent,
    },
    {
      key: '4',
      label: (
        <Space>
          <EditOutlined />
          {t('settings.tabWriting')}
        </Space>
      ),
      children: writingTabContent,
    },
    {
      key: '5',
      label: (
        <Space>
          <MailOutlined />
          Cấu Hình Email
        </Space>
      ),
      children: <MailConfigTabContent />,
    },
    {
      key: '6',
      label: (
        <Space>
          <CloudServerOutlined />
          Lưu Trữ
        </Space>
      ),
      children: <StorageConfigTabContent />,
    },
  ];

  return (
    <Spin spinning={loading} tip={t('settings.loadingFromDatabase')}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header Card */}
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('settings.title')}</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12 }}>
                {t('settings.subtitle')} {t('settings.savedToDatabaseInfo')}
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              icon={saved ? <CheckOutlined /> : <SaveOutlined />}
              loading={saving}
              onClick={() => form.submit()}
              style={{ fontWeight: 700 }}
            >
              {saved ? 'Đã Lưu!' : t('settings.save')}
            </Button>
          </div>
        </Card>

        {/* Main Settings Form Tabs */}
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Tabs defaultActiveKey="1" items={tabItems} type="card" size="large" />
        </Form>
      </div>
    </Spin>
  );
}
