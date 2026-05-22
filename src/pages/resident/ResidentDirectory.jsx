// src/pages/resident/ResidentDirectory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Search, Sun, Moon, Star, MapPin,
  BadgeCheck, Phone, Clock, ChevronRight,
  SlidersHorizontal, X, CheckCircle2,
  Briefcase, Award, Zap, ArrowLeft,
  Info, AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { SERVICE_CONFIG, SERVICE_FILTERS } from '../../data/mockData';


// Skeleton card — shown during loading to prevent content flash (Bug 3 fix)
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-skill-primary/5 dark:border-white/5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-bg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-100 dark:bg-dark-bg rounded-xl w-16" />
        <div className="h-6 bg-gray-100 dark:bg-dark-bg rounded-xl w-20" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded w-24" />
          <div className="h-5 bg-gray-100 dark:bg-dark-bg rounded w-16" />
        </div>
        <div className="h-8 bg-gray-100 dark:bg-dark-bg rounded-lg w-24" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data Quality Banner
// ---------------------------------------------------------------------------
// Shows the resident a notice when the ML engine is working with
// incomplete data (missing coordinates, no bios, no ratings yet).
// This makes the matching transparent rather than a black box.

function DataQualityBanner({ dataQuality }) {
  if (!dataQuality || dataQuality.quality_level === 'high') return null;

  const isLow = dataQuality.quality_level === 'low';

  return (
    <div className={`mb-5 p-4 rounded-xl border flex items-start gap-3 ${
      isLow
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex-shrink-0 mt-0.5">
        {isLow
          ? <AlertTriangle size={16} className="text-amber-500" />
          : <Info size={16} className="text-blue-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
          isLow ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
        }`}>
          {isLow ? 'Limited Match Data' : 'Match Information'}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          {dataQuality.summary}
        </p>

        {/* Active signals */}
        {dataQuality.active_signals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest self-center">
              Active:
            </span>
            {dataQuality.active_signals.map((s) => (
              <span
                key={s}
                className="text-[9px] px-2 py-0.5 bg-skill-primary/10 text-skill-primary rounded-full font-bold uppercase tracking-wider"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Breakdown Panel — shown inside the worker detail modal
// ---------------------------------------------------------------------------
function ScoreBreakdown({ scores }) {
  const getColor = (s) => s >= 0.75 ? '#22c55e' : s >= 0.50 ? '#f59e0b' : '#ef4444';

  const LABELS = [
    { key: 'text',       label: 'Skill Match',  tip: 'How well the worker\'s profile matches your job description.' },
    { key: 'proximity',  label: 'Proximity',    tip: 'How close the worker is to the job location.'                 },
    { key: 'price',      label: 'Price Match',  tip: 'How well their rate fits your stated budget.'                 },
    { key: 'rating',     label: 'Rating',       tip: 'Their average score from completed jobs. New workers get a neutral score.' },
    { key: 'experience', label: 'Experience',   tip: 'Years of experience in their trade, normalized to 0–100%.'   },
  ];

  return (
    <div className="space-y-3 mt-2">
      {LABELS.map(({ key, label, tip }) => {
        const val = scores?.[key] ?? 0;
        const pct = Math.round(val * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-[10px] font-black" style={{ color: getColor(val) }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-dark-bg overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: getColor(val) }}
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5">{tip}</p>
          </div>
        );
      })}
    </div>
  );
}

function toMatchPercent(score) {
  if (score === null || score === undefined) return null;
  return Math.round(parseFloat(score) * 100);
}

function buildMlScoreMap(mlRankedWorkers) {
  const map = {};
  (mlRankedWorkers || []).forEach((w) => {
    map[w.worker_id] = {
      composite_score:   w.composite_score,
      distance_km:       w.distance_km,
      scores:            w.scores,
      match_explanation: w.match_explanation,
      years_experience:  w.years_experience,
    };
  });
  return map;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ResidentDirectory() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const matchRequest    = location.state?.matchRequest    ?? null;
  const mlRankedWorkers = location.state?.mlRankedWorkers ?? [];
  const dataQuality     = location.state?.dataQuality     ?? null;

  const [workers,        setWorkers]        = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [activeFilter,   setActiveFilter]   = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [offeredIds,     setOfferedIds]     = useState([]);
  const [ratingTarget,   setRatingTarget]   = useState(null);
  const [showScores,     setShowScores]     = useState(false);

  // Build the workers list directly from the ML response in location.state.
  // The job request POST already returned matched_workers[] — no second API call needed.
  useEffect(() => {
    const matchedWorkers = location.state?.matchedWorkers ?? [];

    if (matchedWorkers.length === 0) {
      // No ML results passed — show empty state immediately, no fetch
      setWorkers([]);
      return;
    }

    const normalized = matchedWorkers.map((item, index) => {
      const w  = item.worker;
      const bd = item.score_breakdown ?? {};
      return {
        ...w,
        // Shape fields the card UI reads
        service:           w.skill_category_name ?? '—',
        location:          w.address             ?? '—',
        rating:            parseFloat(w.avg_rating) || 0,
        daily_rate:        w.declared_rate        ?? 0,
        phone:             w.contact_number       ?? '—',
        availability:      (w.availability_schedule || []).join(', ') || 'Flexible',
        experience_years:  w.years_experience     ?? 0,
        jobs_done:         0,
        skills:            w.skill_category_name ? [w.skill_category_name] : [],
        // ML score fields — mapped from score_breakdown
        composite_score:   item.score            ?? null,
        distance_km:       null,
        ml_scores: {
          text:       bd.text_score      ?? 0,
          proximity:  bd.proximity_score ?? 0,
          price:      bd.price_score     ?? 0,
          rating:     bd.rating_score    ?? 0,
          experience: 0,
        },
        match_explanation: null,
      };
    });

    setWorkers(normalized);
  }, [location.state]);

    const workersWithScores = useMemo(() => {
      if (!workers) return [];
      const hasMlData = mlRankedWorkers.length > 0;
      return [...workers].sort((a, b) => {
        if (hasMlData) return (b.composite_score ?? -1) - (a.composite_score ?? -1);
        return (b.rating || 0) - (a.rating || 0);
      });
    }, [workers, mlRankedWorkers]);

  const filtered = useMemo(() => workersWithScores.filter((w) => {
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
  }), [workersWithScores, matchRequest, searchTerm, activeFilter]);

  async function handleSendOffer(worker) {
    if (!matchRequest?.id) {
      alert('Please submit a service request first before sending an offer.');
      return;
    }
    try {
      await api.sendOffer(matchRequest.id, worker.id, worker.composite_score);
      setOfferedIds((prev) => [...prev, worker.id]);
      setSelectedWorker(null);
    } catch (err) {
      alert(`Failed to send offer: ${err.message}`);
    }
  }

  const isLoading = workers === null;

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
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
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* Gate */}
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
                The ML engine ranks workers specifically for your job. Go back to your dashboard to book a service.
              </p>
            </div>
            <button
              onClick={() => navigate('/resident/dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-skill-primary hover:text-emerald-600 flex-shrink-0"
            >
              <ArrowLeft size={13} /> Dashboard
            </button>
          </div>
        )}

        {/* Context banner */}
        {matchRequest && (
          <div className="mb-4 p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-xl border border-skill-primary/20 flex items-center gap-4">
            <div className="p-2.5 bg-skill-primary/10 rounded-xl flex-shrink-0">
              <Zap size={16} className="text-skill-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-skill-primary uppercase tracking-widest mb-0.5">
                ML Match Results
              </p>
              <p className="text-sm font-semibold text-skill-dark dark:text-white truncate">
                {matchRequest.service_category} · {matchRequest.specific_problem}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Ranked by composite match score · {matchRequest.location}
                {mlRankedWorkers.length > 0 && (
                  <span className="ml-2 text-skill-primary font-bold">
                    · {mlRankedWorkers.length} scored
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/resident/dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-skill-primary flex-shrink-0"
            >
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        )}

        {/* Data quality notice — only shown when data is limited */}
        <DataQualityBanner dataQuality={dataQuality} />

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
                {Icon && <Icon size={14} />} {f}
              </button>
            );
          })}
          {!isLoading && (
            <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0 whitespace-nowrap">
              {filtered.length} worker{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Skeleton loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
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
        )}

        {/* Worker Cards */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((worker, index) => {
              const cfg       = SERVICE_CONFIG[worker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon      = cfg?.icon;
              const isOffered = offeredIds.includes(worker.id);
              const matchPct  = toMatchPercent(worker.composite_score);

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
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <div className={`p-3 rounded-lg ${cfg.bg}`}>
                          <Icon size={22} className={cfg.color} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-skill-dark dark:text-white group-hover:text-skill-primary transition-colors">
                            {worker.full_name}
                          </h3>
                          {worker.is_verified && (
                            <BadgeCheck size={14} className="text-skill-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-[10px] font-bold mt-0.5 ${cfg?.color ?? 'text-gray-400'}`}>
                          {worker.service}
                        </p>
                      </div>
                    </div>

                    {matchPct !== null ? (
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <div className="flex items-center gap-1 bg-skill-primary/10 border border-skill-primary/20 px-2.5 py-1.5 rounded-xl">
                          <Zap size={10} className="text-skill-primary" />
                          <span className="text-xs font-black text-skill-primary">{matchPct}%</span>
                        </div>
                        <span className="text-[8px] text-gray-400 font-bold">Rank #{index + 1}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl flex-shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {worker.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Match explanation — the key new addition */}
                  {worker.match_explanation && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 italic border-l-2 border-skill-primary/30 pl-2">
                      {worker.match_explanation}
                    </p>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(worker.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2.5 py-1 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-300 rounded-xl font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    <p className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                      {worker.distance_km !== null ? `${worker.distance_km} km away` : worker.location}
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <Clock size={11} className="text-gray-400 flex-shrink-0" />
                      {worker.experience_years} yrs experience
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <p className="text-lg font-black text-skill-dark dark:text-white">
                      ₱{worker.daily_rate}
                      <span className="text-xs font-normal text-gray-400">/day</span>
                    </p>
                    {isOffered ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-black">
                        <CheckCircle2 size={12} /> Offer Sent
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedWorker(worker); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all"
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
          onClick={() => { setSelectedWorker(null); setShowScores(false); }}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(() => {
              const cfg  = SERVICE_CONFIG[selectedWorker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon = cfg?.icon;
              return (
                <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-8 text-white relative overflow-hidden flex-shrink-0">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        {Icon && (
                          <div className={`p-3.5 rounded-lg ${cfg.bg}`}>
                            <Icon size={28} className={cfg.color} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-black text-xl">{selectedWorker.full_name}</h2>
                            {selectedWorker.is_verified && (
                              <BadgeCheck size={16} className="text-skill-primary" />
                            )}
                          </div>
                          <p className="text-skill-light/60 text-xs mt-0.5">
                            {selectedWorker.service} Specialist
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedWorker(null); setShowScores(false); }}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <X size={16} className="text-white/60" />
                      </button>
                    </div>
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

            {/* Modal Body */}
            <div className="p-7 space-y-5 overflow-y-auto flex-1">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Rating',    value: <>{selectedWorker.rating.toFixed(1)}<Star size={13} className="text-amber-400 fill-amber-400 inline ml-0.5" /></> },
                  { label: 'Jobs Done', value: selectedWorker.jobs_done },
                  { label: 'Yrs Exp.', value: selectedWorker.experience_years },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-skill-light dark:bg-dark-bg rounded-lg p-4 text-center">
                    <p className="text-lg font-black text-skill-dark dark:text-white flex items-center justify-center gap-0.5">{value}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="space-y-3">
                {[
                  { icon: MapPin,    value: selectedWorker.distance_km !== null ? `${selectedWorker.distance_km} km away` : selectedWorker.location },
                  { icon: Phone,     value: selectedWorker.phone },
                  { icon: Clock,     value: `Available: ${selectedWorker.availability}` },
                  { icon: Briefcase, value: `₱${selectedWorker.daily_rate}/day` },
                ].map(({ icon: Icon, value }, i) => (
                  <p key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Icon size={14} className="text-skill-primary flex-shrink-0" /> {value}
                  </p>
                ))}
              </div>

              {/* ML match score + explanation */}
              {selectedWorker.composite_score !== null && (
                <div className="p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-lg border border-skill-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-skill-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-skill-primary">
                          {toMatchPercent(selectedWorker.composite_score)}% ML Match Score
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Rank #{filtered.findIndex((w) => w.id === selectedWorker.id) + 1}
                          {selectedWorker.distance_km !== null && ` · ${selectedWorker.distance_km} km away`}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-[10px] font-bold text-skill-primary hover:underline flex-shrink-0"
                      onClick={() => setShowScores(!showScores)}
                    >
                      {showScores ? 'Hide ▲' : 'Details ▼'}
                    </button>
                  </div>

                  {/* Plain-language explanation */}
                  {selectedWorker.match_explanation && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed italic border-t border-skill-primary/10 pt-2">
                      {selectedWorker.match_explanation}
                    </p>
                  )}

                  {/* Score breakdown */}
                  {showScores && selectedWorker.ml_scores && (
                    <div className="border-t border-skill-primary/10 pt-3">
                      <ScoreBreakdown scores={selectedWorker.ml_scores} />
                    </div>
                  )}
                </div>
              )}

              {/* Offer info */}
              <div className="p-4 bg-skill-light dark:bg-dark-bg rounded-lg border border-skill-primary/10">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-skill-primary mt-0.5 flex-shrink-0" />
                  You are sending an offer to this worker. They will review your request and accept or decline.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              <button
                onClick={() => handleSendOffer(selectedWorker)}
                className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-black rounded-lg transition-all shadow-lg shadow-skill-primary/20 text-sm"
              >
                Send Offer to {selectedWorker.full_name} — ₱{selectedWorker.daily_rate}/day
              </button>
            </div>
          </div>
        </div>
      )}

      {ratingTarget && (
        <RatingModal
          job={ratingTarget.job}
          worker={ratingTarget.worker}
          onSubmit={() => setRatingTarget(null)}
          onSkip={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
}