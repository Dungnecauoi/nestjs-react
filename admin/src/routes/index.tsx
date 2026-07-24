import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout, AuthLayout, BlankLayout } from '../layouts';

// Modular Feature Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DashboardModule from '../pages/dashboard';
import UsersModule from '../pages/users';
import UserCreate from '../pages/users/UserCreate';
import UserEdit from '../pages/users/UserEdit';
import UserProfile from '../pages/users/Profile';
import RolesModule from '../pages/roles';
import DepartmentsModule from '../pages/departments';
import MediaModule from '../pages/media';
import SettingsModule from '../pages/settings';
import NotificationsPage from '../pages/notifications';
import AuditLogsPage from '../pages/audit-logs';
import Forbidden from '../pages/errors/Forbidden';
import NotFound from '../pages/errors/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './routes.config';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Auth Routes (AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN.path} element={<Login />} />
        <Route path="/login" element={<Navigate to={ROUTES.LOGIN.path} replace />} />
        <Route path={ROUTES.REGISTER.path} element={<Register />} />
      </Route>

      {/* 2. Protected Admin App Routes (AdminLayout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.DASHBOARD.path} element={<DashboardModule />} />
          <Route path={ROUTES.ADMIN_PROFILE.path} element={<UserProfile />} />

          {/* Modular Permission-Guarded Admin Feature Routes */}
          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_USERS.permission} />}>
            <Route path={ROUTES.ADMIN_USERS.path} element={<UsersModule />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_USERS_CREATE.permission} />}>
            <Route path={ROUTES.ADMIN_USERS_CREATE.path} element={<UserCreate />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_USERS_EDIT.permission} />}>
            <Route path={ROUTES.ADMIN_USERS_EDIT.path} element={<UserEdit />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_ROLES.permission} />}>
            <Route path={ROUTES.ADMIN_ROLES.path} element={<RolesModule />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_DEPARTMENTS.permission} />}>
            <Route path={ROUTES.ADMIN_DEPARTMENTS.path} element={<DepartmentsModule />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_MEDIA.permission} />}>
            <Route path={ROUTES.ADMIN_MEDIA.path} element={<MediaModule />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_SETTINGS.permission} />}>
            <Route path={ROUTES.ADMIN_SETTINGS.path} element={<SettingsModule />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_NOTIFICATIONS.permission} />}>
            <Route path={ROUTES.ADMIN_NOTIFICATIONS.path} element={<NotificationsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={ROUTES.ADMIN_AUDIT_LOGS.permission} />}>
            <Route path={ROUTES.ADMIN_AUDIT_LOGS.path} element={<AuditLogsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 3. Standalone Pages (BlankLayout) */}
      <Route element={<BlankLayout />}>
        <Route path={ROUTES.FORBIDDEN.path} element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD.path} replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
