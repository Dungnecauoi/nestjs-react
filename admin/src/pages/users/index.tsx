import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Input, Modal, Form, Select, Space, Card, Avatar, Popconfirm, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  ClusterOutlined,
  IdcardOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { usersApi } from '../../api/modules/users.api';
import { User } from '../../types/auth.types';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../routes/routes.config';

export const CLEAN_PERMISSIONS_OPTIONS = [
  { value: 'user:read', label: 'Xem Người Dùng (user:read)' },
  { value: 'user:create', label: 'Tạo Người Dùng Mới (user:create)' },
  { value: 'user:write', label: 'Sửa Người Dùng (user:write)' },
  { value: 'user:delete', label: 'Xóa Người Dùng (user:delete)' },
  { value: 'role:read', label: 'Xem Vai Trò (role:read)' },
  { value: 'role:write', label: 'Tạo & Sửa Vai Trò (role:write)' },
  { value: 'role:delete', label: 'Xóa Vai Trò (role:delete)' },
  { value: 'department:read', label: 'Xem Phòng Ban (department:read)' },
  { value: 'department:write', label: 'Tạo & Sửa Phòng Ban (department:write)' },
  { value: 'department:delete', label: 'Xóa Phòng Ban (department:delete)' },
  { value: 'media:read', label: 'Xem Thư Viện Media (media:read)' },
  { value: 'media:create', label: 'Tải Lên Media (media:create)' },
  { value: 'media:write', label: 'Sửa Chi Tiết Media (media:write)' },
  { value: 'media:delete', label: 'Xóa Media (media:delete)' },
];

export const CLEAN_ROLES_OPTIONS = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin', label: 'Quản Trị Viên' },
  { value: 'manager', label: 'Quản Lý Phòng Ban' },
  { value: 'accountant', label: 'Kế Toán Trưởng' },
  { value: 'staff', label: 'Nhân Viên' },
];

export default function UsersModule() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assignForm] = Form.useForm();

  const [searchText, setSearchText] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { isAuthenticated } = useAuthStore();

  const { data: users = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
    enabled: isAuthenticated,
  });

  // Respect system setting: hide department column if enableDepartments === false
  const isDepartmentsEnabled = localStorage.getItem('enableDepartments') !== 'false';

  const handleApproveUser = async (userId: string) => {
    try {
      await usersApi.approveUser(userId);
      message.success(t('users.approveSuccess', 'Đã phê duyệt tài khoản thành công!'));
      refetch();
    } catch {
      message.error('Không thể phê duyệt tài khoản!');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.deleteUser(userId);
      message.success(t('table.deleteSuccess', 'Đã xóa bản ghi thành công!'));
      refetch();
    } catch {
      message.error('Không thể xóa người dùng!');
    }
  };

  const handleOpenAssignModal = (user: User) => {
    setSelectedUser(user);
    const existingRoles = user.roles?.map((r) => r.role?.code || r) || [];
    const existingPerms = user.permissions?.map((p) => p.permission?.code || p) || [];
    assignForm.setFieldsValue({
      roles: existingRoles,
      permissions: existingPerms,
    });
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignments = async (values: any) => {
    if (!selectedUser) return;
    try {
      if (values.roles) {
        await usersApi.assignRoles(selectedUser.id, values.roles);
      }
      if (values.permissions) {
        await usersApi.assignPermissions(selectedUser.id, values.permissions);
      }
      message.success('Đã gán Vai Trò & Quyền Hạn thành công!');
      setIsAssignModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể gán Vai Trò!');
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchText.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.identityCard?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query)
    );
  });

  const columns: ColumnsType<User> = [
    {
      title: t('table.name', 'Họ Và Tên'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: User) => (
        <Space size="middle">
          {record.avatar ? (
            <Avatar src={record.avatar} size="default" />
          ) : (
            <Avatar style={{ backgroundColor: '#1e293b', fontWeight: 'bold' }}>
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>ID: {record.id.substring(0, 8)}...</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Thông Tin Định Danh (CCCD & Phone)',
      key: 'identity',
      width: 220,
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {record.identityCard ? (
            <Tag color="geekblue" icon={<IdcardOutlined />} style={{ borderRadius: 4, width: 'fit-content', fontWeight: 600 }}>
              CCCD: {record.identityCard}
            </Tag>
          ) : (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Chưa cập nhật CCCD</span>
          )}
          {record.phone ? (
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>
              <PhoneOutlined style={{ marginRight: 4, color: '#059669' }} />
              {record.phone}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: t('table.email', 'Email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', color: '#334155' }}>{email}</span>
      ),
    },
    {
      title: t('table.status', 'Trạng Thái'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (isActive: boolean) => (
        <Tag
          color={isActive ? 'success' : 'warning'}
          icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          style={{ fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}
        >
          {isActive ? t('table.active', 'Hoạt Động') : t('table.pendingApproval', 'Chờ Phê Duyệt')}
        </Tag>
      ),
    },
    {
      title: t('table.roles', 'Vai Trò (Roles)'),
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: any[]) => (
        <Space wrap size={[4, 4]}>
          {roles && roles.length > 0 ? (
            roles.map((r, i) => {
              const code = r.role?.code || r;
              const label = CLEAN_ROLES_OPTIONS.find((opt) => opt.value === code)?.label || code;
              return (
                <Tag
                  key={i}
                  color="blue"
                  icon={<SafetyCertificateOutlined />}
                  style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}
                >
                  {label}
                </Tag>
              );
            })
          ) : (
            <Tag color="default" style={{ borderRadius: '6px' }}>Chưa có Role</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('table.permissions', 'Quyền Trực Tiếp'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any[]) => (
        <Space wrap size={[4, 4]}>
          {permissions && permissions.length > 0 ? (
            permissions.map((p, i) => {
              const code = p.permission?.code || p;
              const label = CLEAN_PERMISSIONS_OPTIONS.find((opt) => opt.value === code)?.label || code;
              return (
                <Tag
                  key={i}
                  color="purple"
                  icon={<KeyOutlined />}
                  style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}
                >
                  {label}
                </Tag>
              );
            })
          ) : (
            <Tag color="default" style={{ borderRadius: '6px' }}>Không có quyền riêng</Tag>
          )}
        </Space>
      ),
    },
    ...(isDepartmentsEnabled
      ? [
          {
            title: t('table.departments', 'Phòng Ban'),
            dataIndex: 'departments',
            key: 'departments',
            render: (departments: any[]) => (
              <Space wrap size={[4, 4]}>
                {departments && departments.length > 0 ? (
                  departments.map((d, i) => (
                    <Tag
                      key={i}
                      color="cyan"
                      icon={<ClusterOutlined />}
                      style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}
                    >
                      {d.department?.name || d.name || 'Phòng Ban'}
                    </Tag>
                  ))
                ) : (
                  <Tag color="default" style={{ borderRadius: '6px' }}>Chưa gán</Tag>
                )}
              </Space>
            ),
          },
        ]
      : []),
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 230,
      fixed: 'right',
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
          {!record.isActive && (
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6, fontWeight: 600 }}
              onClick={() => handleApproveUser(record.id)}
            >
              {t('table.approve', 'Duyệt')}
            </Button>
          )}

          <Button
            size="small"
            type="default"
            style={{ borderRadius: 6, fontWeight: 600 }}
            onClick={() => handleOpenAssignModal(record)}
          >
            {t('users.assignRole', 'Gán Role')}
          </Button>

          <Can permission="user:write">
            <Tooltip title={t('table.edit', 'Chỉnh Sửa (Trang Đầy Đủ)')}>
              <Button
                size="small"
                icon={<EditOutlined style={{ fontSize: 13 }} />}
                style={{ borderRadius: 6 }}
                onClick={() => navigate(`/admin/users/${record.id}/edit`)}
              />
            </Tooltip>
          </Can>

          <Can permission="user:delete">
            <Popconfirm
              title={t('table.confirmDelete', 'Bạn có chắc chắn muốn xóa không?')}
              onConfirm={() => handleDeleteUser(record.id)}
              okText={t('table.delete', 'Xóa')}
              cancelText={t('users.cancel', 'Hủy')}
            >
              <Tooltip title={t('table.delete', 'Xóa')}>
                <Button size="small" danger icon={<DeleteOutlined style={{ fontSize: 13 }} />} style={{ borderRadius: 6 }} />
              </Tooltip>
            </Popconfirm>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Card */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {t('users.title', 'Quản Lý Người Dùng Enterprise')}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              {t('users.subtitle', 'Danh sách người dùng, số CCCD định danh và phân quyền truy cập')}
            </p>
          </div>

          <Space wrap size="middle">
            <Button
              icon={<ReloadOutlined spin={isRefetching} />}
              onClick={() => refetch()}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t('users.refresh', 'Làm Mới')}
            </Button>

            <Can permission="user:create">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate(ROUTES.ADMIN_USERS_CREATE.path)}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                {t('users.addUser', 'Thêm User Mới')}
              </Button>
            </Can>
          </Space>
        </div>

        {/* Filter Bar */}
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder={t('users.searchPlaceholder', 'Tìm kiếm theo tên, email, CCCD hoặc số điện thoại...')}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 420, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Assign Roles & Permissions Modal */}
      <Modal
        title={t('users.modalTitle', 'Gán Vai Trò & Phân Quyền Người Dùng')}
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        okText={t('users.save', 'Lưu Cấu Hình')}
        cancelText={t('users.cancel', 'Hủy')}
        width={560}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleSaveAssignments} style={{ marginTop: 16 }}>
          <Form.Item name="roles" label={t('users.selectRoles', 'Chọn Vai Trò')}>
            <Select mode="multiple" placeholder="Chọn Roles" options={CLEAN_ROLES_OPTIONS} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="permissions" label={t('users.selectPermissions', 'Chọn Quyền Hạn Hợp Lệ')}>
            <Select mode="multiple" placeholder="Chọn Quyền Trực Tiếp" options={CLEAN_PERMISSIONS_OPTIONS} style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
