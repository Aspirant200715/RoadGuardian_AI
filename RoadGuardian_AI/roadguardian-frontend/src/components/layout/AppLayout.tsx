import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-r from-orange-500/10 via-white dark:via-background to-green-600/10 animate-gradient-x transition-colors">
      <Navbar />
      <div className="flex-1 flex relative z-10">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto p-4 md:p-8 mt-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
