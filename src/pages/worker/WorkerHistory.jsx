import React, { useState, useEffect } from 'react';
import {
  Briefcase, MapPin, Calendar, ChevronRight,
  Sun, Moon, CheckCircle2, TrendingUp, Filter, Search, Star
} from 'lucide-react';
import { api } from '../../services/api';
import { STATUS_CONFIG } from '../../data/mockData';

export default function WorkerHistory() {
  const [isDarkMode, setIsDarkMode]     = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getJobHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const filtered = history.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.resident.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalEarned    = history.filter((j) => j.status === 'completed').reduce((a, j) => a + j.pay, 0);
  const completedCount = history.filter((j) => j.status === 'completed').length;
  const avgRating      = (
    history.filter((j) => j.rating).reduce((a, j) => a + j.rating, 0) /
    history.filter((j) => j.rating).length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">My Jobs</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Job History</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
              />
            </div>
            {/* Status Filter */}
            <div className="relative hidden md:flex items-center gap-2">
              <Filter size={16} className="text-skill-primary/60" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm focus:ring-2 focus:ring-skill-primary outline-none dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total Earned */}
          <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-4xl p-6 text-white shadow-xl shadow-skill-dark/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <TrendingUp size={20} className="text-skill-primary" />
              </div>
              <span className="text-[10px] bg-skill-primary/20 text-skill-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">Total</span>
            </div>
            <p className="text-skill-light/60 text-xs uppercase tracking-widest mb-1">Total Earned</p>
            <h2 className="text-3xl font-black">₱{totalEarned.toLocaleString()}</h2>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-1">Completed Jobs</p>
            <h2 className="text-3xl font-black text-skill-dark dark:text-white">{completedCount}</h2>
          </div>

          {/* Average Rating */}
          <div className="bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Star size={20} className="text-amber-500 fill-amber-400" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-1">Average Rating</p>
            <h2 className="text-3xl font-black text-skill-dark dark:text-white flex items-center gap-2">
              {avgRating}
              <Star size={18} className="text-amber-400 fill-amber-400" />
            </h2>
          </div>

        </div>

        {/* Job List */}
        <div className="bg-white dark:bg-dark-card rounded-4xl shadow-sm border border-skill-primary/5 dark:border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-skill-dark dark:text-white">
              {filtered.length} Job{filtered.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No jobs match your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((job) => {
                const cfg    = STATUS_CONFIG[job.status];
                const Icon   = cfg.icon;
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-6 px-8 py-5 hover:bg-skill-light/40 dark:hover:bg-dark-bg/40 transition-colors group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={20} className={cfg.color} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-skill-dark dark:text-white truncate group-hover:text-skill-primary transition-colors">
                          {job.title}
                        </p>
                        <span className={`flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Briefcase size={10} /> {job.service}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {new Date(job.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Pay & Rating */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-skill-dark dark:text-white text-lg">
                        {job.status === 'cancelled' ? '—' : `₱${job.pay}`}
                      </p>
                      {job.rating && (
                        <p className="flex items-center justify-end gap-1 text-[11px] text-gray-400 mt-0.5">
                          {job.rating}
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-gray-300 group-hover:text-skill-primary transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}