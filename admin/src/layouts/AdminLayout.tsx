import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/layout/Header';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { ThemeConfigurator } from '../components/layout/ThemeConfigurator';

const { Content, Footer } = Layout;

export const AdminLayout: React.FC = () => {
  const { layoutPosition, isDark } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: isDark ? '#09090b' : '#f8fafc' }}>
      {/* 1. HORIZONTAL TOP NAV MODE */}
      {layoutPosition === 'horizontal' ? (
        <TopNav onOpenConfigurator={() => setIsConfiguratorOpen(true)} />
      ) : (
        /* 2. VERTICAL SIDEBAR MODE */
        <Sidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      {/* Main Container Wrapper */}
      <Layout
        style={{
          marginLeft: layoutPosition === 'vertical' ? (isCollapsed ? 80 : 240) : 0,
          transition: 'margin-left 0.2s ease-in-out',
          backgroundColor: 'transparent',
        }}
      >
        {/* Sticky Header */}
        {layoutPosition === 'vertical' && (
          <Header
            onToggleMobileSidebar={() => setIsMobileOpen(true)}
            onToggleDesktopSidebar={() => setIsCollapsed(!isCollapsed)}
            isSidebarCollapsed={isCollapsed}
          />
        )}

        {/* Dynamic Route Content Outlet (100% Fluid Native AntD Content) */}
        <Content style={{ padding: '24px', minHeight: 280, width: '100%' }}>
          <Outlet />
        </Content>

        {/* Ant Design Footer */}
        <Footer
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: isDark ? '#a1a1aa' : '#64748b',
            backgroundColor: 'transparent',
            borderTop: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            padding: '12px 24px',
          }}
        >
          ECOMCX Enterprise ERP &copy; {new Date().getFullYear()} — System Architecture
        </Footer>
      </Layout>

      {/* Theme & Layout Configurator Drawer */}
      <ThemeConfigurator
        isOpen={isConfiguratorOpen}
        onClose={() => setIsConfiguratorOpen(false)}
        onOpen={() => setIsConfiguratorOpen(true)}
      />
    </Layout>
  );
};

export default AdminLayout;
