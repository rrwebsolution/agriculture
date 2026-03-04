import React, { useState, useEffect } from 'react';
import Header from './layouts/Header';
import Footer from './layouts/Footer'; 
import { Outlet } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import RealtimeListener from '../../components/RealtimeListener'

export type Theme = 'light' | 'dark' | 'system';

const AgricultureLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('agri-system-theme') as Theme;
    return saved || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('agri-system-theme', theme);
    const applyTheme = (t: Theme) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme(theme);
  }, [theme]);

  

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <RealtimeListener />
      {/* SIDEBAR: Kini fixed na daan sa left */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* HEADER: Mo-adjust ang 'left' property base sa Sidebar width */}
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          isSidebarOpen={isSidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed} 
        />

        {/* 
            MAIN CONTENT AREA:
            - mt-16: Padding para sa fixed header.
            - lg:ml: Mao ni ang nagduso sa content (apil ang Footer) para dili matabunan sa sidebar.
        */}
        <main 
          className={`flex-1 overflow-y-auto mt-16 transition-all duration-300
            ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
        >
          {/* 
              Kini nga div nagsiguro nga ang content ug footer 
              magtapik sa usa ka column (flex-col).
          */}
          <div className="min-h-[calc(100vh-64px)] flex flex-col">
            
            {/* CONTENT AREA: Outlet dinhi ang imong dashboard pages */}
            <div className="flex-1 p-4 lg:p-8">
              <div className="mx-auto">
                <Outlet />
              </div>
            </div>
            
            {/* 
                FOOTER: Gibutang sa sulod sa scrollable main area.
                Karon, ang label ug ang tractor icon dili na sampungan 
                kay nagsunod na sila sa margin sa sidebar.
            */}
            <Footer />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AgricultureLayout;