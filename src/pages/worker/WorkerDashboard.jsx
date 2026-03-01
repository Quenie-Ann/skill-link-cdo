import React, { useState, useEffect } from 'react';
import { 
  Zap, CheckCircle, Clock, Star, 
  Search, Sun, Moon, ArrowUpRight, 
  MapPin, Briefcase, ChevronRight 
} from 'lucide-react';

export default function WorkerDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState({ rating: 4.8, jobsDone: 12, earnings: 2500 });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">
      
      {/* --- PREMIUM TOP BAR --- */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Worker Portal</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Job Management</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all text-sm shadow-sm ${
                isOnline 
                ? 'bg-skill-primary text-white ring-4 ring-skill-primary/20' 
                : 'bg-gray-100 dark:bg-dark-bg text-gray-500'
              }`}
            >
              <Zap size={16} className={isOnline ? 'animate-pulse' : ''} />
              {isOnline ? 'Online' : 'Go Online'}
            </button>

            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-8">
          
          {/* 1. HERO CARD (Reputation & Level) */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-4xl p-8 text-white relative overflow-hidden shadow-xl shadow-skill-dark/30">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                   <CheckCircle className="text-skill-primary" size={24} />
                </div>
                <span className="text-[10px] bg-skill-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">Verified Pro</span>
              </div>
              
              <p className="text-skill-light/60 text-sm mb-1">Your Reputation</p>
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-2">
                {stats.rating} <Star className="text-yellow-400 fill-yellow-400" size={28} />
              </h2>
              
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] text-skill-light/40 uppercase tracking-widest mb-1">Completed Jobs</p>
                  <p className="text-xl font-semibold">{stats.jobsDone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-skill-light/40 uppercase tracking-widest mb-1">Service Tier</p>
                  <p className="text-xl font-semibold">Gold</p>
                </div>
              </div>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-skill-primary/10 rounded-full blur-2xl"></div>
          </div>

          {/* 2. EARNINGS CARD (Bento Style) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <ArrowUpRight className="text-emerald-600 dark:text-emerald-400" size={26} />
              </div>
              <button className="text-gray-300 hover:text-skill-dark"><MoreHorizontal className="rotate-90" size={20}/></button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-tight">Est. Earnings</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-4xl font-black text-skill-dark dark:text-white">₱{stats.earnings}</h3>
              <span className="text-emerald-500 text-xs font-bold">+15% this month</span>
            </div>
          </div>

          {/* 3. RECENT JOB LOGS (Right Column) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5 row-span-2">
            <h3 className="font-bold text-skill-dark dark:text-white text-lg mb-6 px-2">Job History</h3>
            <div className="space-y-1">
              <ActivityItem 
                icon={<Briefcase size={18}/>} 
                color="bg-blue-50 text-blue-600 dark:bg-blue-900/20" 
                title="Plumbing Repair" 
                subtitle="Brgy. 12, Carmen" 
                time="Today" 
              />
              <ActivityItem 
                icon={<Clock size={18}/>} 
                color="bg-purple-50 text-purple-600 dark:bg-purple-900/20" 
                title="Electrical Check" 
                subtitle="Brgy. 40, Nazareth" 
                time="Yesterday" 
              />
            </div>
            {!isOnline && (
               <div className="mt-8 p-4 bg-skill-light/50 dark:bg-dark-bg/50 rounded-2xl border border-dashed border-skill-primary/20 text-center">
                  <p className="text-xs text-skill-dark/60 dark:text-white/40 italic">You are currently offline. New job requests won't appear here.</p>
               </div>
            )}
          </div>

          {/* 4. PERFORMANCE GRAPH (Weekly Jobs Style) */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-dark-card rounded-5xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white text-xl">Job Volume</h3>
                <p className="text-xs text-gray-400">Your activity for the past 7 days</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-skill-primary hover:underline">
                View Reports <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4">
              {[30, 50, 20, 85, 40, 60, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-skill-light dark:bg-dark-bg rounded-t-xl relative group" style={{height: '100%'}}>
                  <div 
                    className="absolute bottom-0 w-full bg-skill-primary rounded-t-xl transition-all group-hover:bg-skill-dark shadow-lg shadow-skill-primary/10" 
                    style={{height: `${h}%`}}
                  ></div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase">
                    {['S','M','T','W','T','F','S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Reusable Activity Component for the Logs
function ActivityItem({ icon, color, title, subtitle, time }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-skill-light dark:hover:bg-dark-bg rounded-2xl transition-all cursor-pointer group">
      <div className={`p-3 rounded-2xl ${color} transition-transform group-hover:scale-110`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-skill-dark dark:text-white">{title}</p>
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <MapPin size={10} /> {subtitle}
        </p>
      </div>
      <p className="text-[10px] text-gray-300 font-bold">{time}</p>
    </div>
  );
}

function MoreHorizontal({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}