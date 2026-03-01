import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';     // ← replaces supabase
import { 
  Users, ClipboardList, AlertCircle, Search, 
  Sun, Moon, ArrowUpRight, CheckCircle2, MoreHorizontal 
} from 'lucide-react';

export default function AdminDashboard() {
  const [counts, setCounts]       = useState({ workers: 0, pending: 0, requests: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError]         = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setCounts(data);
      } catch (err) {
        console.error('Failed to load stats:', err.message);
        setError('Could not connect to local server. Is it running?');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">
      
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Admin Dashboard</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Barangay Overview</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-72 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
              />
            </div>
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all shadow-inner"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* Connection error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          
          {/* Hero Card */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-4xl p-8 text-white relative overflow-hidden shadow-xl shadow-skill-dark/30">
            <div className="relative z-10">
              <p className="text-skill-light/60 text-sm mb-1 uppercase tracking-widest font-semibold">Total Workforce</p>
              <h2 className="text-4xl font-bold mb-8">
                {counts.workers} <span className="text-lg font-normal opacity-70 text-skill-primary">Workers</span>
              </h2>
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] text-skill-light/40 uppercase tracking-widest mb-1">Verified Users</p>
                  <p className="text-xl font-semibold">{counts.workers - counts.pending}</p>
                </div>
                <ArrowUpRight className="text-skill-primary" size={24} />
              </div>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                <AlertCircle className="text-amber-600 dark:text-amber-400" size={26} />
              </div>
              <MoreHorizontal className="text-gray-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase">Pending Verification</p>
            <h3 className="text-4xl font-black text-skill-dark dark:text-white mt-1">{counts.pending}</h3>
          </div>

          {/* Service Requests Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <ClipboardList className="text-emerald-600 dark:text-emerald-400" size={26} />
              </div>
              <MoreHorizontal className="text-gray-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase">Total Requests</p>
            <h3 className="text-4xl font-black text-skill-dark dark:text-white mt-1">{counts.requests}</h3>
          </div>

          {/* Activity Logs */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5 row-span-2">
            <h3 className="font-bold text-skill-dark dark:text-white text-lg mb-6 px-2">Live Logs</h3>
            <div className="space-y-1">
              <ActivityItem icon={<Users size={18}/>} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" title="New Signup" subtitle="Worker Registration" time="Just now" />
              <ActivityItem icon={<CheckCircle2 size={18}/>} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20" title="System" subtitle="MySQL connected" time="On startup" />
            </div>
          </div>

          {/* Chart Section */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-dark-card rounded-5xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <h3 className="font-bold text-skill-dark dark:text-white text-xl mb-2">Service Statistics</h3>
            <p className="text-xs text-gray-400 mb-8">Weekly volume analytics</p>
            <div className="h-64 flex items-end justify-between gap-4">
              {[60, 40, 70, 90, 50, 30, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-skill-light dark:bg-dark-bg rounded-t-xl relative overflow-hidden" style={{height: '100%'}}>
                  <div className="absolute bottom-0 w-full bg-skill-primary" style={{height: `${h}%`}}></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}


function ActivityItem({ icon, color, title, subtitle, time }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-skill-light dark:hover:bg-dark-bg rounded-2xl transition-colors cursor-pointer group">
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-skill-dark dark:text-white">{title}</p>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
      <p className="text-[10px] text-gray-300 italic">{time}</p>
    </div>
  );
}