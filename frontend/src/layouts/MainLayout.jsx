import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ChatbotWidget } from '../components/ChatbotWidget';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0b0f17]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  );
};
