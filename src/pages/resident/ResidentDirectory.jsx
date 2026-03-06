import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Search, Sun, Moon, Star, MapPin,
  BadgeCheck, Phone, Clock, ChevronRight,
  SlidersHorizontal, X, CheckCircle2,
  Briefcase, User, Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { SERVICE_CONFIG, SERVICE_FILTERS } from '../../data/mockData';

export default function ResidentDirectory() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [workers,        setWorkers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [activeFilter,   setActiveFilter]   = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Track booked workers + which ones need rating
  const [bookedIds,    setBookedIds]    = useState([]);
  const [ratingTarget, setRatingTarget] = useState(null); // { job, worker }

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const data = await api.getWorkers();
        setWorkers(data || []);
      } catch (error) {
        console.error('Failed to load workers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  const filtered = workers.filter((w) => {
    const matchSearch =
      w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.skills || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'All' || w.service === activeFilter;
    return matchSearch && matchFilter;
  });

  function handleBook(worker) {
    setBookedIds((prev) => [...prev, worker.id]);
    setSelectedWorker(null);
    // "Book Now" here is a manual request trigger — worker still needs ML confirmation.
}

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Find Workers</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Worker Directory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input
                type="text"
                placeholder="Search by name, skill, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-72 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
              />
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

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* ── Filter Pills ── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <SlidersHorizontal size={16} className="text-skill-primary flex-shrink-0" />
          {SERVICE_FILTERS.map((f) => {
            const cfg  = SERVICE_CONFIG[f];
            const Icon = cfg?.icon;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeFilter === f
                    ? 'bg-skill-primary text-white shadow-lg shadow-skill-primary/20'
                    : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:border-skill-primary border border-transparent'
                }`}
              >
                {Icon && <Icon size={14} />}
                {f}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0 whitespace-nowrap">
            {filtered.length} worker{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Worker Cards ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-skill-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Search size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No workers found.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
              className="mt-4 text-skill-primary text-sm font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((worker) => {
              const cfg      = SERVICE_CONFIG[worker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon     = cfg.icon;
              const isBooked = bookedIds.includes(worker.id);

              return (
                <div
                  key={worker.id}
                  onClick={() => !isBooked && setSelectedWorker(worker)}
                  className={`bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border transition-all group ${
                    isBooked
                      ? 'border-emerald-200 dark:border-emerald-800 cursor-default opacity-70'
                      : 'border-skill-primary/5 dark:border-white/5 hover:border-skill-primary/30 hover:shadow-md cursor-pointer'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${cfg.bg}`}>
                        <Icon size={22} className={cfg.color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-skill-dark dark:text-white group-hover:text-skill-primary transition-colors">
                            {worker.full_name}
                          </h3>
                          {worker.is_verified && (
                            <BadgeCheck size={14} className="text-skill-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-[10px] font-bold mt-0.5 ${cfg.color}`}>{worker.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl flex-shrink-0">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">{worker.rating}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(worker.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2.5 py-1 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-300 rounded-xl font-semibold">
                        {s}
                      </span>
                    ))}
                    {(worker.skills || []).length > 3 && (
                      <span className="text-[10px] px-2.5 py-1 bg-skill-light dark:bg-dark-bg text-gray-400 rounded-xl font-semibold">
                        +{worker.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    <p className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <MapPin size={11} className="text-gray-400 flex-shrink-0" /> {worker.location}
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <Clock size={11} className="text-gray-400 flex-shrink-0" /> Available: {worker.availability}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-400">{worker.jobs} jobs · {worker.experience_years} yrs exp</p>
                      <p className="text-lg font-black text-skill-dark dark:text-white">
                        ₱{worker.hourly_rate}
                        <span className="text-xs font-normal text-gray-400">/hr</span>
                      </p>
                    </div>
                    {isBooked ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-black">
                        <CheckCircle2 size={12} /> Requested
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedWorker(worker); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-skill-primary/20"
                      >
                        Book Now <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Worker Detail Modal ── */}
      {selectedWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={() => setSelectedWorker(null)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(() => {
              const cfg  = SERVICE_CONFIG[selectedWorker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon = cfg.icon;
              return (
                <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-8 text-white relative overflow-hidden flex-shrink-0">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3.5 rounded-lg ${cfg.bg}`}>
                          <Icon size={28} className={cfg.color} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-black text-xl">{selectedWorker.full_name}</h2>
                            {selectedWorker.is_verified && <BadgeCheck size={16} className="text-skill-primary" />}
                          </div>
                          <p className="text-skill-light/60 text-xs mt-0.5">{selectedWorker.service} Specialist</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={16} className="text-white/60" />
                      </button>
                    </div>

                    {/* Verified badge */}
                    {selectedWorker.is_verified && (
                      <div className="flex items-center gap-1.5 bg-skill-primary/20 border border-skill-primary/30 rounded-xl px-3 py-2 w-fit">
                        <Award size={12} className="text-skill-primary" />
                        <span className="text-[10px] font-black text-skill-primary uppercase tracking-wider">
                          Barangay Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-skill-primary/10 rounded-full blur-2xl" />
                </div>
              );
            })()}

            {/* Body */}
            <div className="p-7 space-y-5 overflow-y-auto flex-1">

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Rating',   value: <>{selectedWorker.rating}<Star size={13} className="text-amber-400 fill-amber-400 inline ml-0.5" /></> },
                  { label: 'Jobs Done',value: selectedWorker.jobs },
                  { label: 'Yrs Exp.', value: selectedWorker.experience_years },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-skill-light dark:bg-dark-bg rounded-lg p-4 text-center">
                    <p className="text-lg font-black text-skill-dark dark:text-white flex items-center justify-center gap-0.5">{value}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Contact details */}
              <div className="space-y-3">
                {[
                  { icon: MapPin,  value: selectedWorker.location   },
                  { icon: Phone,   value: selectedWorker.phone       },
                  { icon: Clock,   value: `Available: ${selectedWorker.availability}` },
                  { icon: Briefcase, value: `₱${selectedWorker.hourly_rate}/hr` },
                ].map(({ icon: Icon, value }) => (
                  <p key={value} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Icon size={14} className="text-skill-primary flex-shrink-0" /> {value}
                  </p>
                ))}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {(selectedWorker.skills || []).map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 bg-skill-primary/10 text-skill-dark dark:text-skill-primary rounded-xl font-bold">
                    {s}
                  </span>
                ))}
              </div>

              {/* ML match note */}
              <div className="p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-lg border border-skill-primary/20">
                <p className="text-xs text-skill-primary font-bold flex items-start gap-2">
                  <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" />
                  Submitting a request notifies the matching engine — you'll be assigned the best available worker automatically.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              <button
                onClick={() => handleBook(selectedWorker)}
                className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-black rounded-lg transition-all shadow-lg shadow-skill-primary/20 text-sm active:scale-[0.98]"
              >
                Request {selectedWorker.full_name} — ₱{selectedWorker.hourly_rate}/hr
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating modal — can optionally appear post-booking as UX preview */}
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
