import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, Form, Input, Space, Card, Popconfirm, Tooltip, message, Grid, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { departmentsApi } from '../../api/modules/departments.api';
import { Department } from '../../types/auth.types';
import { Can } from '../../components/common/Can';
import { useAuthStore } from '../../store/useAuthStore';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

export default function DepartmentsModule() {
  const { t } = useTranslation();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const { isAuthenticated } = useAuthStore();

  const { data: departmentsResponse, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['departments', page, pageSize, searchText],
    queryFn: () => departmentsApi.getDepartments({ page, limit: pageSize, search: searchText }),
    enabled: isAuthenticated,
  });

  const departments = departmentsResponse?.data || [];
  const total = departmentsResponse?.meta?.total || 0;

  const handleCreateDepartment = async (values: any) => {
    try {
      await departmentsApi.createDepartment(values);
      message.success('Tạo phòng ban mới thành công!');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      refetch();
    } catch {
      message.error('Không thể tạo phòng ban!');
    }
  };

  const handleEditDepartment = async (values: any) => {
    if (!selectedDept) return;
    try {
      await departmentsApi.updateDepartment(selectedDept.id, values);
      message.success('Cập nhật phòng ban thành công!');
      setIsEditModalOpen(false);
      refetch();
    } catch {
      message.error('Không thể cập nhật phòng ban!');
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    try {
      await departmentsApi.deleteDepartment(deptId);
      message.success('Đã xóa phòng ban thành công!');
      refetch();
    } catch {
      message.error('Không thể xóa phòng ban!');
    }
  };

  const handleOpenEditModal = (dept: Department) => {
    setSelectedDept(dept);
    editForm.setFieldsValue({
      code: dept.code,
      name: dept.name,
      description: dept.description,
    });
    setIsEditModalOpen(true);
  };

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const columns: ColumnsType<Department> = [
    {
      title: t('departments.code', 'Mã Phòng Ban'),
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: isMobile ? false : 'left',
      render: (code: string) => (
        <Tag color="cyan" style={{ fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: t('departments.name', 'Tên Phòng Ban'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space align="center">
          <ApartmentOutlined style={{ color: '#0284c7', fontSize: 16 }} />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: t('departments.description', 'Mô Tả Phòng Ban'),
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (desc: string) => desc || <span style={{ color: '#94a3b8' }}>Chưa có mô tả</span>,
    },
    {
      title: t('table.actions', 'Thao Tác'),
      key: 'actions',
      width: 110,
      fixed: isMobile ? false : 'right',
      render: (_: any, record: Department) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
          <Can permission="department:update">
            <Tooltip title={t('table.edit', 'Chỉnh Sửa')}>
              <Button
                size="small"
                icon={<EditOutlined style={{ fontSize: 13 }} />}
                style={{ borderRadius: 6 }}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>
          </Can>

          <Can permission="department:delete">
            <Popconfirm
              title={t('table.confirmDelete', 'Bạn có chắc chắn muốn xóa không?')}
              onConfirm={() => handleDeleteDepartment(record.id)}
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
              {t('departments.title', 'Cơ Cấu Phòng Ban & Tổ Chức')}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
              {t('departments.subtitle', 'Quản lý danh sách các phòng ban và tổ chức doanh nghiệp')}
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

            <Can permission="department:create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
              >
                {t('departments.createDept', 'Tạo Phòng Ban Mới')}
              </Button>
            </Can>
          </Space>
        </div>
      </Card>

      {/* Reusable Enterprise Auto-Adaptive Table */}
      <ResponsiveTable
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          onChange: (p: number, ps: number) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      {/* Create Department Modal */}
      <Modal
        title={t('departments.createDept', 'Tạo Phòng Ban Mới')}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        okText={t('users.save', 'Lưu Cấu Hình')}
        cancelText={t('users.cancel', 'Hủy')}
        width={480}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateDepartment} style={{ marginTop: 16 }}>
          <Form.Item name="code" label={t('departments.code', 'Mã Phòng Ban')} rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}>
            <Input placeholder="HR" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="name" label={t('departments.name', 'Tên Phòng Ban')} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Phòng Nhân Sự" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="description" label={t('departments.description', 'Mô Tả')}>
            <Input.TextArea rows={3} placeholder="Mô tả chức năng..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        title={t('departments.editDept', 'Chỉnh Sửa Phòng Ban')}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText={t('users.save', 'Lưu Cấu Hình')}
        cancelText={t('users.cancel', 'Hủy')}
        width={480}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditDepartment} style={{ marginTop: 16 }}>
          <Form.Item name="code" label={t('departments.code', 'Mã Phòng Ban')}>
            <Input disabled style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="name" label={t('departments.name', 'Tên Phòng Ban')} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="description" label={t('departments.description', 'Mô Tả')}>
            <Input.TextArea rows={3} style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
