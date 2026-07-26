import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Switch, Button, Space, Alert, message, Modal } from 'antd';
import {
  DownloadOutlined,
  ToolOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { maintenanceApi } from '../../api/modules/maintenance.api';
import { useAuthStore } from '../../store/useAuthStore';

export default function MaintenanceModule() {
  const { isAuthenticated } = useAuthStore();

  const { data: status, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: maintenanceApi.getStatus,
    enabled: isAuthenticated,
  });

  const isMaintenance = !!status?.maintenanceMode;

  const handleToggleMaintenance = (checked: boolean) => {
    Modal.confirm({
      title: checked ? 'Bật Chế Độ Bảo Trì Hệ Thống?' : 'Tắt Chế Độ Bảo Trì Hệ Thống?',
      icon: <ExclamationCircleOutlined style={{ color: checked ? '#dc2626' : '#2563eb' }} />,
      content: checked
        ? 'Khi bật chế độ bảo trì, người dùng thông thường sẽ bị chặn truy cập (HTTP 503). Chỉ tài khoản Admin mới có thể truy cập hệ thống.'
        : 'Hệ thống sẽ mở lại cho tất cả người dùng bình thường.',
      okText: checked ? 'Xác Nhận Bật Bảo Trì' : 'Xác Nhận Mở Lại',
      cancelText: 'Hủy Bỏ',
      onOk: async () => {
        try {
          await maintenanceApi.toggleMode(checked);
          message.success(checked ? 'Đã bật chế độ bảo trì!' : 'Đã tắt chế độ bảo trì!');
          refetch();
        } catch {
          message.error('Không thể thay đổi chế độ bảo trì!');
        }
      },
    });
  };

  const handleDownloadBackup = async () => {
    try {
      await maintenanceApi.downloadBackup();
      message.success('Đã tải file sao lưu dữ liệu hệ thống!');
    } catch {
      message.error('Không thể tạo file sao lưu!');
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Bảo Trì & Sao Lưu Hệ Thống (Maintenance & Backup)
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              Cấu hình chế độ bảo trì định kỳ (HTTP 503) và trích xuất file sao lưu dữ liệu toàn bộ hệ thống
            </p>
          </div>

          <Button icon={<ReloadOutlined spin={isRefetching} />} onClick={() => refetch()} style={{ borderRadius: 8, fontWeight: 600 }}>
            Làm Mới
          </Button>
        </div>
      </Card>

      <Card bordered={false} title="1. Chế Độ Bảo Trì Hệ Thống (Maintenance Mode)" style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isMaintenance ? (
            <Alert
              type="error"
              message="HỆ THỐNG ĐANG BẢO TRÌ"
              description="Chế độ bảo trì đang BẬT. Tất cả người dùng thường bị từ chối kết nối (HTTP 503 Service Unavailable). Đội ngũ Kỹ thuật và Admin có thể làm việc."
              showIcon
            />
          ) : (
            <Alert
              type="success"
              message="HỆ THỐNG ĐANG HOẠT ĐỘNG BÌNH THƯỜNG"
              description="Mọi API và ứng dụng Admin / Client đang mở kết nối bình thường."
              showIcon
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch checked={isMaintenance} onChange={handleToggleMaintenance} loading={isLoading} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {isMaintenance ? 'Đang Bật Bảo Trì' : 'Đang Tắt Bảo Trì'}
            </span>
          </div>
        </div>
      </Card>

      <Card bordered={false} title="2. Sao Lưu Cơ Sở Dữ Liệu (System Data Backup)" style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Trích xuất toàn bộ dữ liệu cấu hình, người dùng, phân quyền, phòng ban và cấu hình wp_options ra file chuẩn JSON để lưu trữ dự phòng.
          </p>

          <div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadBackup}
              style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 8, fontWeight: 700 }}
            >
              Tải File Sao Lưu Dữ Liệu (.JSON)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
