import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import { Bell, BellRing, CheckCheck, Trash2, X, Info, Package, Truck, AlertTriangle, User, Star } from 'lucide-react';

// Notification type ke hisaab se icon aur color
const getNotificationStyle = (type) => {
  switch (type) {
    case 'DONATION_NEW':
      return { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    case 'DONATION_ACCEPTED':
      return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    case 'PICKUP_OTP':
      return { icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    case 'DELIVERED':
      return { icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    case 'EXPIRY_ALERT':
      return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
    case 'PROFILE_UPDATED':
      return { icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' };
    default:
      return { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' };
  }
};

// Time format karo — "2 min ago", "1 hr ago" etc.
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Abhi';
  if (mins < 60) return `${mins} min pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ghante pehle`;
  const days = Math.floor(hrs / 24);
  return `${days} din pehle`;
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Notifications fetch karo
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Silent fail — bell icon still visible
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Bahar click karne par dropdown band karo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchNotifications();
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
        title="Notifications"
        id="notification-bell-btn"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-emerald-500 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn"
          id="notification-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center space-x-1 transition-colors"
                  title="Saari notifications read mark karo"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-xs">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                <Bell className="w-10 h-10 opacity-20" />
                <p className="text-xs font-medium">Koi notification nahi hai abhi</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((n) => {
                  const style = getNotificationStyle(n.type);
                  const IconComp = style.icon;
                  return (
                    <li
                      key={n._id}
                      className={`flex items-start space-x-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                        !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl border ${style.bg} flex items-center justify-center`}>
                        <IconComp className={`w-4 h-4 ${style.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${n.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-center space-y-1 shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Read mark karo"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(n._id, e)}
                          className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete karo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[10px] text-gray-400">Last 50 notifications shown</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
