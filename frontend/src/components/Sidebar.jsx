import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { LayoutDashboard, Utensils, MapPin, Building2, ShieldCheck, FileText, Camera, Award, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const role = user?.role || 'donor';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (role) {
      case 'donor':
        return [
          { name: 'Overview', path: '/donor/dashboard', icon: LayoutDashboard },
          { name: 'My Donations', path: '/donor/dashboard#history', icon: Utensils },
        ];
      case 'volunteer':
        return [
          { name: 'Radar Map', path: '/volunteer/dashboard', icon: MapPin },
          { name: 'My Missions', path: '/volunteer/dashboard#missions', icon: Award },
        ];
      case 'ngo':
        return [
          { name: 'Rescue Inventory', path: '/ngo/dashboard', icon: Building2 },
          { name: 'Distribution Log', path: '/ngo/dashboard#beneficiaries', icon: Utensils },
        ];
      case 'admin':
        return [
          { name: 'System Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin/dashboard#users', icon: ShieldCheck },
          { name: 'Audit Reports', path: '/admin/dashboard#reports', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      <aside className="w-64 bg-white dark:bg-[#131b2e] border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
        
        {/* User Profile Card after login */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative group shrink-0">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user?.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow hover:scale-110 transition-transform"
                title="Edit Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block">
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full py-1.5 px-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700 text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Profile Photo</span>
          </button>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button - Sidebar Bottom */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
