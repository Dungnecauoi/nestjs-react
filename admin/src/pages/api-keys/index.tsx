import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Form, Input, Space, Card, Popconfirm, Tooltip, message, Alert, Grid, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { apiKeysApi, ApiKeyItem, CreateApiKeyResponse } from '../../api/modules/apiKeys.api';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

export default function ApiKeysModule() {
  const { t } = useTranslation();
  const [createForm] = Form.useForm();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdSecretResult, setCreatedSecretResult] = useState<CreateApiKeyResponse | null>(null);
  const { isAuthenticated } = useAuthStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const { data: apiKeys = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysApi.getApiKeys,
    enabled: isAuthenticated,
  });

  const handleCreateApiKey = async (values: any) => {
    try {
      const result = await apiKeysApi.createApiKey(values);
      setCreatedSecretResult(result);
      message.success('Đã tạo API Key thành công!');
      createForm.resetFields();
      refetch();
    } catch {
      message.error('Không thể tạo API Key!');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      await apiKeysApi.revokeApiKey(id);
      message.success('Đã vô hiệu hóa API Key!');
      refetch();
    } catch {
      message.error('Không thể vô hiệu hóa API Key!');
    }
  };

  const handleRestoreApiKey = async (id: string) => {
    try {
      await apiKeysApi.restoreApiKey(id);
      message.success('Đã kích hoạt lại API Key!');
      refetch();
    } catch {
      message.error('Không thể kích hoạt API Key!');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await apiKeysApi.deleteApiKey(id);
      message.success('Đã xóa vĩnh viễn API Key!');
      refetch();
    } catch {
      message.error('Không thể xóa API Key!');
    }
  };

  const columns: ColumnsType<ApiKeyItem> = [
    {
      title: 'Tên Ứng Dụng / Mục Đích',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string) => (
        <Space>
          <KeyOutlined style={{ color: '#2563eb' }} />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Prefix Nhận Dạng',
      dataIndex: 'prefix',
      key: 'prefix',
      width: 160,
      render: (prefix: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>{prefix}...</span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: 6 }}>
          {isActive ? 'Hoạt Động' : 'Đã Vô Hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Lần Dùng Cuối',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      width: 180,
      render: (date: string) => date || <span style={{ color: '#94a3b8' }}>Chưa từng dùng</span>,
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: ApiKeyItem) => (
        <Space size={6}>
          <Can permission="setting:update">
            {record.isActive ? (
              <Tooltip title="Vô Hiệu Hóa">
                <Button size="small" icon={<StopOutlined />} onClick={() => handleRevokeApiKey(record.id)} />
              </Tooltip>
            ) : (
              <Tooltip title="Kích Hoạt Lại">
                <Button size="small" icon={<CheckCircleOutlined style={{ color: '#059669' }} />} onClick={() => handleRestoreApiKey(record.id)} />
              </Tooltip>
            )}

            <Popconfirm
              title="Xóa vĩnh viễn API Key này?"
              onConfirm={() => handleDeleteApiKey(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
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
              Quản Lý API Key Tích Hợp (Header x-api-key)
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              Cấp phát mã xác thực dành cho Mobile App và các hệ thống bên thứ 3 kết nối API
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
                onClick={() => {
                  setCreatedSecretResult(null);
                  setIsCreateModalOpen(true);
                }}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                Tạo API Key Mới
              </Button>
            </Can>
          </Space>
        </div>
      </Card>

      {/* Reusable Enterprise Auto-Adaptive Table */}
      <ResponsiveTable columns={columns} dataSource={apiKeys} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} scroll={{ x: 850 }} />

      {/* Modal Tạo API Key */}
      <Modal
        title="Tạo API Key Mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => {
          if (createdSecretResult) {
            setIsCreateModalOpen(false);
          } else {
            createForm.submit();
          }
        }}
        okText={createdSecretResult ? 'Đã Lưu Secret' : 'Tạo Khóa API'}
        cancelText="Đóng"
        width={540}
      >
        {createdSecretResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <Alert type="warning" message="LƯU Ý QUAN TRỌNG" description={createdSecretResult.warning} showIcon />
            <div style={{ marginTop: 8 }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>API Key Bí Mật (Raw Secret Key):</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Input value={createdSecretResult.rawSecretKey} readOnly style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }} />
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(createdSecretResult.rawSecretKey);
                    message.success('Đã sao chép API Key!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Form form={createForm} layout="vertical" onFinish={handleCreateApiKey} style={{ marginTop: 16 }}>
            <Form.Item name="name" label="Tên Tích Hợp / Tên App Mobile" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
              <Input placeholder="Mobile App iOS / CRM Integration" style={{ borderRadius: 6 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
