import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission';

interface CanProps {
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative component for conditional UI rendering based on permissions.
 * Usage:
 * <Can permission="user:create">
 *   <Button>Thêm Người Dùng</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  const { user } = useAuthStore();
  const userPermissions = user?.permissions || [];

  const allowed = hasPermission(userPermissions, permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
