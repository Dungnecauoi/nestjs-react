import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Breadcrumb, Dropdown, Avatar, Button, Space, Typography, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../routes/routes.config';
import { useAuthStore } from '../../store/useAuthStore';
import { NotificationBell } from '../NotificationBell';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, logout } = useAuthStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';

  // Compute Breadcrumb Title using i18n t(...) keys
  const getBreadcrumbTitle = (pathname: string) => {
    if (pathname.startsWith(ROUTES.ADMIN_USERS_CREATE.path)) {
      return t('nav.userCreate', 'Thêm Mới Người Dùng');
    }
    if (pathname.includes('/edit') && pathname.startsWith('/admin/users')) {
      return t('nav.userEdit', 'Chỉnh Sửa Người Dùng');
    }
    if (pathname.startsWith(ROUTES.ADMIN_USERS.path)) {
      return t('nav.users', 'Người Dùng');
    }
    if (pathname.startsWith(ROUTES.ADMIN_ROLES.path)) {
      return t('nav.roles', 'Vai Trò');
    }
    if (pathname.startsWith(ROUTES.ADMIN_DEPARTMENTS.path)) {
      return t('nav.departments', 'Phòng Ban');
    }
    if (pathname.startsWith(ROUTES.ADMIN_MEDIA.path)) {
      return t('nav.media', 'Media');
    }
    if (pathname.startsWith(ROUTES.ADMIN_SETTINGS.path)) {
      return t('nav.settings', 'Cấu Hình');
    }
    if (pathname.startsWith(ROUTES.ADMIN_TRANSLATIONS.path)) {
      return t('nav.translations', 'Bản Dịch');
    }
    if (pathname.startsWith(ROUTES.ADMIN_NOTIFICATIONS.path)) {
      return t('nav.notifications', 'Thông Báo');
    }
    if (pathname.startsWith(ROUTES.ADMIN_AUDIT_LOGS.path)) {
      return t('nav.auditLogs', 'Nhật Ký');
    }
    if (pathname.startsWith(ROUTES.ADMIN_PROFILE.path)) {
      return t('nav.profile', 'Hồ Sơ Cá Nhân');
    }
    if (pathname.startsWith(ROUTES.DASHBOARD.path)) {
      return t('nav.dashboard', 'Tổng Quan');
    }
    return t('header.adminPage', 'Trang Quản Trị');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN.path);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('header.profile', 'Hồ Sơ Cá Nhân'),
      onClick: () => navigate(ROUTES.ADMIN_PROFILE.path),
    },
    {
      key: 'roles',
      icon: <SettingOutlined />,
      label: t('header.myPermissions', 'Quyền Hạn Của Tôi'),
      onClick: () => navigate(ROUTES.ADMIN_ROLES.path),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: t('header.logout', 'Đăng Xuất'),
      onClick: handleLogout,
    },
  ];

  const langMenuItems: MenuProps['items'] = [
    {
      key: 'vi',
      label: 'Tiếng Việt (VI)',
      onClick: () => handleLanguageChange('vi'),
    },
    {
      key: 'en',
      label: 'English (EN)',
      onClick: () => handleLanguageChange('en'),
    },
  ];

  return (
    <AntHeader
      style={{
        padding: isMobile ? '0 12px' : '0 24px',
        backgroundColor: isDark ? '#121215' : '#ffffff',
        borderBottom: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left Trigger & Breadcrumb */}
      <Space size="small">
        {isMobile ? (
          <Button
            type="text"
            icon={<UnorderedListOutlined style={{ fontSize: '20px' }} />}
            onClick={onToggleMobileSidebar}
          />
        ) : (
          <Button
            type="text"
            icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleDesktopSidebar}
            style={{ fontSize: '16px' }}
          />
        )}

        {!isMobile && (
          <Breadcrumb
            items={[
              { title: t('header.systemBreadcrumb', 'ERP Enterprise') },
              { title: getBreadcrumbTitle(location.pathname) },
            ]}
          />
        )}
      </Space>

      {/* Right Controls: Notifications, Language, User Dropdown */}
      <Space size={isMobile ? 'small' : 'middle'}>
        {/* Language Selector */}
        <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
          <Button type="text" icon={<GlobalOutlined />}>
            {i18n.language === 'en' ? 'EN' : 'VI'}
          </Button>
        </Dropdown>

        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button
            type="text"
            style={{
              height: 'auto',
              padding: isMobile ? '4px' : '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Avatar
              src={user?.avatar || undefined}
              style={{
                backgroundColor: isDark ? '#3f3f46' : '#1890ff',
                color: '#ffffff',
                fontWeight: 600,
              }}
              size="small"
            >
              {userInitial}
            </Avatar>
            {!isMobile && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <Text style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                  {userName || 'User'}
                </Text>
                {userEmail && (
                  <Text type="secondary" style={{ fontSize: 11, lineHeight: 1 }}>
                    {userEmail}
                  </Text>
                )}
              </div>
            )}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
