import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  BrainCircuit, 
  BarChart3 
} from 'lucide-react'; // Professional icons
import { supabase } from '../../services/supabase';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workers', label: 'Workers', icon: Users },
    { path: '/requests', label: 'Service Requests', icon: ClipboardList },
    { path: '/predictions', label: 'ML Predictions', icon: BrainCircuit },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="flex flex-col w-64 bg-skill-dark text-white min-h-screen p-6 shadow-xl">
      {/* Brand Section */}
      <div className="mb-10 px-4">
        <h1 className="text-2xl font-bold tracking-tight">Skill-Link CDO</h1>
        <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-skill-primary rounded-full animate-pulse"></span>
            <p className="text-xs text-green-200 uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((Item) => (
            <li key={Item.path}>
              <Link
                to={Item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${location.pathname === Item.path 
                    ? 'bg-skill-primary text-white shadow-md' 
                    : 'text-green-100 hover:bg-white/10 hover:translate-x-1'}`}
              >
                <Item.icon size={20} className={location.pathname === Item.path ? 'text-white' : 'text-green-300 group-hover:text-white'} />
                <span className="font-medium">{Item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button Pinned to Bottom */}
      <div className="pt-6 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}