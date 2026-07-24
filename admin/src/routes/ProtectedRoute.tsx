import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from './routes.config';
import { hasPermission } from '../utils/permission';
import Forbidden from '../pages/errors/Forbidden';

interface ProtectedRouteProps {
  redirectPath?: string;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = ROUTES.LOGIN.path,
  requiredPermission,
}) => {
  const { isAuthenticated, accessToken, user, isInitializing, initAuth } = useAuthStore();

  // Attempt automatic session rehydration on mount/F5 reload
  useEffect(() => {
    if (isInitializing) {
      initAuth();
    }
  }, [isInitializing, initAuth]);

  // Full-screen loading spinner during session rehydration
  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Spin size="large" tip="Đang tự động khôi phục phiên đăng nhập từ HttpOnly Cookie..." />
      </div>
    );
  }

  // If not authenticated after initialization, redirect to login
  if (!isAuthenticated && !accessToken) {
    return <Navigate to={redirectPath} replace />;
  }

  // Permission Guard Check
  const userPermissions = user?.permissions || [];
  const allowed = hasPermission(userPermissions, requiredPermission);

  if (!allowed) {
    return <Forbidden />;
  }

  return <Outlet />;
};
