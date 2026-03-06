import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { api } from '../../services/api';

/**
 * NotificationBell
 * Drop-in component for any page header.
 * Usage: <NotificationBell />
 *
 * Data source: api.getNotifications() → mockData.INITIAL_NOTIFICATIONS
 * Phase 2: hits GET /notifications on the real backend
 */
export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications on mount
  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2.5 rounded-xl border transition-all ${
          open
            ? 'bg-skill-primary/10 border-skill-primary text-skill-primary'
            : 'bg-skill-light dark:bg-dark-bg border-skill-primary/10 hover:border-skill-primary text-skill-dark dark:text-skill-primary'
        }`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[1.1rem] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-skill-primary/10 dark:border-white/5 overflow-hidden z-50">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div>
              <h3 className="font-black text-skill-dark dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-skill-primary font-bold">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10px] font-bold text-skill-primary hover:text-emerald-600 transition-colors"
              >
                <Check size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-xs text-gray-400 font-medium">All caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3.5 group transition-colors cursor-pointer ${
                      !notif.read
                        ? 'bg-skill-light/60 dark:bg-skill-primary/5 hover:bg-skill-light dark:hover:bg-skill-primary/10'
                        : 'hover:bg-gray-50/50 dark:hover:bg-dark-bg/40'
                    }`}
                    onClick={() => markRead(notif.id)}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-xl ${notif.iconBg}`}>
                      <Icon size={14} className={notif.iconColor} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-black text-skill-dark dark:text-white truncate">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-skill-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-gray-300 dark:text-gray-600 font-bold mt-1">
                        {notif.time}
                      </p>
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-dark-bg rounded-lg transition-all"
                    >
                      <X size={11} className="text-gray-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5">
            <button className="w-full text-center text-xs font-bold text-skill-primary hover:text-emerald-600 transition-colors">
              View all notifications
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
