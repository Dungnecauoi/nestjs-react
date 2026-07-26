import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Button, Space, Table, Tag, message } from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { queuesApi } from '../../api/modules/queues.api';
import { useAuthStore } from '../../store/useAuthStore';

export default function QueuesModule() {
  const { isAuthenticated } = useAuthStore();

  const { data: stats, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: queuesApi.getQueueStats,
    enabled: isAuthenticated,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const mailStats = stats?.mailQueue || {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
  };

  const handleCleanCompleted = async () => {
    try {
      await queuesApi.cleanCompleted();
      message.success('Đã dọn dẹp các job hoàn thành!');
      refetch();
    } catch {
      message.error('Không thể dọn dẹp hàng đợi!');
    }
  };

  const handleCleanFailed = async () => {
    try {
      await queuesApi.cleanFailed();
      message.success('Đã dọn dẹp các job thất bại!');
      refetch();
    } catch {
      message.error('Không thể dọn dẹp hàng đợi!');
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Giám Sát Hàng Đợi Bất Đồng Bộ (BullMQ Queue Dashboard)
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              Theo dõi trạng thái tiến độ các Jobs gửi email & xử lý ngầm trong Redis Queue theo thời gian thực
            </p>
          </div>

          <Space wrap size="middle">
            <Button icon={<ReloadOutlined spin={isRefetching} />} onClick={() => refetch()} style={{ borderRadius: 8, fontWeight: 600 }}>
              Làm Mới (Auto 5s)
            </Button>
          </Space>
        </div>
      </Card>

      {/* Metrics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title="Jobs Đang Chờ (Waiting)"
              value={mailStats.waiting}
              prefix={<ClockCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title="Jobs Đang Xử Lý (Active)"
              value={mailStats.active}
              prefix={<SyncOutlined spin={mailStats.active > 0} style={{ color: '#2563eb', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title="Jobs Hoàn Thành (Completed)"
              value={mailStats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#059669', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
            <Statistic
              title="Jobs Thất Bại (Failed)"
              value={mailStats.failed}
              prefix={<CloseCircleOutlined style={{ color: '#dc2626', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} title="Thao Tác Quản Lý Hàng Đợi (Queue Cleaners)" style={{ borderRadius: 12 }}>
        <Space wrap size="middle">
          <Button icon={<ClearOutlined />} onClick={handleCleanCompleted}>
            Dọn Dẹp Jobs Hoàn Thành
          </Button>

          <Button danger icon={<ClearOutlined />} onClick={handleCleanFailed}>
            Dọn Dẹp Jobs Thất Bại
          </Button>
        </Space>
      </Card>
    </div>
  );
}
