import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, Form, Button, Tabs, Space, Spin, Modal } from 'antd';
import {
  SaveOutlined,
  CheckOutlined,
  SettingOutlined,
  PictureOutlined,
  ReadOutlined,
  EditOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { optionsApi } from '../../api/modules/options.api';
import { storageConfigApi } from '../../api/modules/storage-config.api';
import { queryClient } from '../../lib/query-client';
import { SYSTEM_OPTIONS_QUERY_KEY } from '../../hooks/useSystemOptions';
import { notify } from '../../utils/notify';
import { GeneralTab } from './components/GeneralTab';
import { MediaTab } from './components/MediaTab';
import { ReadingTab } from './components/ReadingTab';
import { WritingTab } from './components/WritingTab';
import { MailConfigTabContent } from './components/MailConfigTabContent';

const TAB_SLUG_MAP: Record<string, string> = {
  general: '1',
  media: '2',
  storage: '2',
  reading: '3',
  writing: '4',
  email: '5',
};

const TAB_KEY_TO_SLUG: Record<string, string> = {
  '1': 'general',
  '2': 'media',
  '3': 'reading',
  '4': 'writing',
  '5': 'email',
};

const toBoolean = (val: any): boolean | undefined => {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  return undefined;
};

const toNumber = (val: any): number | undefined => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

const toArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function SettingsModule() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [homepageDisplayType, setHomepageDisplayType] = useState<string>('latest');

  // Đọc tab slug từ URL (?tab=general, ?tab=media, ?tab=email...)
  const currentTabSlug = searchParams.get('tab') || 'general';
  const activeTab = TAB_SLUG_MAP[currentTabSlug] || '1';
  const handleTabChange = (key: string) => {
    const slug = TAB_KEY_TO_SLUG[key] || 'general';
    setSearchParams({ tab: slug }, { replace: true });
  };

  // Tab '1'-'4' dùng form chung (General, Media, Reading, Writing)
  // Tab '5' (Email) có form + nút Lưu riêng
  const isGeneralFormTab = ['1', '2', '3', '4'].includes(activeTab);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const [options, storageConfig] = await Promise.all([
          optionsApi.getOptions(),
          storageConfigApi.getStorageConfig().catch(() => null),
        ]);

        const rawAllowedImages = toArray(options.allowedImageTypes);
        const rawAllowedVideos = toArray(options.allowedVideoTypes);

        const valuesToSet = {
          // Storage Config
          disk: storageConfig?.disk || 'local',
          s3Region: storageConfig?.s3?.region || 'us-east-1',
          s3Bucket: storageConfig?.s3?.bucket || '',
          s3Endpoint: storageConfig?.s3?.endpoint || '',
          s3ForcePathStyle: storageConfig?.s3?.forcePathStyle ?? false,

          // General Settings
          siteTitle: options.siteTitle || 'ECOMCX Enterprise ERP Core',
          siteTagline: options.siteTagline || 'Nền Tảng Quản Trị Doanh Nghiệp Tối Ưu',
          siteFavicon: options.siteFavicon || '',
          siteLogo: options.siteLogo || '',
          adminEmail: options.adminEmail || 'admin@ecomcx.com',
          enableDepartments: toBoolean(options.enableDepartments) ?? true,
          defaultUserRole: options.defaultUserRole || 'STAFF',
          siteLanguage: options.siteLanguage || i18n.language || 'vi',
          timezone: options.timezone || 'Asia/Ho_Chi_Minh',
          dateFormat: options.dateFormat || 'DD/MM/YYYY',
          timeFormat: options.timeFormat || 'HH:mm:ss',
          weekStartDay: options.weekStartDay || 'Monday',

          // Media Settings
          allowedImageTypes: rawAllowedImages.length > 0 ? rawAllowedImages : ['jpg', 'png', 'webp', 'gif', 'svg'],
          maxImageSizeMb: toNumber(options.maxImageSizeMb) || 10,
          convertToWebp: toBoolean(options.convertToWebp) ?? true,
          media_strip_exif_metadata: toBoolean(options.media_strip_exif_metadata) ?? true,
          media_enable_sha256_deduplication: toBoolean(options.media_enable_sha256_deduplication) ?? true,
          media_compression_quality: toNumber(options.media_compression_quality) || 80,
          media_enable_watermark: toBoolean(options.media_enable_watermark) ?? false,
          media_watermark_text: options.media_watermark_text || 'ECOMCX ERP',
          media_enable_chunked_upload: toBoolean(options.media_enable_chunked_upload) ?? true,
          allowedVideoTypes: rawAllowedVideos.length > 0 ? rawAllowedVideos : ['mp4', 'webm', 'mov'],
          maxVideoSizeMb: toNumber(options.maxVideoSizeMb) || 1000,

          // Reading Settings
          homepageType: options.homepageType || 'latest',
          staticHomepageId: options.staticHomepageId || 'home',
          staticPostsPageId: options.staticPostsPageId || 'blog',
          postsPerPage: toNumber(options.postsPerPage) || 10,
          allowSearchIndexing: toBoolean(options.allowSearchIndexing) ?? true,

          // Writing Settings
          defaultCategory: options.defaultCategory || 'general',
          defaultPostFormat: options.defaultPostFormat || 'standard',
        };

        setLoading(false);
        setTimeout(() => {
          form.setFieldsValue(valuesToSet);
        }, 50);

        setHomepageDisplayType(options.homepageType || 'latest');
      } catch (err) {
        notify.error(err, t('settings.loadingFromDatabase'));
        setLoading(false);
      }
    };

    loadSettings();
  }, [form, i18n.language, t]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const storagePromise = values.disk
        ? storageConfigApi.saveStorageConfig({
            disk: values.disk,
            s3: values.disk === 's3' ? {
              accessKeyId: values.s3AccessKeyId || undefined,
              secretAccessKey: values.s3SecretAccessKey || undefined,
              region: values.s3Region,
              bucket: values.s3Bucket,
              endpoint: values.s3Endpoint || undefined,
              forcePathStyle: values.s3ForcePathStyle,
            } : undefined,
          })
        : Promise.resolve();

      const [updatedOptions] = await Promise.all([
        optionsApi.saveOptions(values),
        storagePromise,
      ]);

      if (values.siteLanguage && values.siteLanguage !== i18n.language) {
        i18n.changeLanguage(values.siteLanguage);
      }

      await queryClient.invalidateQueries({ queryKey: SYSTEM_OPTIONS_QUERY_KEY });

      if (updatedOptions && typeof updatedOptions === 'object') {
        form.setFieldsValue({
          ...values,
          maxImageSizeMb: toNumber(updatedOptions.maxImageSizeMb),
          maxVideoSizeMb: toNumber(updatedOptions.maxVideoSizeMb),
          media_compression_quality: toNumber(updatedOptions.media_compression_quality),
          postsPerPage: toNumber(updatedOptions.postsPerPage),
          enableDepartments: toBoolean(updatedOptions.enableDepartments),
          convertToWebp: toBoolean(updatedOptions.convertToWebp),
          media_strip_exif_metadata: toBoolean(updatedOptions.media_strip_exif_metadata),
          media_enable_sha256_deduplication: toBoolean(updatedOptions.media_enable_sha256_deduplication),
          media_enable_watermark: toBoolean(updatedOptions.media_enable_watermark),
          media_enable_chunked_upload: toBoolean(updatedOptions.media_enable_chunked_upload),
          allowSearchIndexing: toBoolean(updatedOptions.allowSearchIndexing),
        });
      }

      setSaved(true);
      notify.success(t('settings.savedSuccessDatabase'));
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      notify.error(err, t('settings.savedSuccessDatabase'));
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <Space>
          <SettingOutlined />
          {t('settings.tabGeneral')}
        </Space>
      ),
      children: <GeneralTab />,
      forceRender: true,
    },
    {
      key: '2',
      label: (
        <Space>
          <PictureOutlined />
          {t('settings.tabMedia')}
        </Space>
      ),
      children: <MediaTab />,
      forceRender: true,
    },
    {
      key: '3',
      label: (
        <Space>
          <ReadOutlined />
          {t('settings.tabReading')}
        </Space>
      ),
      children: (
        <ReadingTab
          homepageDisplayType={homepageDisplayType}
          setHomepageDisplayType={setHomepageDisplayType}
        />
      ),
      forceRender: true,
    },
    {
      key: '4',
      label: (
        <Space>
          <EditOutlined />
          {t('settings.tabWriting')}
        </Space>
      ),
      children: <WritingTab />,
      forceRender: true,
    },
    {
      key: '5',
      label: (
        <Space>
          <MailOutlined />
          {t('settings.tabEmail')}
        </Space>
      ),
      children: <MailConfigTabContent />,
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header Card */}
        <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('settings.title')}</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12 }}>
                {t('settings.subtitle')} {t('settings.savedToDatabaseInfo')}
              </p>
            </div>

            {/* Nút Lưu chung cho General/Media/Reading/Writing */}
            {isGeneralFormTab && (
              <Button
                type="primary"
                size="large"
                icon={saved ? <CheckOutlined /> : <SaveOutlined />}
                loading={saving}
                onClick={() => form.submit()}
                style={{ fontWeight: 700 }}
              >
                {saved ? t('settings.savedSuccess', 'Đã Lưu!') : t('settings.save')}
              </Button>
            )}
          </div>
        </Card>

        {/* Form chính chứa các Tabs */}
        <Form form={form} layout="vertical" onFinish={handleSave} preserve={true}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            type="card"
            size="large"
          />
        </Form>
      </div>
    </Spin>
  );
}
