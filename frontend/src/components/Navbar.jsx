import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ProfileModal } from './ProfileModal';
import { NotificationBell } from './NotificationBell';
import { HeartHandshake, Sun, Moon, LogOut, User as UserIcon, Camera } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor': return '/donor/dashboard';
      case 'volunteer': return '/volunteer/dashboard';
      case 'ngo': return '/ngo/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-[#0b0f17]/80 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-400 bg-clip-text text-transparent">
                AnnSetu
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to={getDashboardLink()}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
                  >
                    <span>Dashboard</span>
                    <span className="text-xs uppercase bg-emerald-800/60 px-2 py-0.5 rounded text-emerald-200">
                      {user.role}
                    </span>
                  </Link>

                  {/* Notification Bell */}
                  <NotificationBell />

                  <div className="flex items-center space-x-2 pl-2 border-l border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="relative group focus:outline-none"
                      title="Edit Profile & Avatar"
                    >
                      <img
                        src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow group-hover:scale-110 transition-transform">
                        <Camera className="w-2.5 h-2.5" />
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-500 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
