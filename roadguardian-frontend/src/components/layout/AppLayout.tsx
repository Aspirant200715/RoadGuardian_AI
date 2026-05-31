import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="relative h-screen flex flex-col bg-gradient-to-r from-orange-500/10 via-white dark:via-background to-green-600/10 animate-gradient-x transition-colors overflow-hidden">
      <Navbar />
      <div className="flex-1 flex relative z-10 w-full max-w-full overflow-hidden">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 h-full min-w-0 overflow-y-auto overflow-x-hidden">
          <div className={isLanding ? "w-full" : "container mx-auto p-4 md:p-8 mt-2"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
