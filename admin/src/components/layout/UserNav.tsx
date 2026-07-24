import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../routes/routes.config';

export const UserNav: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN.path);
  };

  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const primaryRole = user?.roles && user.roles.length > 0 ? String(user.roles[0]).toUpperCase() : '';
  const permissionsCount = user?.permissions?.length || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={userName} className="w-9 h-9 rounded-full object-cover shadow-xs" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {userInitial}
          </div>
        )}
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight">{userName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{userEmail}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-800' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200/80 py-2 z-50 animate-in fade-in duration-100">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {primaryRole && <Badge variant="success">{primaryRole}</Badge>}
              <Badge variant="info">{permissionsCount} Quyền</Badge>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.ADMIN_PROFILE.path);
              }}
              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
            >
              <User className="w-4 h-4 text-slate-500" />
              {t('common.profile', 'Hồ Sơ Cá Nhân')}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.ADMIN_ROLES.path);
              }}
              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              {t('common.roles', 'Quyền Hạn Của Tôi')}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.ADMIN_SETTINGS.path);
              }}
              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              {t('common.settings', 'Cài Đặt Hệ Thống')}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              {t('auth.logout', 'Đăng Xuất')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
