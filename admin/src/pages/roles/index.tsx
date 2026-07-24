import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Card, Popconfirm, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { rolesApi } from '../../api/modules/roles.api';
import { permissionsApi, PermissionItem } from '../../api/modules/permissions.api';
import { Role } from '../../types/auth.types';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';

export default function RolesModule() {
  const { t } = useTranslation();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [permForm] = Form.useForm();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { isAuthenticated } = useAuthStore();

  const { data: roles = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
    enabled: isAuthenticated,
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
    enabled: isAuthenticated,
  });

  // Defensive array mapping + grouping by module for select dropdown
  const permissionOptions = useMemo(() => {
    const permList = Array.isArray(allPermissions) ? allPermissions : [];
    const groupedMap = permList.reduce((acc, p) => {
      const mod = (p.module || 'system').toUpperCase();
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push({
        label: `${p.name} (${p.code})`,
        value: p.id,
      });
      return acc;
    }, {} as Record<string, { label: string; value: string }[]>);

    return Object.keys(groupedMap).map((modKey) => ({
      label: `MODULE: ${modKey}`,
      options: groupedMap[modKey],
    }));
  }, [allPermissions]);

  const handleCreateRole = async (values: any) => {
    try {
      await rolesApi.createRole(values);
      message.success('Tạo vai trò mới thành công!');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      refetch();
    } catch {
      message.error('Không thể tạo vai trò mới!');
    }
  };

  const handleEditRole = async (values: any) => {
    if (!selectedRole) return;
    try {
      await rolesApi.updateRole(selectedRole.id, values);
      message.success('Cập nhật vai trò thành công!');
      setIsEditModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể cập nhật vai trò!');
    }
  };

  const handleAssignPermissions = async (values: { permissionIds: string[] }) => {
    if (!selectedRole) return;
    try {
      await rolesApi.assignPermissionsToRole(selectedRole.id, values.permissionIds || []);
      message.success('Cập nhật quyền hạn cho vai trò thành công!');
      setIsPermModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể phân quyền cho vai trò!');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await rolesApi.deleteRole(roleId);
      message.success('Đã xóa vai trò thành công!');
      refetch();
    } catch {
      message.error('Không thể xóa vai trò!');
    }
  };

  const handleOpenEditModal = (role: Role) => {
    setSelectedRole(role);
    const rolePermissionIds = (role.permissions || []).map((p: any) => p.permissionId || p.permission?.id || p.id);
    editForm.setFieldsValue({
      code: role.code,
      name: role.name,
      description: role.description,
      permissionIds: rolePermissionIds,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPermModal = (role: Role) => {
    setSelectedRole(role);
    const currentPermIds = (role.permissions || [])
      .map((p: any) => p.permissionId || p.permission?.id || (typeof p === 'string' ? p : p.id))
      .filter(Boolean);

    permForm.setFieldsValue({
      permissionIds: currentPermIds,
    });
    setIsPermModalOpen(true);
  };

  const columns: ColumnsType<Role> = [
    {
      title: t('roles.code', 'Mã Role'),
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => (
        <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: t('roles.name', 'Tên Vai Trò'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{name}</span>,
    },
    {
      title: t('roles.description', 'Mô Tả Vai Trò'),
      dataIndex: 'description',
      key: 'description',
      width: 220,
      render: (desc: string) => desc || <span style={{ color: '#94a3b8' }}>Chưa có mô tả</span>,
    },
    {
      title: t('roles.permissions', 'Danh Sách Quyền Hạn'),
      key: 'permissions',
      render: (record: Role) => {
        const perms = record.permissions || [];
        return (
          <Space wrap size={[4, 4]}>
            {perms.length > 0 ? (
              perms.map((p: any, i: number) => {
                const permObj = p.permission || p;
                const code = permObj.code || permObj;
                const name = permObj.name || code;
                return (
                  <Tag key={i} color="purple" icon={<KeyOutlined />} style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}>
                    {name} ({code})
                  </Tag>
                );
              })
            ) : (
              <Tag color="default" style={{ borderRadius: '6px' }}>
                Chưa gán quyền
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_: any, record: Role) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
          <Can permission="role:update">
            <Tooltip title="Phân Quyền Cho Role">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<LockOutlined style={{ fontSize: 13 }} />}
                style={{ borderRadius: 6 }}
                onClick={() => handleOpenPermModal(record)}
              />
            </Tooltip>
          </Can>

          <Can permission="role:update">
            <Tooltip title={t('table.edit', 'Chỉnh Sửa')}>
              <Button
                size="small"
                icon={<EditOutlined style={{ fontSize: 13 }} />}
                style={{ borderRadius: 6 }}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>
          </Can>

          <Can permission="role:delete">
            <Popconfirm
              title={t('table.confirmDelete', 'Bạn có chắc chắn muốn xóa không?')}
              onConfirm={() => handleDeleteRole(record.id)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {t('roles.title', 'Quản Lý Vai Trò & Phân Quyền (RBAC)')}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              {t('roles.subtitle', 'Cấu hình Roles và Permission Matrix phân quyền truy cập hệ thống')}
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

            <Can permission="role:create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                {t('roles.addRole', 'Tạo Role Mới')}
              </Button>
            </Can>
          </Space>
        </div>
      </Card>

      {/* Main Table */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create Role Modal */}
      <Modal
        title={t('roles.addRole', 'Tạo Role Mới')}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        okText={t('users.save', 'Lưu Cấu Hình')}
        cancelText={t('users.cancel', 'Hủy')}
        width={560}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateRole} style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã Role (Role Code)" rules={[{ required: true, message: 'Vui lòng nhập mã role!' }]}>
            <Input placeholder="manager" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="name" label="Tên Vai Trò" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}>
            <Input placeholder="Quản Lý Phòng Ban" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea placeholder="Mô tả quyền hạn của vai trò này" rows={2} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="permissionIds" label="Gán Quyền Hạn Ban Đầu">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn các quyền hạn gán cho vai trò này..."
              options={permissionOptions}
              style={{ width: '100%', borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={t('roles.editRole', 'Chỉnh Sửa Role')}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText={t('users.save', 'Lưu Cấu Hình')}
        cancelText={t('users.cancel', 'Hủy')}
        width={560}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditRole} style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã Role">
            <Input disabled style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="name" label="Tên Vai Trò" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}>
            <Input style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea rows={2} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="permissionIds" label="Quyền Hạn Áp Dụng">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn danh sách quyền hạn..."
              options={permissionOptions}
              style={{ width: '100%', borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Permissions Modal */}
      <Modal
        title={`Phân Quyền Hạn Cho Role: ${selectedRole?.name || ''} (${selectedRole?.code || ''})`}
        open={isPermModalOpen}
        onCancel={() => setIsPermModalOpen(false)}
        onOk={() => permForm.submit()}
        okText="Cập Nhật Phân Quyền"
        cancelText="Hủy Bỏ"
        width={640}
      >
        <Form form={permForm} layout="vertical" onFinish={handleAssignPermissions} style={{ marginTop: 16 }}>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
            Chọn các quyền hạn nguyên tử <code>domain:action</code> mà vai trò này được phép thực thi trong hệ thống.
          </p>
          <Form.Item name="permissionIds" label="Ma Trận Quyền Hạn (Permission Matrix)">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn quyền hạn để gán cho vai trò..."
              options={permissionOptions}
              style={{ width: '100%', borderRadius: 6 }}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
