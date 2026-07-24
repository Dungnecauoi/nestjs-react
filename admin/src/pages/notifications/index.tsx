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
  Form,
  Select,
  Typography,
  Radio,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BellOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/modules/notification.api';
import { NotificationItem } from '../../types/auth.types';
import { Can } from '../../components/common/Can';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  // State Table Query Params
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<string>(''); // '' | 'true' | 'false'

  // Modal State for Sending Test Notification
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testForm] = Form.useForm();

  // React Query Fetch Data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', 'list', page, limit, search, filterRead],
    queryFn: () =>
      notificationApi.getNotifications({
        page,
        limit,
        search,
        isRead: filterRead,
      }),
  });

  const notificationsList = data?.data || [];
  const total = data?.meta?.total || 0;

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      message.success(t('notifications.markReadSuccess'));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      message.success(t('notifications.markAllReadSuccess'));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      message.success(t('notifications.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: (values: { title: string; content: string; type: string }) =>
      notificationApi.sendTestNotification(values),
    onSuccess: () => {
      message.success(t('notifications.sendTestSuccess'));
      setIsTestModalOpen(false);
      testForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'success':
        return <Tag icon={<CheckCircleOutlined />} color="success">SUCCESS</Tag>;
      case 'warning':
        return <Tag icon={<WarningOutlined />} color="warning">WARNING</Tag>;
      case 'error':
        return <Tag icon={<CloseCircleOutlined />} color="error">ERROR</Tag>;
      case 'system':
        return <Tag icon={<InfoCircleOutlined />} color="purple">SYSTEM</Tag>;
      default:
        return <Tag icon={<InfoCircleOutlined />} color="processing">INFO</Tag>;
    }
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: t('notifications.colTitle'),
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 200,
      render: (text: string, record) => (
        <Text strong={!record.isRead} style={{ color: !record.isRead ? '#1677ff' : undefined }}>
          {text}
        </Text>
      ),
    },
    {
      title: t('notifications.colContent'),
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => <Text type="secondary">{content}</Text>,
    },
    {
      title: t('notifications.colType'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: t('notifications.colStatus'),
      dataIndex: 'isRead',
      key: 'isRead',
      width: 120,
      render: (isRead: boolean) => (
        <Tag color={isRead ? 'default' : 'cyan'}>
          {isRead ? t('notifications.read') : t('notifications.unread')}
        </Tag>
      ),
    },
    {
      title: t('notifications.colTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('notifications.colActions'),
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space style={{ display: 'flex', flexWrap: 'nowrap', gap: 6 }}>
          {!record.isRead && (
            <Can permission="notification:write">
              <Tooltip title={t('notifications.markReadSuccess')}>
                <Button
                  type="text"
                  icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                  onClick={() => markAsReadMutation.mutate(record.id)}
                  loading={markAsReadMutation.isPending}
                />
              </Tooltip>
            </Can>
          )}

          <Can permission="notification:delete">
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <Card style={{ background: isDark ? '#141417' : '#ffffff', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOutlined style={{ color: '#1677ff' }} /> {t('notifications.title')}
            </Title>
            <Text type="secondary">{t('notifications.subtitle')}</Text>
          </div>

          <Space size="middle">
            <Can permission="notification:write">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsTestModalOpen(true)}
              >
                {t('notifications.sendTest')}
              </Button>

              <Button
                icon={<CheckOutlined />}
                onClick={() => markAllReadMutation.mutate()}
                loading={markAllReadMutation.isPending}
              >
                {t('notifications.markAllAsRead')}
              </Button>
            </Can>

            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
              {t('table.refresh')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Filter & Table Container */}
      <Card style={{ background: isDark ? '#141417' : '#ffffff', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            placeholder={t('table.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 280 }}
            allowClear
          />

          <Radio.Group
            value={filterRead}
            onChange={(e) => {
              setFilterRead(e.target.value);
              setPage(1);
            }}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="">{t('notifications.all')}</Radio.Button>
            <Radio.Button value="false">{t('notifications.unread')}</Radio.Button>
            <Radio.Button value="true">{t('notifications.read')}</Radio.Button>
          </Radio.Group>
        </div>

        {/* Enterprise Fixed Columns & Sticky Scroll Table */}
        <Table<NotificationItem>
          columns={columns}
          dataSource={notificationsList}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Test Notification Modal */}
      <Modal
        title={t('notifications.sendTest')}
        open={isTestModalOpen}
        onCancel={() => setIsTestModalOpen(false)}
        onOk={() => testForm.submit()}
        confirmLoading={sendTestMutation.isPending}
      >
        <Form
          form={testForm}
          layout="vertical"
          onFinish={(values) => sendTestMutation.mutate(values)}
          initialValues={{ type: 'info' }}
        >
          <Form.Item
            name="title"
            label={t('notifications.colTitle')}
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder={t('notifications.testTitlePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="content"
            label={t('notifications.colContent')}
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={3} placeholder={t('notifications.testContentPlaceholder')} />
          </Form.Item>

          <Form.Item name="type" label={t('notifications.colType')}>
            <Select>
              <Select.Option value="info">INFO</Select.Option>
              <Select.Option value="success">SUCCESS</Select.Option>
              <Select.Option value="warning">WARNING</Select.Option>
              <Select.Option value="error">ERROR</Select.Option>
              <Select.Option value="system">SYSTEM</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
