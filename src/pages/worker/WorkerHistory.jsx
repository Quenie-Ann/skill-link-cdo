import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Briefcase, MapPin, Calendar, ChevronRight,
  Sun, Moon, CheckCircle2, TrendingUp,
  Filter, Search, Star, Clock,
} from 'lucide-react';
import { api } from '../../services/api';

const STATUS_CONFIG = {
  completed: {
    bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    label: 'Completed',
    icon:  CheckCircle2,
  },
  in_progress: {
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    color: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    label: 'In Progress',
    icon:  Briefcase,
  },
  cancelled: {
    bg:    'bg-red-50 dark:bg-red-900/20',
    color: 'text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    label: 'Cancelled',
    icon:  Clock,
  },
};

export default function WorkerHistory() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [history,      setHistory]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Rating modal state — workers can also rate residents (optional UX extension)
  const [ratingTarget, setRatingTarget] = useState(null); // { job, worker }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Also fetch the worker's own profile to get declared_rate
        const [data, profile] = await Promise.all([
          api.getJobHistory(),
          api.getProfile(),
        ]);

        const workerDeclaredRate = parseFloat(profile?.declared_rate ?? 0);

        const normalized = (data || []).map((offer) => {

          // Determine job status
          const jobStatus = offer.request_status === 'completed'
            ? 'completed'
            : offer.status === 'accepted'
            ? 'in_progress'
            : 'cancelled';

          // Pay = worker's declared rate for completed jobs
          // null for in_progress (not yet paid) and cancelled
          const pay = jobStatus === 'completed'
            ? workerDeclaredRate
            : null;

          return {
            id:       offer.id,
            title:    offer.request_title    ?? 'Job Request',
            service:  offer.category_name   ?? '—',
            location: offer.request_location ?? '—',
            resident: offer.resident_name   ?? '—',
            date:     offer.created_at,
            pay,
            rating:   null,
            status:   jobStatus,
          };
        });

        setHistory(normalized);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter((job) => {
    const matchSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.resident?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalEarned    = history.filter((j) => j.status === 'completed').reduce((a, j) => a + (j.pay || 0), 0);
  const completedCount = history.filter((j) => j.status === 'completed').length;
  const ratingValues   = history.filter((j) => j.rating).map((j) => j.rating);
  const avgRating      = ratingValues.length
    ? (ratingValues.reduce((a, v) => a + v, 0) / ratingValues.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">My Jobs</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Job History
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-56 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
              />
            </div>
            {/* Status Filter */}
            <div className="relative hidden md:flex items-center gap-2">
              <Filter size={15} className="text-skill-primary/60" />
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
            <NotificationBell />
            <button
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-6">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-xl p-7 text-white shadow-xl shadow-skill-dark/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <TrendingUp size={18} className="text-skill-primary" />
              </div>
              <span className="text-[9px] bg-skill-primary/20 text-skill-primary px-3 py-1 rounded-full font-black uppercase tracking-wider">
                All Time
              </span>
            </div>
            <p className="text-skill-light/50 text-[10px] uppercase tracking-widest font-bold mb-1">Total Earned</p>
            <h2 className="text-4xl font-black">₱{totalEarned.toLocaleString()}</h2>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl p-7 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Completed</p>
            <h2 className="text-4xl font-black text-skill-dark dark:text-white">{completedCount}</h2>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl p-7 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Star size={18} className="text-amber-500 fill-amber-400" />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Avg. Rating</p>
            <h2 className="text-4xl font-black text-skill-dark dark:text-white flex items-center gap-2">
              {avgRating}
              {avgRating !== '—' && <Star size={20} className="text-amber-400 fill-amber-400" />}
            </h2>
          </div>
        </div>

        {/* ── Job List ── */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-skill-dark dark:text-white">
              {filtered.length} Job{filtered.length !== 1 ? 's' : ''} Found
            </h3>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="text-xs font-bold text-skill-primary hover:text-emerald-600 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-skill-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No jobs match your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((job) => {
                const cfg  = STATUS_CONFIG?.[job.status] || {
                  bg: 'bg-gray-50 dark:bg-dark-bg',
                  color: 'text-gray-400',
                  badge: 'bg-gray-100 text-gray-600',
                  label: job.status,
                  icon: Clock,
                };
                const Icon = cfg.icon;

                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-5 px-8 py-5 hover:bg-skill-light/30 dark:hover:bg-dark-bg/30 transition-colors group"
                  >
                    {/* Icon */}
                    <div className={`p-3 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={18} className={cfg.color} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-bold text-skill-dark dark:text-white truncate group-hover:text-skill-primary transition-colors">
                          {job.title}
                        </p>
                        <span className={`flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase size={10} /> {job.service}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {job.date ? new Date(job.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Pay + Rating + Rate CTA */}
                    <div className="text-right">
                      <p className="font-black text-skill-dark dark:text-white text-lg">
                        {job.status === 'cancelled'
                          ? '—'
                          : job.pay !== null
                          ? `₱${Number(job.pay).toLocaleString('en-PH')}`
                          : <span className="text-sm text-gray-400 font-normal">Pending</span>
                        }
                      </p>
                      {job.rating ? (
                        <p className="flex items-center justify-end gap-1 text-[11px] text-gray-400 mt-0.5">
                          {job.rating}
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                        </p>
                      ) : job.status === 'completed' ? (
                        <p className="text-[10px] text-gray-300 italic mt-0.5">Awaiting review</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Rating modal — triggered when a worker wants to rate a resident (optional) */}
      {ratingTarget && (
        <RatingModal
          job={ratingTarget.job}
          worker={ratingTarget.worker}
          onSubmit={(data) => {
            console.log('Rating submitted:', data);
            setRatingTarget(null);
          }}
          onSkip={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
}
