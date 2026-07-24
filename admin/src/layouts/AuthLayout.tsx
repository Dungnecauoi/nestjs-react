import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(9,9,11,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Centered Main Form Outlet */}
      <main style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#71717a', position: 'relative', zIndex: 10 }}>
        &copy; {new Date().getFullYear()} ECOMCX Enterprise ERP
      </footer>
    </div>
  );
};

export default AuthLayout;
