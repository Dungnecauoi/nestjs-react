import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Breadcrumb, Dropdown, Avatar, Button, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../routes/routes.config';
import { useAuthStore } from '../../store/useAuthStore';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleDesktopSidebar,
  isSidebarCollapsed,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, logout } = useAuthStore();

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';

  // Compute Breadcrumb Title
  const getBreadcrumbTitle = (pathname: string) => {
    switch (pathname) {
      case ROUTES.DASHBOARD.path:
        return 'Tổng Quan System';
      case ROUTES.ADMIN_USERS.path:
        return 'Quản Lý Người Dùng';
      case ROUTES.ADMIN_ROLES.path:
        return 'Vai Trò & Phân Quyền';
      case ROUTES.ADMIN_DEPARTMENTS.path:
        return 'Cơ Cấu Phòng Ban';
      case ROUTES.ADMIN_MEDIA.path:
        return 'Thư Viện Media';
      case ROUTES.ADMIN_PROFILE.path:
        return 'Hồ Sơ Cá Nhân';
      case ROUTES.ADMIN_SETTINGS.path:
        return 'Cấu Hình Hệ Thống';
      default:
        return 'Trang Quản Trị';
    }
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
      label: 'Hồ Sơ Cá Nhân',
      onClick: () => navigate(ROUTES.ADMIN_PROFILE.path),
    },
    {
      key: 'roles',
      icon: <SettingOutlined />,
      label: 'Quyền Hạn Của Tôi',
      onClick: () => navigate(ROUTES.ADMIN_ROLES.path),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng Xuất',
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
        padding: '0 24px',
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
      <Space size="middle">
        <Button
          type="text"
          icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleDesktopSidebar}
          style={{ fontSize: '16px' }}
        />

        <Breadcrumb
          items={[
            { title: 'ERP Enterprise' },
            { title: getBreadcrumbTitle(location.pathname) },
          ]}
        />
      </Space>

      {/* Right Controls: Notifications, Language, User Dropdown */}
      <Space size="middle">
        {/* Language Selector */}
        <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
          <Button type="text" icon={<GlobalOutlined />}>
            {i18n.language === 'en' ? 'EN' : 'VI'}
          </Button>
        </Dropdown>

        {/* Notifications */}
        <Button type="text" icon={<BellOutlined />} />

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            {user?.avatar ? (
              <Avatar src={user.avatar} size="default" />
            ) : (
              <Avatar style={{ backgroundColor: '#09090b', fontWeight: 'bold' }}>
                {userInitial}
              </Avatar>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 12 }}>{userName}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>{userEmail}</Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
