import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Input, Button, Tabs, Select, Radio, Space, Modal, Form, Tooltip, message, Popconfirm, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  CodeOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { translationsApi } from '../../api/modules/translations.api';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';

interface KeyValueItem {
  key: string;
  value: string;
}

const PRESET_ISO_LANGUAGES = [
  { value: 'zh', label: '🇨🇳 Tiếng Trung (zh)', name: '🇨🇳 Tiếng Trung (zh)' },
  { value: 'ja', label: '🇯🇵 Tiếng Nhật (ja)', name: '🇯🇵 Tiếng Nhật (ja)' },
  { value: 'kr', label: '🇰🇷 Tiếng Hàn (kr)', name: '🇰🇷 Tiếng Hàn (kr)' },
  { value: 'th', label: '🇹🇭 Tiếng Thái (th)', name: '🇹🇭 Tiếng Thái (th)' },
  { value: 'fr', label: '🇫🇷 Tiếng Pháp (fr)', name: '🇫🇷 Tiếng Pháp (fr)' },
  { value: 'de', label: '🇩🇪 Tiếng Đức (de)', name: '🇩🇪 Tiếng Đức (de)' },
  { value: 'es', label: '🇪🇸 Tiếng Tây Ban Nha (es)', name: '🇪🇸 Tiếng Tây Ban Nha (es)' },
  { value: 'ru', label: '🇷🇺 Tiếng Nga (ru)', name: '🇷🇺 Tiếng Nga (ru)' },
  { value: 'it', label: '🇮🇹 Tiếng Ý (it)', name: '🇮🇹 Tiếng Ý (it)' },
  { value: 'pt', label: '🇵🇹 Tiếng Bồ Đào Nha (pt)', name: '🇵🇹 Tiếng Bồ Đào Nha (pt)' },
  { value: 'id', label: '🇮🇩 Tiếng Indonesia (id)', name: '🇮🇩 Tiếng Indonesia (id)' },
  { value: 'ms', label: '🇲🇾 Tiếng Mã Lai (ms)', name: '🇲🇾 Tiếng Mã Lai (ms)' },
];

export default function TranslationsModule() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [addForm] = Form.useForm();
  const [addLangForm] = Form.useForm();

  // 1. Sync UI state directly with URL Search Parameters
  const [searchParams, setSearchParams] = useSearchParams();

  const activeScope = (searchParams.get('scope') as 'backend' | 'frontend') || 'backend';
  const selectedBackendDomain = searchParams.get('domain') || 'permissions';
  const selectedLang = searchParams.get('lang') || 'vi';
  const searchText = searchParams.get('search') || '';

  const updateQueryParams = (newParams: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handleScopeChange = (scope: 'backend' | 'frontend') => {
    updateQueryParams({
      scope,
      domain: scope === 'backend' ? 'permissions' : 'locales',
    });
  };

  const handleDomainChange = (domain: string) => {
    updateQueryParams({ domain });
  };

  const handleLangChange = (lang: string) => {
    updateQueryParams({ lang });
  };

  const handleSearchChange = (val: string) => {
    updateQueryParams({ search: val || undefined });
  };

  // Editing state: Record<key, value>
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddLangModalOpen, setIsAddLangModalOpen] = useState<boolean>(false);
  const [isAddingKey, setIsAddingKey] = useState<boolean>(false);

  const domainName = activeScope === 'backend' ? selectedBackendDomain : 'locales';

  // Dynamic Languages & Domains metadata
  const { data: domainsMeta } = useQuery({
    queryKey: ['translation-domains'],
    queryFn: translationsApi.getDomains,
    enabled: isAuthenticated,
  });

  const languagesList = useMemo(() => {
    return (
      domainsMeta?.languages || [
        { code: 'vi', name: '🇻🇳 Tiếng Việt (vi)' },
        { code: 'en', name: '🇺🇸 English (en)' },
      ]
    );
  }, [domainsMeta]);

  const { data: rawTranslations = {}, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['translations', activeScope, domainName, selectedLang],
    queryFn: () => translationsApi.getTranslations(activeScope, domainName, selectedLang),
    enabled: isAuthenticated,
  });

  // Sync rawTranslations to local editedData state safely when data changes
  useEffect(() => {
    if (rawTranslations && typeof rawTranslations === 'object') {
      setEditedData(rawTranslations);
      setIsDirty(false);
    }
  }, [rawTranslations]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return translationsApi.updateTranslations(activeScope, domainName, selectedLang, editedData);
    },
    onSuccess: () => {
      message.success(t('translations.saveSuccess', 'Đã lưu và cập nhật tệp từ điển i18n thành công!'));
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['translations', activeScope, domainName] });
    },
    onError: () => {
      message.error(t('translations.saveError', 'Không thể lưu tệp từ điển i18n!'));
    },
  });

  const addLangMutation = useMutation({
    mutationFn: async (values: { code: string; name?: string; cloneFrom?: string }) => {
      return translationsApi.addLanguage(values);
    },
    onSuccess: (data, variables) => {
      message.success(data?.message || t('translations.addLangSuccess', 'Đã khởi tạo thành công gói ngôn ngữ mới!'));
      setIsAddLangModalOpen(false);
      addLangForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['translation-domains'] });
      handleLangChange(variables.code.toLowerCase());
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || t('translations.addLangError', 'Không thể tạo ngôn ngữ mới!'));
    },
  });

  const handleCellChange = (key: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleDeleteKey = (keyToDelete: string) => {
    setEditedData((prev) => {
      const copy = { ...prev };
      delete copy[keyToDelete];
      return copy;
    });
    setIsDirty(true);
    message.info(t('translations.keyDeleted', { key: keyToDelete, defaultValue: `Đã xóa key: ${keyToDelete}` }));
  };

  // Add new translation key for ALL registered languages dynamically
  const handleAddKey = async (formValues: Record<string, string>) => {
    const cleanKey = (formValues.key || '').trim();
    if (!cleanKey) return;

    setIsAddingKey(true);
    try {
      // Update each language file dynamically
      await Promise.all(
        languagesList.map(async (langObj) => {
          const langCode = langObj.code;
          const valForLang = formValues[`value_${langCode}`] || '';
          const currentDict = await translationsApi.getTranslations(activeScope, domainName, langCode);
          return translationsApi.updateTranslations(activeScope, domainName, langCode, {
            ...currentDict,
            [cleanKey]: valForLang,
          });
        }),
      );

      message.success(
        t('translations.keyAddedBoth', {
          key: cleanKey,
          defaultValue: `Đã thêm key mới [${cleanKey}] đa ngôn ngữ thành công!`,
        }),
      );
      setIsAddModalOpen(false);
      addForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['translations', activeScope, domainName] });
    } catch (err: any) {
      message.error(t('translations.addKeyError', 'Không thể thêm key dịch!'));
    } finally {
      setIsAddingKey(false);
    }
  };

  const handleIsoSelect = (codeValue: string) => {
    const found = PRESET_ISO_LANGUAGES.find((item) => item.value === codeValue);
    if (found) {
      addLangForm.setFieldsValue({ name: found.name });
    }
  };

  // Filter table data safely without vanishing rows when erasing text
  const tableData: KeyValueItem[] = useMemo(() => {
    const query = searchText.toLowerCase().trim();
    return Object.entries(editedData)
      .map(([key, value]) => ({ key, value }))
      .filter((item) => {
        if (!query) return true;
        const keyMatch = item.key.toLowerCase().includes(query);
        const origMatch = (rawTranslations[item.key] || '').toLowerCase().includes(query);
        const currMatch = (item.value || '').toLowerCase().includes(query);
        return keyMatch || origMatch || currMatch;
      });
  }, [editedData, rawTranslations, searchText]);

  const columns: ColumnsType<KeyValueItem> = [
    {
      title: t('translations.keyColumn', 'Mã Dịch (Translation Key)'),
      dataIndex: 'key',
      key: 'key',
      width: 320,
      render: (text: string) => (
        <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: 13 }}>
          {text}
        </code>
      ),
    },
    {
      title: t('translations.valueColumn', { lang: selectedLang.toUpperCase(), defaultValue: `Giá Trị Hiển Thị (${selectedLang.toUpperCase()})` }),
      dataIndex: 'value',
      key: 'value',
      render: (text: string, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={text}
          onChange={(e) => handleCellChange(record.key, e.target.value)}
          style={{ borderRadius: 6, fontSize: 13 }}
        />
      ),
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: any, record) => (
        <Can permission="translation:update">
          <Popconfirm
            title={t('translations.deleteConfirmTitle', 'Xóa Key Dịch Này?')}
            description={t('translations.deleteConfirmDesc', 'Bạn có chắc chắn muốn xóa key này khỏi tệp dịch không?')}
            onConfirm={() => handleDeleteKey(record.key)}
            okText={t('common.delete', 'Xóa')}
            cancelText={t('common.cancel', 'Hủy')}
          >
            <Tooltip title={t('translations.deleteKeyTooltip', 'Xóa Key')}>
              <Button size="small" danger icon={<DeleteOutlined style={{ fontSize: 13 }} />} style={{ borderRadius: 6 }} />
            </Tooltip>
          </Popconfirm>
        </Can>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Card */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <GlobalOutlined style={{ color: '#2563eb' }} />
              {t('translations.title', 'Quản Lý & Chỉnh Sửa Bản Dịch i18n')}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              {t('translations.subtitle', 'Cấu hình từ điển đa ngôn ngữ i18n cho Backend API và Frontend Admin UI')}
            </p>
          </div>

          <Space wrap size="middle">
            {isDirty && <Badge status="processing" text={<span style={{ color: '#d97706', fontWeight: 600 }}>{t('translations.dirtyWarning', 'Có thay đổi chưa lưu')}</span>} />}

            <Button
              icon={<ReloadOutlined spin={isRefetching} />}
              onClick={() => refetch()}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t('table.refresh', 'Làm Mới')}
            </Button>

            <Can permission="translation:create">
              <Button
                icon={<TranslationOutlined />}
                onClick={() => setIsAddLangModalOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                {t('translations.addLangBtn', 'Thêm Ngôn Ngữ')}
              </Button>
            </Can>

            <Can permission="translation:update">
              <Button
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                {t('translations.addKey', 'Thêm Key Dịch')}
              </Button>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                style={{ backgroundColor: '#059669', borderRadius: 8, fontWeight: 700 }}
              >
                {t('translations.save', 'Lưu Bản Dịch')}
              </Button>
            </Can>
          </Space>
        </div>

        {/* Scope Tabs & Language Controls */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Tabs
            activeKey={activeScope}
            onChange={(k) => handleScopeChange(k as any)}
            items={[
              {
                key: 'backend',
                label: (
                  <Space>
                    <DatabaseOutlined />
                    {t('translations.backendTab', 'Dịch Hệ Thống Backend (API & Permissions)')}
                  </Space>
                ),
              },
              {
                key: 'frontend',
                label: (
                  <Space>
                    <CodeOutlined />
                    {t('translations.frontendTab', 'Dịch Giao Diện Frontend (React Admin)')}
                  </Space>
                ),
              },
            ]}
          />

          <Space wrap size="middle">
            {activeScope === 'backend' && (
              <Select
                value={selectedBackendDomain}
                onChange={handleDomainChange}
                options={[
                  { value: 'permissions', label: t('translations.domainPermissions', 'Quyền Hạn (permissions.json)') },
                  { value: 'messages', label: t('translations.domainMessages', 'Thông Báo Phản Hồi (messages.json)') },
                  { value: 'auth', label: t('translations.domainAuth', 'Xác Thực & Login (auth.json)') },
                  { value: 'notification', label: t('translations.domainNotification', 'Thông Báo (notification.json)') },
                  { value: 'audit', label: t('translations.domainAudit', 'Nhật Ký Thao Tác (audit.json)') },
                  { value: 'validation', label: t('translations.domainValidation', 'Kiểm Định DTO (validation.json)') },
                ]}
                style={{ width: 260, borderRadius: 6 }}
              />
            )}

            {/* Dynamic Languages Selector */}
            <Radio.Group
              value={selectedLang}
              onChange={(e) => handleLangChange(e.target.value)}
              buttonStyle="solid"
            >
              {languagesList.map((lang) => (
                <Radio.Button key={lang.code} value={lang.code}>
                  {lang.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Space>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: 12 }}>
          <Input
            placeholder={t('translations.searchPlaceholder', 'Tìm kiếm theo mã key dịch hoặc nội dung...')}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ maxWidth: 420, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* Translations Table */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Multi-Language Add New Key Modal */}
      <Modal
        title={t('translations.addModalTitle', 'Thêm Key Dịch Mới (Đa Ngôn Ngữ)')}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        confirmLoading={isAddingKey}
        okText={t('common.add', 'Thêm Key')}
        cancelText={t('common.cancel', 'Hủy')}
        width={560}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddKey} style={{ marginTop: 16 }}>
          <Form.Item
            name="key"
            label={t('translations.keyLabel', 'Mã Key Dịch (Dot Notation)')}
            rules={[{ required: true, message: 'Vui lòng nhập mã key dịch!' }]}
            extra={t('translations.keyPlaceholder', 'Ví dụ: permissions.user.create.name hoặc nav.reports')}
          >
            <Input placeholder="permissions.user.create.name" style={{ borderRadius: 6 }} />
          </Form.Item>

          {languagesList.map((lang) => (
            <Form.Item
              key={lang.code}
              name={`value_${lang.code}`}
              label={`Nội Dung Bản Dịch [${lang.name}]`}
            >
              <Input.TextArea rows={2} placeholder={`Nhập nội dung hiển thị cho ${lang.name}...`} style={{ borderRadius: 6 }} />
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* Standardized ISO Select Add New Language Modal */}
      <Modal
        title={t('translations.addLangTitle', 'Khởi Tạo Ngôn Ngữ Mới (Standard ISO Code)')}
        open={isAddLangModalOpen}
        onCancel={() => setIsAddLangModalOpen(false)}
        onOk={() => addLangForm.submit()}
        confirmLoading={addLangMutation.isPending}
        okText={t('common.create', 'Khởi Tạo')}
        cancelText={t('common.cancel', 'Hủy')}
        width={500}
      >
        <Form form={addLangForm} layout="vertical" onFinish={(vals) => addLangMutation.mutate(vals)} style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label={t('translations.langCodeLabel', 'Mã ISO Ngôn Ngữ Chuẩn (Standard ISO Code)')}
            rules={[{ required: true, message: 'Vui lòng chọn mã ISO ngôn ngữ!' }]}
          >
            <Select
              showSearch
              placeholder="Chọn mã ISO ngôn ngữ chuẩn (zh, ja, kr, fr...)"
              options={PRESET_ISO_LANGUAGES}
              onChange={handleIsoSelect}
              optionFilterProp="label"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('translations.langNameLabel', 'Tên Hiển Thị (Display Name)')}
            rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
          >
            <Input placeholder="🇨🇳 Tiếng Trung (zh)" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item
            name="cloneFrom"
            label={t('translations.cloneFromLabel', 'Sao Chép Bộ Từ Điển Mẫu Từ')}
            initialValue="vi"
          >
            <Select
              options={languagesList.map((l) => ({ value: l.code, label: l.name }))}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
