import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
  fullScreen?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, fullScreen = false }) => {
  const { isAuthenticated } = useAuthStore();
  const [viewportHeight, setViewportHeight] = useState('100vh');
  
  // Устанавливаем корректную высоту для мобильных устройств
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);
  
  return (
    <div 
      className={`flex bg-gray-50 overflow-hidden`}
      style={{ height: viewportHeight }}
    >
      {isAuthenticated && !fullScreen && <Sidebar />}
      
      <main 
        className={`
          flex-1 overflow-auto relative
          ${isAuthenticated && !fullScreen ? 'md:ml-64 pb-24 md:pb-0' : ''}
          ${fullScreen ? 'pb-0' : ''}
        `}
        style={{
          height: viewportHeight,
          maxWidth: '100vw',
        }}
      >
        <div className={`${fullScreen ? 'h-full' : ''}`}>
          {children}
        </div>
      </main>
      
      {isAuthenticated && !fullScreen && <MobileNavbar />}
    </div>
  );
};