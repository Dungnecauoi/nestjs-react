import React, { createContext, useContext, useState, useEffect } from 'react';
import '../i18n/config'; // Ensure i18n is initialized

export type LayoutPosition = 'vertical' | 'horizontal';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarVariant = 'dark' | 'light' | 'brand';
export type AccentColor = 'blue' | 'indigo' | 'emerald' | 'violet';

interface ThemeContextType {
  layoutPosition: LayoutPosition;
  setLayoutPosition: (position: LayoutPosition) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  sidebarVariant: SidebarVariant;
  setSidebarVariant: (variant: SidebarVariant) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isDark: boolean;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_LAYOUT_KEY = 'ecomcx_admin_layout_position';
const LOCAL_STORAGE_THEME_MODE_KEY = 'ecomcx_admin_theme_mode';
const LOCAL_STORAGE_SIDEBAR_VARIANT_KEY = 'ecomcx_admin_sidebar_variant';
const LOCAL_STORAGE_ACCENT_KEY = 'ecomcx_admin_accent_color';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutPosition, setLayoutPositionState] = useState<LayoutPosition>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);
    return saved === 'horizontal' || saved === 'vertical' ? saved : 'vertical';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_MODE_KEY);
    return saved === 'dark' || saved === 'system' ? saved : 'light';
  });

  const [sidebarVariant, setSidebarVariantState] = useState<SidebarVariant>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_VARIANT_KEY);
    return saved === 'dark' || saved === 'brand' ? saved : 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACCENT_KEY);
    return saved === 'indigo' || saved === 'emerald' || saved === 'violet' ? saved : 'blue';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Synchronize Dark Mode Class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    let effectiveDark = false;

    if (themeMode === 'dark') {
      effectiveDark = true;
    } else if (themeMode === 'system') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      effectiveDark = false;
    }

    setIsDark(effectiveDark);

    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const setLayoutPosition = (position: LayoutPosition) => {
    setLayoutPositionState(position);
    localStorage.setItem(LOCAL_STORAGE_LAYOUT_KEY, position);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(LOCAL_STORAGE_THEME_MODE_KEY, mode);
  };

  const setSidebarVariant = (variant: SidebarVariant) => {
    setSidebarVariantState(variant);
    localStorage.setItem(LOCAL_STORAGE_SIDEBAR_VARIANT_KEY, variant);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem(LOCAL_STORAGE_ACCENT_KEY, color);
  };

  const resetTheme = () => {
    setLayoutPosition('vertical');
    setThemeMode('light');
    setSidebarVariant('light');
    setAccentColor('blue');
  };

  return (
    <ThemeContext.Provider
      value={{
        layoutPosition,
        setLayoutPosition,
        themeMode,
        setThemeMode,
        sidebarVariant,
        setSidebarVariant,
        accentColor,
        setAccentColor,
        isDark,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
