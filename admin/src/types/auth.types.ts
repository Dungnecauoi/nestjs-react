// Kế thừa định dạng API Response từ NestJS TransformInterceptor
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
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
