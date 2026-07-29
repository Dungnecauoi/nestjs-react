import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Tag, Typography, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { auditApi } from '../../api/modules/audit.api';
import { AuditLogItem } from '../../types/auth.types';
import { useAuthStore } from '../../store/useAuthStore';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

const { Title, Text } = Typography;

function renderActionTag(action: string) {
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
}

export default function DashboardModule() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // SEC-04 & ARCH-03: Thống kê Server-side chuẩn DB count
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => auditApi.getDashboardStats(),
    enabled: isAuthenticated,
  });

  // SEC-03: enabled: isAuthenticated tránh 401 cascade khi chưa login
  const { data: recentAudit, isLoading: isAuditLoading } = useQuery({
    queryKey: ['audit-logs', 'dashboard-recent'],
    queryFn: () => auditApi.getAuditLogs({ page: 1, limit: 5 }),
    enabled: isAuthenticated,
  });

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: t('audit.userEmail', 'Người Thực Hiện'),
      dataIndex: 'userEmail',
      key: 'userEmail',
      render: (email: string) => <Text strong>{email || t('common.system', 'Hệ thống')}</Text>,
    },
    {
      title: t('audit.action', 'Hành Động'),
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => renderActionTag(action),
    },
    {
      title: t('audit.module', 'Module'),
      dataIndex: 'module',
      key: 'module',
      render: (module: string) => <Tag color="geekblue">{module}</Tag>,
    },
    {
      title: t('audit.createdAt', 'Thời Gian'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <Text type="secondary">{date}</Text>,
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#09090b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <ThunderboltFilled />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
              {t('dashboard.welcome', 'Chào Mừng Đến Với ECOMCX Enterprise ERP Core')}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('dashboard.subtitle', 'Hệ thống quản trị tổng thể doanh nghiệp & phân quyền đa cấp độ')}
            </Text>
          </div>
        </div>
      </Card>

      {/* Metric Cards Grid với Loading Skeleton */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Skeleton loading={isStatsLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title={t('dashboard.totalUsers', 'Tổng Số Người Dùng')}
                value={stats?.totalUsers ?? 0}
                prefix={<UserOutlined style={{ color: '#4f46e5', marginRight: 8 }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Skeleton loading={isStatsLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title={t('dashboard.activeUsers', 'Tài Khoản Hoạt Động')}
                value={stats?.activeUsers ?? 0}
                prefix={<CheckCircleOutlined style={{ color: '#059669', marginRight: 8 }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Skeleton loading={isStatsLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title={t('dashboard.pendingUsers', 'Chờ Admin Phê Duyệt')}
                value={stats?.pendingUsers ?? 0}
                prefix={<ClockCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Skeleton loading={isStatsLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title={t('dashboard.totalDepts', 'Cơ Cấu Phòng Ban')}
                value={stats?.totalDepartments ?? 0}
                prefix={<ApartmentOutlined style={{ color: '#0284c7', marginRight: 8 }} />}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities Section - UI-04: ResponsiveTable hỗ trợ Mobile */}
      <Card title={t('dashboard.recentActivities', 'Nhật Ký Thao Tác Hệ Thống')} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <ResponsiveTable
          rowKey="id"
          columns={columns}
          dataSource={recentAudit?.data || []}
          loading={isAuditLoading}
          pagination={false}
          scroll={{ x: 700 }}
          size="small"
        />
      </Card>
    </div>
  );
}
