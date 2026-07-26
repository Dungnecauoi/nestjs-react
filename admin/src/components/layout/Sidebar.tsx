import React, { useState, useEffect } from 'react';
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
  GlobalOutlined,
  ThunderboltFilled,
  BellOutlined,
  HistoryOutlined,
  TeamOutlined,
  AppstoreOutlined,
  KeyOutlined,
  CloudServerOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission';
import { ROUTES } from '../../routes/routes.config';
import { useSystemOptions } from '../../hooks/useSystemOptions';

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

  const { data: systemOptions } = useSystemOptions();
  const isDepartmentsEnabled = systemOptions?.enableDepartments !== false;

  // Determine active SubMenu based on current route
  const getInitialOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/users') || path.startsWith('/admin/roles') || path.startsWith('/admin/departments')) {
      return ['sub-access-control'];
    }
    if (path.startsWith('/admin/media')) {
      return ['sub-resources'];
    }
    if (
      path.startsWith('/admin/settings') ||
      path.startsWith('/admin/translations') ||
      path.startsWith('/admin/notifications') ||
      path.startsWith('/admin/audit-logs')
    ) {
      return ['sub-system'];
    }
    return [];
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getInitialOpenKeys);

  useEffect(() => {
    if (!isCollapsed) {
      setOpenKeys((prevKeys) => {
        const routeKeys = getInitialOpenKeys();
        const combined = Array.from(new Set([...prevKeys, ...routeKeys]));
        return combined;
      });
    }
  }, [location.pathname, isCollapsed]);

  // 1. Access Control SubMenu Items
  const accessControlChildren = [
    {
      key: ROUTES.ADMIN_USERS.path,
      icon: <UserOutlined />,
      label: t('nav.users', 'Người Dùng'),
      permission: ROUTES.ADMIN_USERS.permission,
    },
    {
      key: ROUTES.ADMIN_ROLES.path,
      icon: <SafetyCertificateOutlined />,
      label: t('nav.roles', 'Vai Trò'),
      permission: ROUTES.ADMIN_ROLES.permission,
    },
    {
      key: ROUTES.ADMIN_DEPARTMENTS.path,
      icon: <ApartmentOutlined />,
      label: t('nav.departments', 'Phòng Ban'),
      permission: ROUTES.ADMIN_DEPARTMENTS.permission,
    },
  ].filter((item) => hasPermission(userPermissions, item.permission));

  // 2. Resources SubMenu Items
  const resourcesChildren = [
    {
      key: ROUTES.ADMIN_MEDIA.path,
      icon: <FolderOpenOutlined />,
      label: t('nav.media', 'Media'),
      permission: ROUTES.ADMIN_MEDIA.permission,
    },
  ].filter((item) => hasPermission(userPermissions, item.permission));

  // 3. System Settings & Configuration SubMenu Items
  const systemChildren = [
    {
      key: ROUTES.ADMIN_SETTINGS.path,
      icon: <SettingOutlined />,
      label: t('nav.settings', 'Cấu Hình'),
      permission: ROUTES.ADMIN_SETTINGS.permission,
    },
    {
      key: ROUTES.ADMIN_TRANSLATIONS.path,
      icon: <GlobalOutlined />,
      label: t('nav.translations', 'Bản Dịch'),
      permission: ROUTES.ADMIN_TRANSLATIONS.permission,
    },
    {
      key: ROUTES.ADMIN_NOTIFICATIONS.path,
      icon: <BellOutlined />,
      label: t('nav.notifications', 'Thông Báo'),
      permission: ROUTES.ADMIN_NOTIFICATIONS.permission,
    },
    {
      key: ROUTES.ADMIN_AUDIT_LOGS.path,
      icon: <HistoryOutlined />,
      label: t('nav.auditLogs', 'Nhật Ký'),
      permission: ROUTES.ADMIN_AUDIT_LOGS.permission,
    },
    {
      key: ROUTES.ADMIN_API_KEYS.path,
      icon: <KeyOutlined />,
      label: 'API Keys',
      permission: ROUTES.ADMIN_API_KEYS.permission,
    },
    {
      key: ROUTES.ADMIN_QUEUES.path,
      icon: <CloudServerOutlined />,
      label: 'Queue Jobs',
      permission: ROUTES.ADMIN_QUEUES.permission,
    },
    {
      key: ROUTES.ADMIN_MAINTENANCE.path,
      icon: <ToolOutlined />,
      label: 'Bảo Trì & Backup',
      permission: ROUTES.ADMIN_MAINTENANCE.permission,
    },
  ].filter((item) => hasPermission(userPermissions, item.permission));

  // Build SubMenu Accordion Items
  const menuItems: MenuProps['items'] = [
    // 1. Dashboard Single Item
    hasPermission(userPermissions, ROUTES.DASHBOARD.permission)
      ? {
          key: ROUTES.DASHBOARD.path,
          icon: <DashboardOutlined />,
          label: t('nav.dashboard', 'Tổng Quan'),
        }
      : null,

    // 2. Access Control SubMenu
    accessControlChildren.length > 0
      ? {
          key: 'sub-access-control',
          icon: <TeamOutlined />,
          label: t('nav.accessControlSubmenu', 'Nhân Sự & Quyền'),
          children: accessControlChildren.map(({ permission, ...rest }) => rest),
        }
      : null,

    // 3. Resources SubMenu
    resourcesChildren.length > 0
      ? {
          key: 'sub-resources',
          icon: <AppstoreOutlined />,
          label: t('nav.resourcesSubmenu', 'Tài Nguyên'),
          children: resourcesChildren.map(({ permission, ...rest }) => rest),
        }
      : null,

    // 4. System Settings SubMenu (Includes Settings, Translations, Notifications & Audit Logs)
    systemChildren.length > 0
      ? {
          key: 'sub-system',
          icon: <SettingOutlined />,
          label: t('nav.systemSubmenu', 'Hệ Thống & Cấu Hình'),
          children: systemChildren.map(({ permission, ...rest }) => rest),
        }
      : null,
  ].filter(Boolean) as MenuProps['items'];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
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
    if (path.startsWith(ROUTES.ADMIN_TRANSLATIONS.path)) {
      return [ROUTES.ADMIN_TRANSLATIONS.path];
    }
    if (path.startsWith(ROUTES.ADMIN_NOTIFICATIONS.path)) {
      return [ROUTES.ADMIN_NOTIFICATIONS.path];
    }
    if (path.startsWith(ROUTES.ADMIN_AUDIT_LOGS.path)) {
      return [ROUTES.ADMIN_AUDIT_LOGS.path];
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

      {/* Navigation Menu (SubMenu Accordion) */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={isCollapsed ? undefined : openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, padding: '8px 0' }}
      />
    </Sider>
  );
};
