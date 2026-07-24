import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography } from 'antd';
import {
  UserOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DashboardModule() {
  const { t } = useTranslation();
  const isDepartmentsEnabled = localStorage.getItem('enableDepartments') !== 'false';

  const recentActivities = [
    { key: '1', user: 'Super Admin', action: 'Lưu Cấu Hình Hệ Thống', time: '5 phút trước', status: 'SUCCESS' },
    { key: '2', user: 'Quản Lý HR', action: 'Phê Duyệt Tài Khoản Đăng Ký', time: '25 phút trước', status: 'SUCCESS' },
    { key: '3', user: 'Developer Core', action: 'Tạo Vai Trò & Gán Quyền Hạn', time: '2 giờ trước', status: 'SUCCESS' },
  ];

  const columns = [
    { title: 'Người Thực Hiện', dataIndex: 'user', key: 'user', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Hành Động', dataIndex: 'action', key: 'action' },
    { title: 'Thời Gian', dataIndex: 'time', key: 'time', render: (text: string) => <Text type="secondary">{text}</Text> },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Thành công
        </Tag>
      ),
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
        <Col xs={24} sm={12} lg={isDepartmentsEnabled ? 6 : 8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.totalUsers', 'Tổng Số Người Dùng')}
              value={128}
              prefix={<UserOutlined style={{ color: '#4f46e5', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={isDepartmentsEnabled ? 6 : 8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.activeUsers', 'Tài Khoản Hoạt Động')}
              value={112}
              prefix={<CheckCircleOutlined style={{ color: '#059669', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={isDepartmentsEnabled ? 6 : 8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title={t('dashboard.pendingUsers', 'Chờ Admin Phê Duyệt')}
              value={16}
              prefix={<ClockCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        {isDepartmentsEnabled && (
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
              <Statistic
                title={t('dashboard.totalDepts', 'Cơ Cấu Phòng Ban')}
                value={8}
                prefix={<ApartmentOutlined style={{ color: '#0284c7', marginRight: 8 }} />}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Recent Activities Section */}
      <Card title={t('dashboard.recentActivities', 'Nhật Ký Thao Tác Hệ Thống')} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <Table columns={columns} dataSource={recentActivities} pagination={false} size="small" />
      </Card>
    </div>
  );
}
