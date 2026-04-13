import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Search, Sun, Moon, Star, MapPin,
  BadgeCheck, Phone, Clock, ChevronRight,
  SlidersHorizontal, X, CheckCircle2,
  Briefcase, User, Award, Zap, ArrowLeft,
} from 'lucide-react';
import { api } from '../../services/api';
import { SERVICE_CONFIG, SERVICE_FILTERS } from '../../data/mockData';

export default function ResidentDirectory() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();

  // MatchRequest is passed via navigate state from ResidentDashboard after form submit.
  const matchRequest = location.state?.matchRequest ?? null;

  const [workers,        setWorkers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [activeFilter,   setActiveFilter]   = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Track offer-sent workers (replaces generic "booked")
  const [offeredIds,   setOfferedIds]   = useState([]);
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);

        // Resolve the actual category name from the skill categories API
        // so we always pass the exact name the database uses
        let categoryFilter = matchRequest?.service_category ?? null;

        if (categoryFilter) {
          try {
            const cats = await api.getSkillCategories();
            const match = (cats || []).find(
              (c) => c.category_name.toLowerCase() === categoryFilter.toLowerCase()
            );
            // Use the exact DB name if found, otherwise keep what we have
            if (match) categoryFilter = match.category_name;
          } catch (_) {}
        }

        const data = await api.getWorkers(categoryFilter);

        const normalized = (data || []).map((w) => ({
          ...w,
          service:          w.skill_category_name ?? '—',
          location:         w.address             ?? '—',
          rating:           parseFloat(w.avg_rating) || 0,
          daily_rate:       w.declared_rate       ?? 0,
          phone:            w.contact_number      ?? '—',
          availability:     (w.availability_schedule || []).join(', ') || 'Flexible',
          experience_years: w.years_experience    ?? 0,
          jobs_done:        0,
          skills:           w.skill_category_name ? [w.skill_category_name] : [],
        }));

        setWorkers(normalized);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, [matchRequest]);

  // Derive mock ML match scores based on the submitted matchRequest.
  // For the demo, we seed a deterministic score per worker so ranked order is stable.
  const workersWithScores = useMemo(() => {
    if (!matchRequest) return workers.map((w) => ({ ...w, match_score: null }));
    return workers
      .map((w) => {
        // Seed score: base from rating (0–5 → 0–50), bonus if service matches (30),
        // small variation per worker id so scores differ visibly.
        const serviceBonus  = w.service === matchRequest.service_category ? 30 : 0;
        const ratingContrib = Math.round((w.rating || 0) * 10);
        const variation     = ((w.id * 7) % 15) - 7; // deterministic spread –7..+7
        const score         = Math.min(99, Math.max(50, ratingContrib + serviceBonus + variation));
        return { ...w, match_score: score };
      })
      // Sort descending by ML match score
      .sort((a, b) => b.match_score - a.match_score);
  }, [workers, matchRequest]);

  const filtered = workersWithScores.filter((w) => {
    // If a job request was submitted, only show workers matching that category
    const matchCategory = matchRequest
      ? w.service?.toLowerCase() === matchRequest.service_category?.toLowerCase()
      : true;

    const matchSearch =
      w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.skills || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter = activeFilter === 'All' || w.service === activeFilter;

    return matchCategory && matchSearch && matchFilter;
  });

  // "Send Offer" — sets offer state and closes modal
  async function handleSendOffer(worker) {
    // Guard — needs a real request ID to send an offer
    if (!matchRequest?.id) {
      alert('Please submit a service request first before sending an offer.');
      return;
    }

    try {
      await api.sendOffer(matchRequest.id, worker.id);

      // Only update UI after the API confirms success
      setOfferedIds((prev) => [...prev, worker.id]);
      setSelectedWorker(null);
    } catch (err) {
      // Show the error from Django instead of silently failing
      alert(`Failed to send offer: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            {/* This is the ML results screen — not a general browse directory */}
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">
              {matchRequest ? 'Matched Workers' : 'Find Workers'}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              {matchRequest ? 'ML Match Results' : 'Worker Directory'}
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

      {/* Gate — if no job request was submitted, direct resident to submit one first */}
      {!matchRequest && (
        <div className="mb-6 p-6 bg-white dark:bg-dark-card rounded-xl border border-skill-primary/10 dark:border-white/5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex-shrink-0">
            <Zap size={20} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-skill-dark dark:text-white text-sm mb-1">
              Submit a request to see your matched workers
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              In Skill-Link CDO, the ML engine ranks workers specifically for your job. Browse below is a preview only — go back to your dashboard and book a service to see your personalised ranked results.
            </p>
          </div>
          <button
            onClick={() => navigate('/resident/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-skill-primary hover:text-emerald-600 flex-shrink-0 transition-colors"
          >
            <ArrowLeft size={13} /> Dashboard
          </button>
        </div>
      )}

      {/* Context banner — shows what request these results are for */}
      {matchRequest && (
        <div className="mb-6 p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-xl border border-skill-primary/20 flex items-center gap-4">
          <div className="p-2.5 bg-skill-primary/10 rounded-xl flex-shrink-0">
            <Zap size={16} className="text-skill-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-skill-primary uppercase tracking-widest mb-0.5">ML Match Results</p>
            <p className="text-sm font-semibold text-skill-dark dark:text-white truncate">
              {matchRequest.service_category} · {matchRequest.specific_problem}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Showing verified <span className="font-bold text-skill-primary">{matchRequest.service_category}</span> workers for your request · {matchRequest.location}
            </p>
          </div>
          <button
            onClick={() => navigate('/resident/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-skill-primary flex-shrink-0 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      )}

        {/* Filter Pills */}
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

        {/* Worker Cards */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-skill-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Search size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              {matchRequest
                ? `No verified ${matchRequest.service_category} workers are currently available.`
                : 'No workers found.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                className="mt-4 text-skill-primary text-sm font-bold hover:underline"
              >
                Clear search
              </button>
            )}
            {matchRequest && (
              <button
                onClick={() => navigate('/resident/dashboard')}
                className="mt-3 text-gray-400 text-sm font-bold hover:underline block mx-auto"
              >
                Go back and change your request
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((worker) => {
              const cfg       = SERVICE_CONFIG[worker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon      = cfg.icon;
              const isOffered = offeredIds.includes(worker.id);

              return (
                <div
                  key={worker.id}
                  onClick={() => !isOffered && setSelectedWorker(worker)}
                  className={`bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border transition-all group ${
                    isOffered
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
                    {/* ML match score badge — shown only when request context exists */}
                    {worker.match_score !== null ? (
                      <div className="flex items-center gap-1 bg-skill-primary/10 border border-skill-primary/20 px-2.5 py-1.5 rounded-xl flex-shrink-0">
                        <Zap size={10} className="text-skill-primary" />
                        <span className="text-xs font-black text-skill-primary">{worker.match_score}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl flex-shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">{worker.rating}</span>
                      </div>
                    )}
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
                      <p className="text-[10px] text-gray-400">{worker.jobs_done} jobs · {worker.experience_years} yrs exp</p>
                      {/* /hr → /day */}
                      <p className="text-lg font-black text-skill-dark dark:text-white">
                        ₱{worker.daily_rate}
                        <span className="text-xs font-normal text-gray-400">/day</span>
                      </p>
                    </div>
                    {/* "Offer Sent" state instead of "Requested"; "Send Offer" instead of "Book Now" */}
                    {isOffered ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-black">
                        <CheckCircle2 size={12} /> Offer Sent
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedWorker(worker); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-skill-primary/20"
                      >
                        Send Offer <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Worker Detail Modal */}
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
                  { label: 'Jobs Done',value: selectedWorker.jobs_done },
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
                  { icon: MapPin,    label: 'location',     value: selectedWorker.location   },
                  { icon: Phone,     label: 'phone',        value: selectedWorker.phone       },
                  { icon: Clock,     label: 'availability', value: `Available: ${selectedWorker.availability}` },
                  { icon: Briefcase, label: 'rate',         value: `₱${selectedWorker.daily_rate}/day` },
                ].map(({ icon: Icon, label, value }) => (
                  <p key={label} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
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

              {/* Show ML match score in modal if available */}
              {selectedWorker.match_score !== null && (
                <div className="flex items-center gap-3 p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-lg border border-skill-primary/20">
                  <Zap size={16} className="text-skill-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-skill-primary">{selectedWorker.match_score}% ML Match Score</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Ranked #{filtered.findIndex(w => w.id === selectedWorker.id) + 1} for your request</p>
                  </div>
                </div>
              )}

              {/* Replaced auto-assignment language with accurate Model B description */}
              <div className="p-4 bg-skill-light dark:bg-dark-bg rounded-lg border border-skill-primary/10">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-skill-primary mt-0.5 flex-shrink-0" />
                  You are sending an offer to this worker. They will review your request and accept or decline.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              {/* "Send Offer" — resident initiates offer, worker accepts or declines */}
              <button
                onClick={() => handleSendOffer(selectedWorker)}
                className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-black rounded-lg transition-all shadow-lg shadow-skill-primary/20 text-sm active:scale-[0.98]"
              >
                Send Offer to {selectedWorker.full_name} — ₱{selectedWorker.daily_rate}/day
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