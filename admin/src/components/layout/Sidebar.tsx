import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  IdcardOutlined,
  ThunderboltFilled,
  BellOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission';
import { ROUTES } from '../../routes/routes.config';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = useAuthStore();

  const userPermissions = user?.permissions || [];

  const [isDepartmentsEnabled, setIsDepartmentsEnabled] = React.useState(
    () => localStorage.getItem('enableDepartments') !== 'false'
  );

  React.useEffect(() => {
    const handleOptionsUpdate = () => {
      setIsDepartmentsEnabled(localStorage.getItem('enableDepartments') !== 'false');
    };
    window.addEventListener('options_updated', handleOptionsUpdate);
    window.addEventListener('storage', handleOptionsUpdate);
    return () => {
      window.removeEventListener('options_updated', handleOptionsUpdate);
      window.removeEventListener('storage', handleOptionsUpdate);
    };
  }, []);

  const rawMenuItems = [
    {
      key: ROUTES.DASHBOARD.path,
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
      permission: ROUTES.DASHBOARD.permission,
    },
    {
      key: ROUTES.ADMIN_USERS.path,
      icon: <UserOutlined />,
      label: t('nav.users'),
      permission: ROUTES.ADMIN_USERS.permission,
    },
    {
      key: ROUTES.ADMIN_ROLES.path,
      icon: <SafetyCertificateOutlined />,
      label: t('nav.roles'),
      permission: ROUTES.ADMIN_ROLES.permission,
    },
    ...(isDepartmentsEnabled
      ? [
          {
            key: ROUTES.ADMIN_DEPARTMENTS.path,
            icon: <ApartmentOutlined />,
            label: t('nav.departments'),
            permission: ROUTES.ADMIN_DEPARTMENTS.permission,
          },
        ]
      : []),
    {
      key: ROUTES.ADMIN_MEDIA.path,
      icon: <FolderOpenOutlined />,
      label: t('nav.media'),
      permission: ROUTES.ADMIN_MEDIA.permission,
    },
    {
      key: ROUTES.ADMIN_PROFILE.path,
      icon: <IdcardOutlined />,
      label: t('nav.profile'),
      permission: ROUTES.ADMIN_PROFILE.permission,
    },
    {
      key: ROUTES.ADMIN_SETTINGS.path,
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      permission: ROUTES.ADMIN_SETTINGS.permission,
    },
    {
      key: ROUTES.ADMIN_NOTIFICATIONS.path,
      icon: <BellOutlined />,
      label: t('nav.notifications'),
      permission: ROUTES.ADMIN_NOTIFICATIONS.permission,
    },
  ];

  // Filter menu items based on user permissions
  const menuItems: MenuProps['items'] = rawMenuItems
    .filter((item) => hasPermission(userPermissions, item.permission))
    .map(({ permission, ...rest }) => rest);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith(ROUTES.ADMIN_USERS.path)) {
      return [ROUTES.ADMIN_USERS.path];
    }
    if (path.startsWith(ROUTES.ADMIN_ROLES.path)) {
      return [ROUTES.ADMIN_ROLES.path];
    }
    if (path.startsWith(ROUTES.ADMIN_DEPARTMENTS.path)) {
      return [ROUTES.ADMIN_DEPARTMENTS.path];
    }
    if (path.startsWith(ROUTES.ADMIN_MEDIA.path)) {
      return [ROUTES.ADMIN_MEDIA.path];
    }
    if (path.startsWith(ROUTES.ADMIN_SETTINGS.path)) {
      return [ROUTES.ADMIN_SETTINGS.path];
    }
    return [path];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      width={240}
      theme={isDark ? 'dark' : 'light'}
      style={{
        borderRight: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        height: '100vh',
        overflow: 'auto',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 64,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: isDark ? '#3f3f46' : '#09090b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          <ThunderboltFilled />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Text style={{ fontWeight: 800, fontSize: 14, display: 'block', lineHeight: 1.2 }}>
              ECOMCX ERP
            </Text>
            <Text type="secondary" style={{ fontSize: 10 }}>
              Enterprise Core
            </Text>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, padding: '8px 0' }}
      />
    </Sider>
  );
};
