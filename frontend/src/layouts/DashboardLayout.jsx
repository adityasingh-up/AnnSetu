import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ChatbotWidget } from '../components/ChatbotWidget';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0b0f17]">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
};
