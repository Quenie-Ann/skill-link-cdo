import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, ClipboardList, BrainCircuit, 
  BarChart3, Zap, ChevronLeft, ChevronRight, UserCircle,
} from 'lucide-react';

export default function Sidebar({ currentUser, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const userRole  = currentUser?.role;
  const userName  = currentUser?.full_name || 'User';

  const handleLogout = () => onLogout();

  const menuItems = {
    admin: [
      { path: '/admin/dashboard',  label: 'Dashboard',         icon: BarChart3    },
      { path: '/admin/users',      label: 'User Verification', icon: Users        },
      { path: '/admin/requests',   label: 'All Requests',      icon: ClipboardList },
    ],
    worker: [
      { path: '/worker/dashboard', label: 'Job Matches', icon: Zap          },
      { path: '/worker/history',   label: 'My Jobs',     icon: ClipboardList },
      { path: '/worker/profile',   label: 'My Profile',   icon: BrainCircuit  },
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

  return (
    <aside
      className={`
      sticky top-0 left-0 
      flex flex-col 
      ${isCollapsed ? 'w-20' : 'w-64'} 
      bg-skill-dark text-white 
      h-screen 
      transition-all duration-300 
      z-40 
      shadow-2xl 
      overflow-visible
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-4 top-12 z-50 
          bg-skill-primary text-white
          rounded-full p-1.5 
          border-2 border-skill-dark 
          hover:scale-125 transition-all
          shadow-lg
          flex items-center justify-center
        "
      >
        {isCollapsed
          ? <ChevronRight size={18} strokeWidth={3} />
          : <ChevronLeft  size={18} strokeWidth={3} />}
      </button>

      {/* Profile */}
      <div className={`flex items-center p-4 mt-6 mb-2 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
             {/* If you have a real image URL, use it here, else fallback to icon */}
             <UserCircle size={32} className="text-skill-primary" />
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold truncate text-white">{userName}</h2>
            <p className="text-[10px] uppercase tracking-tighter text-skill-primary font-bold">
              {roleLabels[userRole]}
            </p>
          </div>
        )}
      </div>

      <div className="mx-4 border-t border-white/5 my-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto no-scrollbar">
        <ul className="space-y-2">
          {menuItems[userRole]?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`
                    flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-skill-primary text-white shadow-lg shadow-skill-primary/20'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'}
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon
                    size={22}
                    className={isActive ? 'text-white' : 'group-hover:text-skill-primary'}
                  />
                  {!isCollapsed && (
                    <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 bg-black/10">
        <button 
          onClick={handleLogout}
          className={`
            flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}
            w-full px-4 py-3 text-white
            bg-red-500 hover:bg-red-600 rounded-xl
            transition-all shadow-sm
          `}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}