import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../routes/routes.config';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map path to friendly names
  const getBreadcrumbName = (path: string, fullPath: string) => {
    const routeItem = Object.values(ROUTES).find((r) => r.path === fullPath);
    if (routeItem) return routeItem.name;
    
    // Fallbacks
    if (path === 'admin') return 'Quản Trị';
    if (path === 'users') return 'Người Dùng';
    if (path === 'roles') return 'Vai Trò';
    if (path === 'departments') return 'Phòng Ban';
    if (path === 'dashboard') return 'Tổng Quan';
    if (path === 'settings') return 'Cấu Hình';
    
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="flex items-center space-x-1 text-xs sm:text-sm text-slate-500 font-medium overflow-x-auto py-1">
      <Link
        to="/admin/dashboard"
        className="flex items-center hover:text-slate-900 transition-colors shrink-0"
      >
        <Home className="w-4 h-4 mr-1 text-slate-400" />
        <span>Trang Chủ</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = getBreadcrumbName(value, to);

        if (value === 'admin' && index === 0) return null; // skip root 'admin' breadcrumb if duplicate

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-0.5" />
            {isLast ? (
              <span className="font-semibold text-slate-800 shrink-0 truncate max-w-[150px] sm:max-w-xs">
                {name}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-900 transition-colors shrink-0"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
