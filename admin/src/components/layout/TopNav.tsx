import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Space, Typography, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  SettingOutlined,
  IdcardOutlined,
  ThunderboltFilled,
  GlobalOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { useSystemOptions } from '../../hooks/useSystemOptions';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface TopNavProps {
  onOpenConfigurator?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenConfigurator }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const { data: systemOptions } = useSystemOptions();
  const isDepartmentsEnabled = systemOptions?.enableDepartments !== false;

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng Quan System',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Người Dùng',
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Vai Trò',
    },
    ...(isDepartmentsEnabled
      ? [
          {
            key: '/admin/departments',
            icon: <ApartmentOutlined />,
            label: 'Phòng Ban',
          },
        ]
      : []),
    {
      key: '/admin/profile',
      icon: <IdcardOutlined />,
      label: 'Hồ Sơ',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cấu Hình',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <AntHeader
      style={{
        backgroundColor: isDark ? '#121215' : '#ffffff',
        borderBottom: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <Space size="middle">
        <Avatar
          style={{ backgroundColor: '#09090b', color: '#ffffff', fontWeight: 'bold' }}
          icon={<ThunderboltFilled />}
        />
        <Text strong style={{ fontSize: 14 }}>
          ECOMCX ERP
        </Text>
      </Space>

      {/* AntD Horizontal Menu */}
      <Menu
        mode="horizontal"
        theme={isDark ? 'dark' : 'light'}
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ flex: 1, minWidth: 0, margin: '0 24px', borderBottom: 0, fontSize: 13, fontWeight: 500 }}
      />

      {/* Configurator Trigger */}
      <Space>
        {onOpenConfigurator && (
          <Button icon={<SlidersOutlined />} onClick={onOpenConfigurator}>
            Theme
          </Button>
        )}
      </Space>
    </AntHeader>
  );
};

export default TopNav;
