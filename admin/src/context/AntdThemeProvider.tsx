import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { useTheme as useAppTheme } from './ThemeContext';

export type PrimaryColorPreset = {
  name: string;
  hex: string;
};

export const COLOR_PRESETS: PrimaryColorPreset[] = [
  { name: 'Obsidian Black', hex: '#09090b' },
  { name: 'Enterprise Indigo', hex: '#4f46e5' },
  { name: 'Vercel Blue', hex: '#1677ff' },
  { name: 'Emerald Tech', hex: '#059669' },
  { name: 'Royal Violet', hex: '#7c3aed' },
  { name: 'Rose Red', hex: '#e11d48' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Amber Gold', hex: '#d97706' },
];

export const RADIUS_PRESETS = [
  { name: 'Sharp (0px)', value: 0 },
  { name: 'Soft (6px)', value: 6 },
  { name: 'Curved (12px)', value: 12 },
  { name: 'Pill (16px)', value: 16 },
];

interface AntdThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  borderRadius: number;
  setBorderRadius: (radius: number) => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
  wireframe: boolean;
  setWireframe: (wireframe: boolean) => void;
}

const AntdThemeContext = createContext<AntdThemeContextType>({
  primaryColor: '#09090b',
  setPrimaryColor: () => {},
  borderRadius: 6,
  setBorderRadius: () => {},
  isCompact: false,
  setIsCompact: () => {},
  wireframe: false,
  setWireframe: () => {},
});

export const useAntdTheme = () => useContext(AntdThemeContext);

export const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useAppTheme();
  const { i18n } = useTranslation();

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return localStorage.getItem('antd_primary_color') || '#09090b';
  });

  const [borderRadius, setBorderRadius] = useState<number>(() => {
    const saved = localStorage.getItem('antd_border_radius');
    return saved ? Number(saved) : 6;
  });

  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return localStorage.getItem('antd_compact') === 'true';
  });

  const [wireframe, setWireframe] = useState<boolean>(() => {
    return localStorage.getItem('antd_wireframe') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('antd_primary_color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('antd_border_radius', String(borderRadius));
  }, [borderRadius]);

  useEffect(() => {
    localStorage.setItem('antd_compact', String(isCompact));
  }, [isCompact]);

  useEffect(() => {
    localStorage.setItem('antd_wireframe', String(wireframe));
  }, [wireframe]);

  // Algorithms
  const algorithms = [
    isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  ];
  if (isCompact) {
    algorithms.push(antdTheme.compactAlgorithm);
  }

  const locale = i18n.language === 'en' ? enUS : viVN;

  return (
    <AntdThemeContext.Provider
      value={{
        primaryColor,
        setPrimaryColor,
        borderRadius,
        setBorderRadius,
        isCompact,
        setIsCompact,
        wireframe,
        setWireframe,
      }}
    >
      <ConfigProvider
        locale={locale}
        theme={{
          algorithm: algorithms,
          token: {
            colorPrimary: primaryColor,
            borderRadius: borderRadius,
            wireframe: wireframe,
            fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            fontFamilyCode: "'JetBrains Mono', monospace",
            colorBgContainer: isDark ? '#121215' : '#ffffff',
            colorBgLayout: isDark ? '#09090b' : '#f8fafc',
            colorBorder: isDark ? '#27272a' : '#e2e8f0',
            colorText: isDark ? '#fafafa' : '#0f172a',
            colorTextHeading: isDark ? '#ffffff' : '#020617',
          },
          components: {
            Table: {
              headerBg: isDark ? '#09090b' : '#f8fafc',
              headerColor: isDark ? '#f4f4f5' : '#0f172a',
              rowHoverBg: isDark ? '#18181b' : '#f1f5f9',
              borderRadius: borderRadius,
            },
            Button: {
              borderRadius: borderRadius,
              fontWeight: 600,
            },
            Card: {
              borderRadiusLG: borderRadius,
            },
            Select: {
              borderRadius: borderRadius,
            },
            Modal: {
              borderRadiusLG: borderRadius,
            },
          },
        }}
      >
        <AntdApp>
          <AntdAppBridge />
          {children}
        </AntdApp>
      </ConfigProvider>
    </AntdThemeContext.Provider>
  );
};

import { setGlobalMessageInstance } from '../utils/notify';

const AntdAppBridge: React.FC = () => {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setGlobalMessageInstance(message);
  }, [message]);
  return null;
};
