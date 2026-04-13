import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogOut, Users, ClipboardList, BrainCircuit,
  BarChart3, Zap, ChevronLeft, ChevronRight, UserCircle,
  Leaf, UserPlus,
} from 'lucide-react';

export default function Sidebar({ currentUser, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const userRole  = currentUser?.role;
  const userName  = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || '';

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard',         icon: BarChart3     },
      { path: '/admin/users',     label: 'User Verification', icon: Users         },
      { path: '/admin/register',  label: 'Register User',     icon: UserPlus      },
      { path: '/admin/requests',  label: 'All Requests',      icon: ClipboardList },
    ],
    worker: [
      { path: '/worker/dashboard', label: 'Job Matches', icon: Zap          },
      { path: '/worker/history',   label: 'My Jobs',     icon: ClipboardList },
      { path: '/worker/profile',   label: 'My Profile',  icon: BrainCircuit  },
    ],
    resident: [
      { path: '/resident/dashboard', label: 'My Requests',  icon: ClipboardList },
      { path: '/resident/directory', label: 'Find Workers', icon: Users         },
    ],
  };

  const roleLabels = {
    admin:    'Barangay Admin',
    worker:   'Skilled Worker',
    resident: 'Resident',
  };

  const roleAccent = {
    admin:    'bg-skill-primary',
    worker:   'bg-emerald-400',
    resident: 'bg-teal-400',
  };

  const roleTextColor = {
    admin:    'text-skill-primary',
    worker:   'text-emerald-400',
    resident: 'text-teal-400',
  };

  return (
    <aside
      className={`
        sticky top-0 left-0 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-skill-dark text-white h-screen
        transition-all duration-300 z-40
        shadow-2xl overflow-visible flex-shrink-0
      `}
    >
      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-3.5 top-14 z-50
          bg-skill-primary text-white rounded-full p-1.5
          border-2 border-skill-dark hover:scale-110
          transition-all shadow-lg flex items-center justify-center
        "
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed
          ? <ChevronRight size={14} strokeWidth={3} />
          : <ChevronLeft  size={14} strokeWidth={3} />
        }
      </button>

      {/* ── Brand Logo ── */}
      <div className={`flex items-center px-4 pt-6 pb-5 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-skill-primary/20 rounded-xl flex items-center justify-center">
          <Leaf size={18} className="text-skill-primary" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-black text-white leading-tight tracking-tight">
              Skill<span className="text-skill-primary">-Link</span>
            </p>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">CDO</p>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-white/5 mb-3" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] px-3 mb-2">
            Navigation
          </p>
        )}
        <ul className="space-y-1">
          {menuItems[userRole]?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    relative flex items-center gap-3.5 px-3 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-skill-primary/20 text-white'
                      : 'hover:bg-white/5 text-white/50 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  {/* Active pill */}
                  {isActive && (
                    <span className={`
                      absolute left-0 top-1/2 -translate-y-1/2
                      w-1 h-5 rounded-r-full
                      ${roleAccent[userRole] || 'bg-skill-primary'}
                    `} />
                  )}

                  <item.icon
                    size={20}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-skill-primary' : 'group-hover:text-skill-primary'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className={`text-sm font-semibold whitespace-nowrap ${
                      isActive ? 'text-white font-bold' : ''
                    }`}>
                      {item.label}
                    </span>
                  )}

                  {/* Active dot in collapsed state */}
                  {isActive && isCollapsed && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-skill-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom: user info + separator + logout ── */}
      <div className="px-3 pb-5">

        {/* User info row */}
        <div className={`
          flex items-center gap-3 mb-3 px-3 py-3
          rounded-xl bg-white/5 border border-white/5
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-skill-primary/20 border border-white/10 flex items-center justify-center">
              <UserCircle size={22} className="text-skill-primary" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-skill-dark" />
          </div>

          {/* Name + role — hidden when collapsed */}
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {userName}
              </p>
              <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${
                roleTextColor[userRole] ?? 'text-skill-primary'
              }`}>
                {roleLabels[userRole]}
              </p>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-white/5 mb-3" />

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center
            ${isCollapsed ? 'justify-center px-3' : 'gap-3.5 px-4'}
            py-3 rounded-lg
            bg-white/5 hover:bg-red-500/20
            text-white/50 hover:text-red-400
            border border-transparent hover:border-red-500/20
            transition-all group
          `}
        >
          <LogOut
            size={18}
            className="flex-shrink-0 transition-colors group-hover:text-red-400"
          />
          {!isCollapsed && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </button>
      </div>
    </aside>
  );
}