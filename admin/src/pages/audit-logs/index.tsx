import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Tooltip,
  Modal,
  Select,
  Typography,
  Popconfirm,
  message,
  Row,
  Col,
  Descriptions,
  Grid,
  List,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '../../api/modules/audit.api';
import { AuditLogItem } from '../../types/auth.types';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

const { Title, Text } = Typography;

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  // State Query Params
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  // Modal State for Visual History Diff
  const [activeDiffLog, setActiveDiffLog] = useState<AuditLogItem | null>(null);

  // React Query Fetch Audit Logs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', 'list', page, limit, search, selectedModule, selectedAction],
    queryFn: () =>
      auditApi.getAuditLogs({
        page,
        limit,
        search,
        module: selectedModule,
        action: selectedAction,
      }),
  });

  const auditLogsList = data?.data || [];
  const total = data?.meta?.total || 0;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => auditApi.deleteAuditLog(id),
    onSuccess: () => {
      message.success(t('auditLogs.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => auditApi.clearAllAuditLogs(),
    onSuccess: () => {
      message.success(t('auditLogs.clearSuccess'));
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  const getActionTag = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Tag color="success">CREATE</Tag>;
      case 'UPDATE':
        return <Tag color="processing">UPDATE</Tag>;
      case 'DELETE':
        return <Tag color="error">DELETE</Tag>;
      case 'LOGIN':
        return <Tag color="cyan">LOGIN</Tag>;
      case 'LOGOUT':
        return <Tag color="default">LOGOUT</Tag>;
      default:
        return <Tag color="blue">{action}</Tag>;
    }
  };

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: t('auditLogs.colUser'),
      key: 'user',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: 13 }}>
              {record.user?.name || record.userEmail || 'System'}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.userEmail}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('auditLogs.colAction'),
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => getActionTag(action),
    },
    {
      title: t('auditLogs.colModule'),
      dataIndex: 'module',
      key: 'module',
      width: 130,
      render: (mod: string) => (
        <Tag color="geekblue" style={{ textTransform: 'uppercase' }}>
          {mod}
        </Tag>
      ),
    },
    {
      title: t('auditLogs.colIp'),
      key: 'ip',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: 12 }}>{record.ipAddress || '127.0.0.1'}</Text>
          <Text type="secondary" style={{ fontSize: 10 }} ellipsis>
            {record.userAgent || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: t('auditLogs.colTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => date,
    },
    {
      title: t('auditLogs.colActions'),
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space style={{ display: 'flex', flexWrap: 'nowrap', gap: 6 }}>
          <Tooltip title={t('auditLogs.viewDiff')}>
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1677ff' }} />}
              onClick={() => setActiveDiffLog(record)}
            />
          </Tooltip>

          <Can permission="audit:delete">
            <Tooltip title={t('table.delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteMutation.mutate(record.id)}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Can>
        </Space>
      ),
    },
  ];

  // Render Diff Visual JSON Formatter
  const renderJsonView = (jsonStr?: string | null) => {
    if (!jsonStr) return <Text type="secondary">{t('auditLogs.noDiffData')}</Text>;
    try {
      const parsed = JSON.parse(jsonStr);
      return (
        <pre
          style={{
            backgroundColor: isDark ? '#18181c' : '#f8fafc',
            color: isDark ? '#e4e4e7' : '#0f172a',
            padding: 12,
            borderRadius: 6,
            fontSize: 12,
            maxHeight: 300,
            overflow: 'auto',
            border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
          }}
        >
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return <Text>{jsonStr}</Text>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <Card style={{ background: isDark ? '#141417' : '#ffffff', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HistoryOutlined style={{ color: '#1677ff' }} /> {t('auditLogs.title')}
            </Title>
            <Text type="secondary">{t('auditLogs.subtitle')}</Text>
          </div>

          <Space size="middle">
            <Can permission="audit:delete">
              <Popconfirm
                title={t('auditLogs.clearAllConfirm')}
                onConfirm={() => clearAllMutation.mutate()}
                okText={t('table.confirmDelete')}
                cancelText={t('users.cancel')}
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />} loading={clearAllMutation.isPending}>
                  {t('auditLogs.clearAll')}
                </Button>
              </Popconfirm>
            </Can>

            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
              {t('table.refresh')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Filter Bar & Table */}
      <Card style={{ background: isDark ? '#141417' : '#ffffff', borderRadius: 8 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder={t('table.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              allowClear
            />
          </Col>

          <Col xs={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo Module"
              value={selectedModule || undefined}
              onChange={(val) => {
                setSelectedModule(val || '');
                setPage(1);
              }}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="role">Role</Select.Option>
              <Select.Option value="department">Department</Select.Option>
              <Select.Option value="media">Media</Select.Option>
              <Select.Option value="setting">Setting</Select.Option>
              <Select.Option value="notification">Notification</Select.Option>
            </Select>
          </Col>

          <Col xs={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo Thao tác"
              value={selectedAction || undefined}
              onChange={(val) => {
                setSelectedAction(val || '');
                setPage(1);
              }}
              allowClear
            >
              <Select.Option value="CREATE">CREATE</Select.Option>
              <Select.Option value="UPDATE">UPDATE</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="LOGIN">LOGIN</Select.Option>
            </Select>
          </Col>
        </Row>

        <ResponsiveTable<AuditLogItem>
          columns={columns}
          dataSource={auditLogsList}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            onChange: (p: number, l: number) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Visual History Diff Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#1677ff' }} />
            <span>{t('auditLogs.diffModalTitle')}</span>
          </Space>
        }
        open={!!activeDiffLog}
        onCancel={() => setActiveDiffLog(null)}
        footer={[
          <Button key="close" onClick={() => setActiveDiffLog(null)}>
            Đóng
          </Button>,
        ]}
        width={850}
      >
        {activeDiffLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Người thực hiện">{activeDiffLog.userEmail}</Descriptions.Item>
              <Descriptions.Item label="Thao tác">{getActionTag(activeDiffLog.action)}</Descriptions.Item>
              <Descriptions.Item label="Module">{activeDiffLog.module}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">{activeDiffLog.createdAt}</Descriptions.Item>
              <Descriptions.Item label="IP Address" span={2}>{activeDiffLog.ipAddress || '127.0.0.1'}</Descriptions.Item>
            </Descriptions>

            <Row gutter={16}>
              <Col span={12}>
                <Card title={t('auditLogs.beforeStateTitle')} size="small" style={{ borderColor: '#ff4d4f' }}>
                  {renderJsonView(activeDiffLog.beforeState)}
                </Card>
              </Col>

              <Col span={12}>
                <Card title={t('auditLogs.afterStateTitle')} size="small" style={{ borderColor: '#52c41a' }}>
                  {renderJsonView(activeDiffLog.afterState)}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
