import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Button, Row, Col, Select, Tabs, Radio, InputNumber, Upload, Space, Divider, Spin, message } from 'antd';
import { SaveOutlined, CheckOutlined, SettingOutlined, PictureOutlined, ReadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { optionsApi } from '../../api/modules/options.api';
import { queryClient } from '../../lib/query-client';
import { SYSTEM_OPTIONS_QUERY_KEY } from '../../hooks/useSystemOptions';

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
            name="enableDepartments"
            label={t('settings.enableDepartments')}
            valuePropName="checked"
            extra={t('settings.enableDepartmentsHelp')}
          >
            <Switch />
          </Form.Item>
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
