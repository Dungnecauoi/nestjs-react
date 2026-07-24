import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = i18n.language || 'vi';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors focus:outline-none"
        title="Đổi Ngôn Ngữ / Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="uppercase font-bold">{currentLang}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in duration-100 text-xs">
          <button
            onClick={() => changeLanguage('vi')}
            className={`w-full px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium ${
              currentLang === 'vi' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇻🇳</span>
              <span>Tiếng Việt</span>
            </span>
            {currentLang === 'vi' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => changeLanguage('en')}
            className={`w-full px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium ${
              currentLang === 'en' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span>English</span>
            </span>
            {currentLang === 'en' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
