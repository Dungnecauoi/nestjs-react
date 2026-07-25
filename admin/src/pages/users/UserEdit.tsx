import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Row,
  Col,
  Space,
  Spin,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  PhoneOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usersApi } from '../../api/modules/users.api';
import { departmentsApi } from '../../api/modules/departments.api';
import { rolesApi } from '../../api/modules/roles.api';
import { permissionsApi } from '../../api/modules/permissions.api';
import { ROUTES } from '../../routes/routes.config';
import { useSystemOptions } from '../../hooks/useSystemOptions';

export default function UserEdit() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });

  const { data: systemOptions } = useSystemOptions();
  const isDepartmentsEnabled = systemOptions?.enableDepartments !== false;

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.code})`,
  }));

  const roleOptions = roles.map((r) => ({ value: r.code, label: `${r.name} (${r.code})` }));
  const permissionOptions = permissions.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }));

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const user = await usersApi.getUser(id);
        if (user) {
          const existingRoles = user.roles?.map((r) => r.role?.code || r) || [];
          const existingPerms = user.permissions?.map((p) => p.permission?.code || p) || [];
          const existingDepts = user.departments?.map((d) => d.departmentId || d.department?.id || d) || [];

          form.setFieldsValue({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            identityCard: user.identityCard || '',
            gender: user.gender || 'MALE',
            dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
            address: user.address || '',
            bio: user.bio || '',
            isActive: user.isActive,
            roleCodes: existingRoles,
            permissionCodes: existingPerms,
            departmentIds: existingDepts,
          });
        }
      } catch {
        message.error('Không thể tải thông tin người dùng!');
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [id, form]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    setLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      await usersApi.updateUser(id, payload);
      message.success(t('users.updateSuccess', 'Đã cập nhật thông tin người dùng thành công!'));
      navigate(ROUTES.ADMIN_USERS.path);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể cập nhật người dùng!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Đang tải dữ liệu người dùng từ Database..." />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Action Header */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space align="center" size="middle">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTES.ADMIN_USERS.path)}
              style={{ borderRadius: 8 }}
            >
              {t('users.back', 'Quay Lại')}
            </Button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {t('users.editTitle', 'Chỉnh Sửa Hồ Sơ Người Dùng Enterprise')}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
                {t('users.editSubtitle', 'Cập nhật thông tin định danh CCCD, số điện thoại, địa chỉ và vai trò')}
              </p>
            </div>
          </Space>

          <Space size="middle">
            <Button onClick={() => navigate(ROUTES.ADMIN_USERS.path)} style={{ borderRadius: 8 }}>
              {t('users.cancel', 'Hủy Bỏ')}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
              style={{ backgroundColor: '#2563eb', borderRadius: 8, fontWeight: 600 }}
            >
              {t('users.saveChanges', 'Lưu Thay Đổi')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Multi-Card Form */}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          {/* Left Column: Account & Identity Forms */}
          <Col xs={24} lg={15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Card 1: Account Information */}
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: 700 }}>{t('users.sectionAccount', '1. Thông Tin Tài Khoản Đăng Nhập')}</span>
                  </Space>
                }
                bordered={false}
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label={t('users.fullName', 'Họ và Tên')}
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="email" label={t('users.email', 'Địa Chỉ Email')}>
                      <Input disabled prefix={<MailOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="currentPassword"
                      label={t('users.currentPassword', 'Mật Khẩu Hiện Tại (Bắt buộc nhập nếu đổi mật khẩu)')}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('newPassword') && !value) {
                              return Promise.reject(new Error('Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu!'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="******" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="newPassword" label={t('users.newPassword', 'Mật Khẩu Mới (Để trống nếu không đổi)')}>
                      <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="******" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="isActive" label={t('users.status', 'Trạng Thái Tài Khoản')}>
                      <Select
                        options={[
                          { value: true, label: t('users.statusActive', 'Hoạt Động (Đã Phê Duyệt)') },
                          { value: false, label: t('users.statusPending', 'Tạm Khóa / Chờ Phê Duyệt') },
                        ]}
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Card 2: Personal Identity (CCCD, Gender, Date of Birth) */}
              <Card
                title={
                  <Space>
                    <IdcardOutlined style={{ color: '#059669' }} />
                    <span style={{ fontWeight: 700 }}>{t('users.sectionIdentity', '2. Thông Tin Định Danh Cá Nhân (CCCD / Giấy Tờ)')}</span>
                  </Space>
                }
                bordered={false}
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="identityCard" label={t('users.identityCard', 'Số CCCD / CMND')}>
                      <Input prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />} placeholder="001099123456" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="dateOfBirth" label={t('users.dateOfBirth', 'Ngày Sinh')}>
                      <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="gender" label={t('users.gender', 'Giới Tính')}>
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="MALE">{t('users.genderMale', 'Nam')}</Radio.Button>
                        <Radio.Button value="FEMALE">{t('users.genderFemale', 'Nữ')}</Radio.Button>
                        <Radio.Button value="OTHER">{t('users.genderOther', 'Khác')}</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Card 3: Contact & Address */}
              <Card
                title={
                  <Space>
                    <PhoneOutlined style={{ color: '#d97706' }} />
                    <span style={{ fontWeight: 700 }}>{t('users.sectionContact', '3. Thông Tin Liên Hệ & Địa Chỉ')}</span>
                  </Space>
                }
                bordered={false}
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label={t('users.phone', 'Số Điện Thoại Di Động')}>
                      <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0988 123 456" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={24}>
                    <Form.Item name="address" label={t('users.address', 'Địa Chỉ Thường Trú / Tạm Trú')}>
                      <Input.TextArea rows={2} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={24}>
                    <Form.Item name="bio" label={t('users.bio', 'Ghi Chú / Tiểu Sử Nhân Sự')}>
                      <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>

          {/* Right Column: Roles, Permissions & Departments */}
          <Col xs={24} lg={9}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card
                title={
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#7c3aed' }} />
                    <span style={{ fontWeight: 700 }}>{t('users.sectionRoles', '4. Vai Trò, Quyền Hạn & Phòng Ban')}</span>
                  </Space>
                }
                bordered={false}
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12 }}
              >
                <Form.Item
                  name="roleCodes"
                  label={t('users.assignRolesHelp', 'Gán Vai Trò Hạn Định (Roles)')}
                  rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn các vai trò..."
                    options={roleOptions}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item name="permissionCodes" label={t('users.selectDirectPermissions', 'Gán Quyền Hạn Trực Tiếp (Direct Permissions)')}>
                  <Select
                    mode="multiple"
                    placeholder="Chọn quyền trực tiếp..."
                    options={permissionOptions}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                {isDepartmentsEnabled && (
                  <Form.Item name="departmentIds" label={t('users.selectDepartments', 'Chọn Phòng Ban Trực Thuộc')}>
                    <Select
                      mode="multiple"
                      placeholder="Chọn phòng ban..."
                      options={departmentOptions}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  💡 <b>Lưu ý phân quyền:</b> {t('users.rolesNotice', 'Người dùng sẽ nhận được toàn bộ mảng Quyền Hạn (Permissions) tương ứng với các Vai Trò được chọn ở trên.')}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
