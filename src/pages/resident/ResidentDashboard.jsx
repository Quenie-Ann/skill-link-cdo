import React, { useState } from 'react';
import { 
  Plus, History, Search, MapPin, 
  ShieldCheck, Sun, Moon, ArrowUpRight, 
  Wrench, Zap, Hammer, Paintbrush, 
  ChevronRight, Clock
} from 'lucide-react';

export default function ResidentDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Service categories with specific branding
  const services = [
    { name: "Plumbing", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "Electrical", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { name: "Carpentry", icon: Hammer, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { name: "Cleaning", icon: Paintbrush, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">
      
      {/* --- THE PREMIUM TOP BAR (Consistent with Admin/Worker) --- */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Resident Portal</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Community Services</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search Input for finding workers/services */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input 
                type="text" 
                placeholder="Search for services..." 
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-72 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
              />
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all shadow-inner"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-8">
          
          {/* 1. HERO SECTION (Call to Action) */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-4xl p-10 text-white relative overflow-hidden shadow-xl shadow-skill-dark/30">
            <div className="relative z-10 lg:w-3/5">
              <h2 className="text-3xl font-extrabold mb-3">How can we help you today?</h2>
              <p className="text-skill-light/60 mb-8 text-sm leading-relaxed">
                Connect with barangay-verified workers for all your household needs. Reliable service is just a click away.
              </p>
              <button className="flex items-center gap-3 bg-skill-primary hover:bg-white hover:text-skill-dark text-white px-8 py-4 rounded-2xl font-bold transition-all group shadow-lg">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Book a New Service
              </button>
            </div>
            
            {/* Visual Decorative Element */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-sm hidden lg:flex items-center justify-center">
               <ShieldCheck size={140} className="text-skill-primary opacity-20" />
            </div>
          </div>

          {/* 2. SECURITY CARD (Bento Style) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <ShieldCheck className="text-blue-600 dark:text-blue-400" size={26} />
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold uppercase tracking-tighter">Verified</span>
              </div>
              <h3 className="font-bold text-skill-dark dark:text-white text-lg leading-tight">Vetted Community Workers</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Every worker in Skill-Link CDO undergoes strict background checking by Barangay Administration.
              </p>
            </div>
            <button className="mt-6 text-sm font-bold text-skill-primary flex items-center gap-1 hover:gap-2 transition-all">
              Security Policy <ChevronRight size={14} />
            </button>
          </div>

          {/* 3. QUICK SERVICE TILES (Interactive Grid) */}
          <div className="col-span-12 lg:col-span-8">
            <h3 className="font-bold text-skill-dark dark:text-white text-xl mb-6">Popular Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {services.map((service) => (
                <button 
                  key={service.name} 
                  className="p-8 bg-white dark:bg-dark-card hover:bg-skill-light dark:hover:bg-dark-bg transition-all rounded-4xl shadow-sm border border-skill-primary/5 group text-center flex flex-col items-center justify-center"
                >
                  <div className={`p-5 rounded-3xl mb-4 transition-transform group-hover:scale-110 ${service.bg}`}>
                    <service.icon className={service.color} size={32} />
                  </div>
                  <span className="font-bold text-skill-dark dark:text-white text-sm tracking-tight">
                    {service.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. TRACKING LOGS (Activity Panel) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-bold text-skill-dark dark:text-white text-lg">My Requests</h3>
              <Clock size={18} className="text-gray-300" />
            </div>
            
            <div className="space-y-4">
              <TrackingItem 
                title="Electrical Repair" 
                status="Pending Admin" 
                statusColor="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                date="Today, 2:30 PM" 
              />
              <TrackingItem 
                title="Kitchen Plumbing" 
                status="Matched" 
                statusColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                date="Feb 24, 2026" 
              />
            </div>
            
            <button className="w-full mt-6 py-4 rounded-2xl bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-white text-xs font-bold transition-all hover:bg-skill-primary hover:text-white border border-skill-primary/10">
              View All History
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

// Reusable Tracking Component for consistency
function TrackingItem({ title, status, statusColor, date }) {
  return (
    <div className="p-4 bg-skill-light/30 dark:bg-dark-bg/40 rounded-2xl border border-skill-primary/5 hover:border-skill-primary/30 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-bold text-skill-dark dark:text-white group-hover:text-skill-primary transition-colors">{title}</p>
        <p className="text-[10px] text-gray-400 font-medium">{date}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${statusColor}`}>
          {status}
        </span>
        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-skill-primary" />
      </div>
    </div>
  );
}