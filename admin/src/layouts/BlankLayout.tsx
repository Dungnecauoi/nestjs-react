import React from 'react';
import { Outlet } from 'react-router-dom';

export const BlankLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default BlankLayout;
