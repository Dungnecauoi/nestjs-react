import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Grid } from 'antd';
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
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const contentMarginLeft = isMobile || layoutPosition === 'horizontal' ? 0 : isCollapsed ? 80 : 240;

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
          marginLeft: contentMarginLeft,
          transition: 'margin-left 0.2s ease-in-out',
          backgroundColor: 'transparent',
          minWidth: 0,
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

        {/* Dynamic Route Content Outlet (Fluid Native AntD Content) */}
        <Content style={{ padding: isMobile ? '12px' : '24px', minHeight: 280, width: '100%', minWidth: 0 }}>
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
