import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Card, Popconfirm, Tooltip, message, Grid, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApiOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { webhooksApi, WebhookItem } from '../../api/modules/webhooks.api';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { notify } from '../../utils/notify';

export default function WebhooksModule() {
  const { t } = useTranslation();
  const [createForm] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const { data: webhooks = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksApi.getWebhooks,
    enabled: isAuthenticated,
  });

  const { data: availableEvents = [] } = useQuery({
    queryKey: ['webhook-available-events'],
    queryFn: webhooksApi.getAvailableEvents,
    enabled: isAuthenticated,
  });

  const handleCreateWebhook = async (values: any) => {
    try {
      await webhooksApi.createWebhook(values);
      notify.success('messages.SUCCESS', 'Đã tạo Webhook Endpoint thành công!');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      refetch();
    } catch (err) {
      notify.error(err, 'Không thể tạo Webhook Endpoint!');
    }
  };

  const handleTestPing = async (id: string) => {
    try {
      const res = await webhooksApi.testPing(id);
      notify.success(res.message || 'Đã gửi Test Ping đến Webhook!');
      refetch();
    } catch (err) {
      notify.error(err, 'Không thể kết nối đến Webhook URL!');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await webhooksApi.deleteWebhook(id);
      notify.success('messages.DELETE_SUCCESS', 'Đã xóa Webhook Endpoint!');
      refetch();
    } catch (err) {
      notify.error(err, 'Không thể xóa Webhook!');
    }
  };

  const columns: ColumnsType<WebhookItem> = [
    {
      title: t('webhooks.name', 'Tên Webhook / Target'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space>
          <ApiOutlined style={{ color: '#059669' }} />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: t('webhooks.url', 'URL Đích (Endpoint)'),
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Space>
          <GlobalOutlined style={{ color: '#94a3b8' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb' }}>{url}</span>
        </Space>
      ),
    },
    {
      title: t('webhooks.events', 'Sự Kiện Lắng Nghe'),
      dataIndex: 'events',
      key: 'events',
      width: 220,
      render: (events: string[]) => (
        <Space wrap size={[4, 4]}>
          {events && events.length > 0 ? (
            events.map((ev, i) => (
              <Tag key={i} color="geekblue" style={{ borderRadius: 6, fontWeight: 600 }}>
                {ev}
              </Tag>
            ))
          ) : (
            <Tag color="purple">Tất cả (*)</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('webhooks.secret', 'Khóa Bí Mật (Secret Key)'),
      dataIndex: 'secret',
      key: 'secret',
      width: 180,
      render: (secret: string) =>
        secret ? (
          <Space>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#059669', fontWeight: 700 }}>
              {secret.substring(0, 8)}...
            </span>
            <Tooltip title={t('common.copy', 'Sao chép Secret Key')}>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(secret);
                  notify.success('messages.COPY_SUCCESS', 'Đã sao chép Webhook Secret Key!');
                }}
              />
            </Tooltip>
          </Space>
        ) : (
          <span style={{ color: '#94a3b8' }}>Chưa thiết lập secret</span>
        ),
    },
    {
      title: t('table.status', 'Trạng Thái'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: 6 }}>
          {isActive ? t('table.active', 'Hoạt Động') : t('table.disabled', 'Đã Tắt')}
        </Tag>
      ),
    },
    {
      title: t('webhooks.lastTriggered', 'Kích Hoạt Gần Nhất'),
      dataIndex: 'lastTriggeredAt',
      key: 'lastTriggeredAt',
      width: 180,
      render: (date: string) => date || <span style={{ color: '#94a3b8' }}>Chưa từng phát</span>,
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_: any, record: WebhookItem) => (
        <Space size={6}>
          <Can permission="setting:update">
            <Tooltip title={t('webhooks.testPingHelp', 'Gửi Test Ping (Không ghi rác Audit Log)')}>
              <Button size="small" icon={<SendOutlined style={{ color: '#2563eb' }} />} onClick={() => handleTestPing(record.id)} />
            </Tooltip>

            <Popconfirm title={t('webhooks.deleteConfirm', 'Xóa Webhook endpoint này?')} onConfirm={() => handleDeleteWebhook(record.id)} okText={t('common.delete', 'Xóa')} cancelText={t('common.cancel', 'Hủy')}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {t('webhooks.title', 'Quản Lý Webhook Engine & Event Subscriptions')}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              {t('webhooks.subtitle', 'Đăng ký các URL nhận sự kiện tự động (HTTP POST Payload + HMAC SHA-256 Signature) khi có thay đổi dữ liệu Core')}
            </p>
          </div>

          <Space wrap size="middle">
            <Button icon={<ReloadOutlined spin={isRefetching} />} onClick={() => refetch()} style={{ borderRadius: 8, fontWeight: 600 }}>
              {t('common.refresh', 'Làm Mới')}
            </Button>

            <Can permission="setting:update">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                {t('webhooks.createButton', 'Đăng Ký Webhook Mới')}
              </Button>
            </Can>
          </Space>
        </div>
      </Card>

      {/* Webhooks Adaptive View: Mobile Cards vs Desktop Table */}
      {isMobile ? (
        <List
          loading={isLoading}
          dataSource={webhooks}
          pagination={{ pageSize: 10 }}
          renderItem={(record) => (
            <Card
              key={record.id}
              style={{ marginBottom: 12, borderRadius: 10, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
              bodyStyle={{ padding: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Space align="center">
                  <ApiOutlined style={{ color: '#059669' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{record.name}</span>
                </Space>

                <Tag color={record.isActive ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: 6, margin: 0 }}>
                  {record.isActive ? t('table.active', 'Hoạt Động') : t('table.disabled', 'Đã Tắt')}
                </Tag>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563eb', wordBreak: 'break-all', marginBottom: 8 }}>
                <GlobalOutlined style={{ color: '#94a3b8', marginRight: 4 }} />
                {record.url}
              </div>

              {/* Secret Key & Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                {record.secret ? (
                  <Space size="small">
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#059669', fontWeight: 700 }}>
                      {record.secret.substring(0, 8)}...
                    </span>
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(record.secret!);
                        notify.success('messages.COPY_SUCCESS', 'Đã sao chép Webhook Secret Key!');
                      }}
                    />
                  </Space>
                ) : (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>No Secret</span>
                )}

                <Space size={4}>
                  <Can permission="setting:update">
                    <Tooltip title={t('webhooks.testPingHelp', 'Gửi Test Ping (Không ghi rác Audit Log)')}>
                      <Button size="small" icon={<SendOutlined style={{ color: '#2563eb' }} />} onClick={() => handleTestPing(record.id)} />
                    </Tooltip>

                    <Popconfirm title={t('webhooks.deleteConfirm', 'Xóa Webhook endpoint này?')} onConfirm={() => handleDeleteWebhook(record.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Can>
                </Space>
              </div>
            </Card>
          )}
        />
      ) : (
        <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
          <Table columns={columns} dataSource={webhooks} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
        </Card>
      )}

      {/* Modal Tạo Webhook */}
      <Modal
        title={t('webhooks.modalTitle', 'Đăng Ký Webhook Target Mới')}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        okText={t('common.create', 'Tạo Webhook')}
        cancelText={t('common.cancel', 'Hủy')}
        width={580}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateWebhook} style={{ marginTop: 16 }} initialValues={{ events: ['*'] }}>
          <Form.Item name="name" label={t('webhooks.fieldName', 'Tên Tích Hợp / Tên Hệ Thống Nhận')} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="n8n Automation / Zapier Endpoint / Customer System" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="url" label={t('webhooks.fieldUrl', 'URL Đích (HTTP/HTTPS Target URL)')} rules={[{ required: true, type: 'url', message: 'URL không hợp lệ!' }]}>
            <Input placeholder="https://api.thirdparty.com/webhooks/ecomcx" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="events" label={t('webhooks.fieldEvents', 'Các Sự Kiện Đăng Ký Lắng Nghe (Tự Động Phân Theo Module)')} rules={[{ required: true, message: 'Vui lòng chọn sự kiện!' }]}>
            <Select
              mode="multiple"
              placeholder={t('webhooks.selectEventsPlaceholder', 'Chọn các sự kiện cần đăng ký...')}
              style={{ borderRadius: 6 }}
            >
              {availableEvents.map((group, idx) => (
                <Select.OptGroup key={idx} label={group.module}>
                  {group.events.map((ev) => (
                    <Select.Option key={ev.value} value={ev.value}>
                      {ev.label}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
