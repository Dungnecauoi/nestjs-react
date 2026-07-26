import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ClusterOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { usersApi } from '../../api/modules/users.api';
import { departmentsApi } from '../../api/modules/departments.api';
import { rolesApi } from '../../api/modules/roles.api';
import { permissionsApi } from '../../api/modules/permissions.api';
import { ROUTES } from '../../routes/routes.config';
import { notify } from '../../utils/notify';

export default function UserCreate() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const { data: departmentsResponse } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments({ limit: 100 }),
  });
  const departments = departmentsResponse?.data || [];

  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles({ limit: 100 }),
  });
  const roles = rolesResponse?.data || [];

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });

  const departmentOptions = departments.map((d: any) => ({
    value: d.id,
    label: `${d.name} (${d.code})`,
  }));

  const roleOptions = roles.map((r: any) => ({ value: r.code, label: `${r.name} (${r.code})` }));
  const permissionOptions = permissions.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }));

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      await usersApi.createUser(payload);
      notify.success('users.createSuccess', 'Đã tạo tài khoản người dùng mới thành công!');
      navigate(ROUTES.ADMIN_USERS.path);
    } catch (err: any) {
      notify.error(err, 'Không thể tạo tài khoản người dùng!');
    } finally {
      setLoading(false);
    }
  };



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
                {t('users.createTitle', 'Thêm Mới Người Dùng Enterprise')}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
                {t('users.createSubtitle', 'Nhập đầy đủ thông tin tài khoản, định danh CCCD, liên hệ và phân quyền vai trò')}
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
              {t('users.saveUser', 'Lưu Người Dùng Mới')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Multi-Card Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gender: 'MALE',
          isActive: true,
          roleCodes: ['staff'],
        }}
      >
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
                      <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label={t('users.email', 'Địa Chỉ Email')}
                      rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                      <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="user@ecomcx.com" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label={t('users.password', 'Mật Khẩu Khởi Tạo')}
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}
                    >
                      <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="******" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="isActive" label={t('users.status', 'Trạng Thái Tài Khoản')}>
                      <Select
                        options={[
                          { value: true, label: t('users.statusActive', 'Hoạt Động (Kích Hoạt Ngay)') },
                          { value: false, label: t('users.statusPending', 'Chờ Phê Duyệt (Tạm Khóa)') },
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
                      <DatePicker style={{ width: '100%', borderRadius: 8 }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
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
                      <Input.TextArea placeholder="Số 10, Đường ABC, Phường XYZ, Hà Nội" rows={2} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={24}>
                    <Form.Item name="bio" label={t('users.bio', 'Ghi Chú / Tiểu Sử Nhân Sự')}>
                      <Input.TextArea placeholder="Nhập ghi chú hoặc thông tin tiểu sử nhân sự..." rows={3} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>

          {/* Right Column: Roles, Permissions & Departments */}
          <Col xs={24} lg={9}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Card 4: Roles, Permissions & Departments */}
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

                <Form.Item name="departmentIds" label={t('users.selectDepartments', 'Chọn Phòng Ban Trực Thuộc')}>
                  <Select
                    mode="multiple"
                    placeholder="Chọn phòng ban..."
                    options={departmentOptions}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

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
