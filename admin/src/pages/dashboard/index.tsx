import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { usersApi } from '../../api/modules/users.api';
import { departmentsApi } from '../../api/modules/departments.api';
import { auditApi } from '../../api/modules/audit.api';
import { AuditLogItem } from '../../types/auth.types';

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

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ limit: 100 }),
  });
  const users = usersResponse?.data || [];

  const { data: departmentsResponse } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments({ limit: 100 }),
  });
  const departments = departmentsResponse?.data || [];

  const { data: recentAudit } = useQuery({
    queryKey: ['audit-logs', 'dashboard-recent'],
    queryFn: () => auditApi.getAuditLogs({ page: 1, limit: 5 }),
  });

  const totalUsers = usersResponse?.meta?.total ?? users.length;
  const activeUsers = users.filter((u: any) => u.isActive).length;
  const pendingUsers = users.filter((u: any) => !u.isActive).length;

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: 'Người Thực Hiện',
      dataIndex: 'userEmail',
      key: 'userEmail',
      render: (email: string) => <Text strong>{email || 'Hệ thống'}</Text>,
    },
    {
      title: 'Hành Động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => renderActionTag(action),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (module: string) => <Tag color="geekblue">{module}</Tag>,
    },
    {
      title: 'Thời Gian',
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
              Hệ thống quản trị tổng thể doanh nghiệp & phân quyền đa cấp độ
            </Text>
          </div>
        </div>
      </Card>

      {/* Metric Cards Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.totalUsers', 'Tổng Số Người Dùng')}
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#4f46e5', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.activeUsers', 'Tài Khoản Hoạt Động')}
              value={activeUsers}
              prefix={<CheckCircleOutlined style={{ color: '#059669', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.pendingUsers', 'Chờ Admin Phê Duyệt')}
              value={pendingUsers}
              prefix={<ClockCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.totalDepts', 'Cơ Cấu Phòng Ban')}
              value={departmentsResponse?.meta?.total ?? departments.length}
              prefix={<ApartmentOutlined style={{ color: '#0284c7', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities Section */}
      <Card title={t('dashboard.recentActivities', 'Nhật Ký Thao Tác Hệ Thống')} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recentAudit?.data || []}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
