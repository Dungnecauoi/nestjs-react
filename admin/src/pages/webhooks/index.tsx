import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Card, Popconfirm, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApiOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { webhooksApi, WebhookItem } from '../../api/modules/webhooks.api';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';

export default function WebhooksModule() {
  const { t } = useTranslation();
  const [createForm] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const { data: webhooks = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksApi.getWebhooks,
    enabled: isAuthenticated,
  });

  const handleCreateWebhook = async (values: any) => {
    try {
      await webhooksApi.createWebhook(values);
      message.success('Đã tạo Webhook Endpoint thành công!');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể tạo Webhook Endpoint!');
    }
  };

  const handleTestPing = async (id: string) => {
    try {
      const res = await webhooksApi.testPing(id);
      message.success(res.message || 'Đã gửi Test Ping đến Webhook!');
      refetch();
    } catch {
      message.error('Không thể kết nối đến Webhook URL!');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await webhooksApi.deleteWebhook(id);
      message.success('Đã xóa Webhook Endpoint!');
      refetch();
    } catch {
      message.error('Không thể xóa Webhook!');
    }
  };

  const columns: ColumnsType<WebhookItem> = [
    {
      title: 'Tên Webhook / Target',
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
      title: 'URL Đích (Endpoint)',
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
      title: 'Sự Kiện Lắng Nghe',
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
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: 6 }}>
          {isActive ? 'Hoạt Động' : 'Đã Tắt'}
        </Tag>
      ),
    },
    {
      title: 'Kích Hoạt Gần Nhất',
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
            <Tooltip title="Gửi Test Ping">
              <Button size="small" icon={<SendOutlined style={{ color: '#2563eb' }} />} onClick={() => handleTestPing(record.id)} />
            </Tooltip>

            <Popconfirm title="Xóa Webhook này?" onConfirm={() => handleDeleteWebhook(record.id)} okText="Xóa" cancelText="Hủy">
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
              Quản Lý Webhook Engine & Event Subscriptions
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              Đăng ký các URL nhận sự kiện tự động (HTTP POST Payload + HMAC Signature) khi có thay đổi dữ liệu Core
            </p>
          </div>

          <Space wrap size="middle">
            <Button icon={<ReloadOutlined spin={isRefetching} />} onClick={() => refetch()} style={{ borderRadius: 8, fontWeight: 600 }}>
              Làm Mới
            </Button>

            <Can permission="setting:update">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                Đăng Ký Webhook Mới
              </Button>
            </Can>
          </Space>
        </div>
      </Card>

      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
        <Table columns={columns} dataSource={webhooks} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      </Card>

      {/* Modal Tạo Webhook */}
      <Modal
        title="Đăng Ký Webhook Target Mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        okText="Tạo Webhook"
        cancelText="Hủy"
        width={560}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateWebhook} style={{ marginTop: 16 }} initialValues={{ events: ['*'] }}>
          <Form.Item name="name" label="Tên Tích Hợp / Tên Hệ Thống Nhận" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="n8n Automation / Zapier Endpoint / Customer System" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="url" label="URL Đích (HTTP/HTTPS Target URL)" rules={[{ required: true, type: 'url', message: 'URL không hợp lệ!' }]}>
            <Input placeholder="https://api.thirdparty.com/webhooks/ecomcx" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="events" label="Các Sự Kiện Đăng Ký Lắng Nghe" rules={[{ required: true, message: 'Vui lòng chọn sự kiện!' }]}>
            <Select
              mode="tags"
              placeholder="Chọn sự kiện..."
              options={[
                { value: '*', label: 'Tất cả các sự kiện (*)' },
                { value: 'user.created', label: 'Tạo Người Dùng Mới (user.created)' },
                { value: 'user.updated', label: 'Cập Nhật Người Dùng (user.updated)' },
                { value: 'role.updated', label: 'Thay Đổi Quyền Hạn (role.updated)' },
                { value: 'system.maintenance', label: 'Bảo Trì Hệ Thống (system.maintenance)' },
              ]}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
