import React, { useState, useEffect } from 'react';
import Header from './layouts/Header';
import Footer from './layouts/Footer'; 
import { Outlet } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import { getSystemBackgroundImage, SYSTEM_BACKGROUND_UPDATED_EVENT } from '../../lib/appearance';
// import AiChatWidget from './AiChatWidget';


export type Theme = 'light' | 'dark' | 'system';

const AgricultureLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(() => getSystemBackgroundImage());

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('agri-system-theme') as Theme;
    return saved || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    localStorage.setItem('agri-system-theme', theme);

    const applyTheme = (t: Theme) => {
      if (t === 'dark' || (t === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleSystemThemeChange = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    const syncBackground = () => setBackgroundImage(getSystemBackgroundImage());

    window.addEventListener(SYSTEM_BACKGROUND_UPDATED_EVENT, syncBackground);
    window.addEventListener('storage', syncBackground);

    return () => {
      window.removeEventListener(SYSTEM_BACKGROUND_UPDATED_EVENT, syncBackground);
      window.removeEventListener('storage', syncBackground);
    };
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          isSidebarOpen={isSidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed} 
        />

        <main 
          className={`agriculture-system-bg flex-1 overflow-y-auto mt-16 transition-all duration-300
            ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
          style={{ '--agri-system-bg-image': `url("${backgroundImage}")` } as React.CSSProperties}
        >
          <div className="min-h-[calc(100vh-64px)] flex flex-col">
            
            <div className="flex-1 p-4 lg:p-8">
              <div className="mx-auto">
                <Outlet />
              </div>
            </div>
            
            <Footer />
          </div>
        </main>

      </div>

      {/* 2. IBUTANG ANG AI WIDGET DINHI (Sa gawas sa main aron kanunay siya mag-float) */}
      {/* <AiChatWidget /> */}

    </div>
  );
};

export default AgricultureLayout;
