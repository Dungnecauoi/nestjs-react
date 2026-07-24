import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { ThemeProvider } from './context/ThemeContext';
import { AntdThemeProvider } from './context/AntdThemeProvider';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AntdThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AntdThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
