import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAntdTheme, COLOR_PRESETS, RADIUS_PRESETS } from '../../context/AntdThemeProvider';
import {
  X,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  Columns3,
  Sliders,
  Palette,
  Check,
  Zap,
  Box,
  Square,
} from 'lucide-react';
import { Button } from '../ui/button';

interface ThemeConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const ThemeConfigurator: React.FC<ThemeConfiguratorProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, layoutPosition, setLayoutPosition } = useTheme();
  const {
    primaryColor,
    setPrimaryColor,
    borderRadius,
    setBorderRadius,
    isCompact,
    setIsCompact,
    wireframe,
    setWireframe,
  } = useAntdTheme();

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-105 transition-all duration-200"
        title={t('theme.title')}
      >
        <Sliders className="w-5 h-5 animate-spin-slow" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Right Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 sm:w-96 bg-white dark:bg-[#121215] border-l border-slate-200 dark:border-zinc-800 transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full text-xs">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('theme.title')}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {t('theme.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* 1. Primary Accent Color Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.primaryColor')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = primaryColor === preset.hex;
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => setPrimaryColor(preset.hex)}
                      className={`h-9 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 scale-105 border-transparent shadow-xs'
                          : 'border-slate-200 dark:border-zinc-700 hover:scale-102'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Border Radius Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.borderRadius')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RADIUS_PRESETS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setBorderRadius(r.value)}
                    className={`p-2 rounded-md border flex items-center justify-center gap-1.5 transition-all font-semibold ${
                      borderRadius === r.value
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Dark / Light Mode Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.mode')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 transition-all font-semibold ${
                    themeMode === 'light'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>{t('theme.light')}</span>
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 transition-all font-semibold ${
                    themeMode === 'dark'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>{t('theme.dark')}</span>
                </button>
                <button
                  onClick={() => setThemeMode('system')}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 transition-all font-semibold ${
                    themeMode === 'system'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>{t('theme.system')}</span>
                </button>
              </div>
            </div>

            {/* 4. Display Density Mode Toggle */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.density')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsCompact(false)}
                  className={`p-2.5 rounded-md border flex items-center justify-center gap-2 transition-all font-semibold ${
                    !isCompact
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('theme.standard')}</span>
                </button>
                <button
                  onClick={() => setIsCompact(true)}
                  className={`p-2.5 rounded-md border flex items-center justify-center gap-2 transition-all font-semibold ${
                    isCompact
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t('theme.compact')}</span>
                </button>
              </div>
            </div>

            {/* 5. Wireframe Mode Toggle */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.wireframe')}
              </label>
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`w-full p-2.5 rounded-md border flex items-center justify-center gap-2 transition-all font-semibold ${
                  wireframe
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>{wireframe ? 'Bật Khung Viền Wireframe' : 'Tắt Wireframe'}</span>
              </button>
            </div>

            {/* 6. Layout Position Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider font-mono text-[11px]">
                {t('theme.layout')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLayoutPosition('vertical')}
                  className={`p-2.5 rounded-md border flex items-center justify-center gap-2 transition-all font-semibold ${
                    layoutPosition === 'vertical'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Columns3 className="w-4 h-4" />
                  <span>{t('theme.vertical')}</span>
                </button>
                <button
                  onClick={() => setLayoutPosition('horizontal')}
                  className={`p-2.5 rounded-md border flex items-center justify-center gap-2 transition-all font-semibold ${
                    layoutPosition === 'horizontal'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>{t('theme.horizontal')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
            <Button onClick={onClose} type="primary" className="w-full font-bold rounded-md">
              {t('theme.apply')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
