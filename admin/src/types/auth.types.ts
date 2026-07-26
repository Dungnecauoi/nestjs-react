export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// User Model Interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  identityCard?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  bio?: string | null;
  isActive?: boolean;
  isTwoFactorEnabled?: boolean;
  createdAt?: string;
  roles?: any[];
  permissions?: any[];
  departments?: UserDepartmentRelation[];
}

// Role Model Interface
export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  permissions?: RolePermissionRelation[];
}

// Permission Model Interface
export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string | null;
}

// Department Model Interface
export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UserRoleRelation {
  roleId: string;
  role: Role;
}

export interface UserPermissionRelation {
  permissionId: string;
  permission: Permission;
}

export interface UserDepartmentRelation {
  departmentId: string;
  department: Department;
  isPrimary: boolean;
}

export interface RolePermissionRelation {
  permissionId: string;
  permission: Permission;
}

// Login Payload & Token Response
export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

// Notification Model Interface
export interface NotificationItem {
  id: string;
  userId?: string | null;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  data?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

// Audit Log Model Interface
export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  entityId?: string | null;
  beforeState?: string | null;
  afterState?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: Partial<User>;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


