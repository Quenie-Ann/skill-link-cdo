import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import { useCountdown }    from '../../hooks/shared/useCountdown';
import { useWorkerStatus } from '../../hooks/worker/useWorkerStatus';
import { api } from '../../services/api';
import {
  Zap, Sun, Moon, MapPin,
  CheckCircle2, XCircle, Star, BadgeCheck,
  ChevronRight, Phone, User, Briefcase,
  Calendar, DollarSign, AlertTriangle,
  Wifi, WifiOff, Navigation,
} from 'lucide-react';

// ─────────────────────────────────────────
//  STAT PILL
// ─────────────────────────────────────────
function StatPill({ icon: Icon, label, value, highlight }) {
  return (
    <dl className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all ${
      highlight
        ? 'bg-skill-primary/10 border-skill-primary/20'
        : 'bg-skill-light dark:bg-dark-bg border-skill-primary/5 dark:border-white/5'
    }`}>
      <Icon size={14} aria-hidden="true" className={highlight ? 'text-skill-primary' : 'text-gray-400'} />
      <div>
        <dd className={`text-sm font-black leading-none ${highlight ? 'text-skill-primary' : 'text-skill-dark dark:text-white'}`}>
          {value}
        </dd>
        <dt className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5 font-bold">
          {label}
        </dt>
      </div>
    </dl>
  );
}

// ─────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────
export default function WorkerDashboard() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [worker,      setWorker]      = useState(null);
  const [incomingJob, setIncomingJob] = useState(null);
  const [activeJob,   setActiveJob]   = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [profile, incoming, active] = await Promise.all([
        api.getProfile(),
        api.getIncomingJob(),
        api.getActiveJob(),
      ]);
      setWorker(profile);
      setIncomingJob(incoming);
      setActiveJob(active);
    }
    fetchData().catch(console.error);
  }, []);

  const expiresIn = incomingJob?.expires_in ?? 120;

  // Seed countdown so hook can detect expiry
  const seedCountdown = useCountdown(expiresIn, false);

  const {
    uiState,
    goOnline, goOffline,
    acceptJob, declineJob,
    completeJob,
  } = useWorkerStatus(seedCountdown.remaining);

  // Live countdown — only active during incoming state
  const { remaining, pct, display } = useCountdown(
    expiresIn,
    uiState === 'incoming',
  );

  // SVG countdown ring
  const R         = 20;
  const circ      = 2 * Math.PI * R;
  const dash      = (pct / 100) * circ;
  const ringColor = pct > 60 ? '#10b981' : pct > 30 ? '#f59e0b' : '#ef4444';

  const isOnline = uiState !== 'offline';

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* ══ HEADER ══ */}
      <header
        role="banner"
        className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-6 py-4"
      >
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Job Matches</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Worker Portal
            </p>
          </div>
          <div className="flex items-center gap-3" role="toolbar" aria-label="Header actions">
            <NotificationBell />
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all"
            >
              {isDarkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-xl mx-auto px-6 py-5 space-y-4">

        {/* ══ WORKER IDENTITY CARD ══ */}
        <section
          aria-label="Worker profile"
          className="bg-white dark:bg-dark-card rounded-lg p-5 border border-skill-primary/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-lg bg-skill-primary/10 border border-skill-primary/20 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <User size={22} className="text-skill-primary" />
                </div>
                <span
                  role="status"
                  aria-label={isOnline ? 'Online' : 'Offline'}
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-card transition-colors ${
                    isOnline ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-black text-skill-dark dark:text-white text-sm">
                  {worker.full_name}
                  {worker.is_verified && (
                    <BadgeCheck size={13} className="text-skill-primary" aria-label="Verified worker" />
                  )}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">
                  {worker.service} Specialist
                </p>
              </div>
            </div>

            {/* Online / Offline toggle */}
            <button
              type="button"
              onClick={isOnline ? goOffline : goOnline}
              aria-pressed={isOnline}
              aria-label={isOnline ? 'Go offline' : 'Go online to receive jobs'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all ${
                isOnline
                  ? 'bg-skill-primary text-white ring-4 ring-skill-primary/15 shadow-lg shadow-skill-primary/20'
                  : 'bg-skill-light dark:bg-dark-bg text-gray-500 border border-gray-200 dark:border-white/10 hover:border-skill-primary/40'
              }`}
            >
              {isOnline
                ? <><Wifi size={12} aria-hidden="true" className="animate-pulse" /> Online</>
                : <><WifiOff size={12} aria-hidden="true" /> Go Online</>
              }
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-2 mt-4 flex-wrap" role="list" aria-label="Worker statistics">
            <div role="listitem"><StatPill icon={Star}         label="Rating"    value={worker.rating}    highlight /></div>
            <div role="listitem"><StatPill icon={CheckCircle2} label="Jobs Done" value={worker.jobs_done} /></div>
            <div role="listitem"><StatPill icon={Zap}          label="Tier"      value="Gold ✦" /></div>
          </div>
        </section>


        {/* ══ STATE: OFFLINE ══ */}
        {uiState === 'offline' && (
          <section
            aria-labelledby="offline-heading"
            className="bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden"
          >
            <div className="px-8 py-12 text-center">
              <div
                className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <WifiOff size={30} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h2 id="offline-heading" className="text-lg font-black text-skill-dark dark:text-white mb-2">
                You're Offline
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs mx-auto">
                Go online to start receiving job matches from residents in your area.
              </p>
              <button
                type="button"
                onClick={goOnline}
                className="inline-flex items-center gap-2.5 bg-skill-primary hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-black text-sm transition-all shadow-xl shadow-skill-primary/20 active:scale-[0.97]"
              >
                <Zap size={17} aria-hidden="true" /> Go Online Now
              </button>
            </div>

            <footer className="border-t border-gray-100 dark:border-white/5 px-8 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Last session{' '}
                <span className="font-bold text-skill-dark dark:text-white">2 hours ago</span>
              </p>
              <button
                type="button"
                aria-label="View job history"
                className="text-xs font-bold text-skill-primary flex items-center gap-1 hover:gap-2 transition-all"
              >
                View history <ChevronRight size={12} aria-hidden="true" />
              </button>
            </footer>
          </section>
        )}


        {/* ══ STATE: WAITING ══ */}
        {uiState === 'waiting' && (
          <section
            aria-labelledby="waiting-heading"
            aria-live="polite"
            className="bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden"
          >
            <div className="px-8 py-12 text-center">
              {/* Radar pulse */}
              <div className="relative w-24 h-24 mx-auto mb-6" aria-hidden="true">
                <div
                  className="absolute inset-0 bg-skill-primary/10 rounded-full animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div
                  className="absolute inset-3 bg-skill-primary/15 rounded-full animate-ping"
                  style={{ animationDuration: '2s', animationDelay: '0.5s' }}
                />
                <div className="relative w-24 h-24 bg-skill-primary/10 border-2 border-skill-primary/20 rounded-full flex items-center justify-center">
                  <Zap size={30} className="text-skill-primary" />
                </div>
              </div>

              <h2 id="waiting-heading" className="text-lg font-black text-skill-dark dark:text-white mb-2">
                Looking for Jobs
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs mx-auto">
                You're visible to residents. We'll notify you the moment a match is found.
              </p>

              <div className="flex justify-center gap-1.5 mb-8" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-skill-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goOffline}
                aria-label="Go offline and stop receiving job matches"
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5"
              >
                <WifiOff size={12} aria-hidden="true" /> Go Offline
              </button>
            </div>
          </section>
        )}


        {/* ══ STATE: INCOMING MATCH ══ */}
        {uiState === 'incoming' && (
          <section
            aria-labelledby="incoming-heading"
            aria-live="assertive"
            aria-atomic="true"
            className="rounded-lg overflow-hidden shadow-2xl shadow-skill-dark/20 border border-skill-primary/20"
          >
            {/* Match header */}
            <header className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden">
              <div className="relative z-10">

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Live badge */}
                    <p className="flex items-center gap-2 mb-3">
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        New Job Match
                      </span>
                    </p>

                    <h2 id="incoming-heading" className="text-xl font-black leading-tight mb-1.5">
                      {incomingJob?.problem}
                    </h2>
                    <p className="text-skill-light/50 text-xs flex items-center gap-1.5">
                      <Navigation size={9} aria-hidden="true" />
                      <span>{incomingJob?.distance}</span>
                      <span className="opacity-30 mx-1" aria-hidden="true">·</span>
                      <span>Request {incomingJob?.id}</span>
                    </p>
                  </div>

                  {/* Countdown ring */}
                  <div
                    className="flex flex-col items-center flex-shrink-0 relative"
                    role="timer"
                    aria-label={`Time remaining: ${display}`}
                  >
                    <svg width="52" height="52" className="-rotate-90" aria-hidden="true">
                      <circle cx="26" cy="26" r={R} fill="none"
                        stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle cx="26" cy="26" r={R} fill="none"
                        stroke={ringColor}
                        strokeWidth="3"
                        strokeDasharray={`${dash} ${circ}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s linear, stroke 0.5s' }}
                      />
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-black text-white tabular-nums">
                      {display}
                    </span>
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider mt-0.5">left</p>
                  </div>
                </div>

                {/* Match badges */}
                <div className="flex items-center gap-2 mt-5 flex-wrap" role="list" aria-label="Match details">
                  <span role="listitem" className="flex items-center gap-1.5 bg-skill-primary/20 border border-skill-primary/30 rounded-xl px-3 py-1.5">
                    <Zap size={10} className="text-skill-primary" aria-hidden="true" />
                    <span className="text-[10px] font-black text-skill-primary">
                      {incomingJob?.match_score}% Match
                    </span>
                  </span>
                  <span role="listitem" className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                    <Briefcase size={10} className="text-white/50" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-white/50">{incomingJob?.service}</span>
                  </span>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
            </header>

            {/* Job details */}
            <div className="bg-white dark:bg-dark-card px-7 pt-6 pb-5 space-y-4">
              <blockquote className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-l-2 border-skill-primary/30 pl-3 italic">
                {incomingJob?.description}
              </blockquote>

              <dl className="space-y-3">
                {[
                  { icon: User,        iconBg: 'bg-blue-50 dark:bg-blue-900/20',     iconColor: 'text-blue-500',    label: 'Resident',           value: incomingJob?.resident?.name    },
                  { icon: MapPin,      iconBg: 'bg-red-50 dark:bg-red-900/20',       iconColor: 'text-red-500',     label: 'Service Address',    value: incomingJob?.resident?.address },
                  { icon: Calendar,    iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500',  label: 'Preferred Schedule', value: incomingJob?.schedule          },
                  { icon: DollarSign,  iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', label: 'Budget Range', value: incomingJob?.budget            },
                ].map(({ icon: Icon, iconBg, iconColor, label, value }) => (
                  <div key={label} className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`} aria-hidden="true">
                      <Icon size={14} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</dt>
                      <dd className="text-sm font-semibold text-skill-dark dark:text-white leading-snug">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {/* Expiry warning */}
              {pct <= 30 && (
                <div role="alert" className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle size={13} className="text-red-500 flex-shrink-0" aria-hidden="true" />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    Expiring soon — if you don't respond, this job goes to the next worker.
                  </p>
                </div>
              )}
            </div>

            {/* Accept / Decline */}
            <div className="bg-white dark:bg-dark-card px-7 pb-7 pt-3 flex gap-3 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={declineJob}
                aria-label={`Decline job: ${incomingJob?.problem}`}
                className="flex-none flex items-center gap-2 px-5 py-3.5 rounded-lg border-2 border-gray-200 dark:border-white/10 text-sm font-bold text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <XCircle size={15} aria-hidden="true" /> Decline
              </button>
              <button
                type="button"
                onClick={acceptJob}
                aria-label={`Accept job: ${incomingJob?.problem}`}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-skill-primary/25 active:scale-[0.98]"
              >
                <CheckCircle2 size={17} aria-hidden="true" /> Accept Job
              </button>
            </div>
          </section>
        )}


        {/* ══ STATE: ACTIVE JOB ══ */}
        {uiState === 'active' && (
          <div className="space-y-4">
            <section
              aria-labelledby="active-heading"
              className="rounded-lg overflow-hidden shadow-lg border border-skill-primary/20"
            >
              {/* Card header */}
              <header className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-skill-primary">
                      Job In Progress
                    </span>
                  </p>
                  <h2 id="active-heading" className="text-xl font-black leading-tight mb-1">
                    {activeJob?.problem}
                  </h2>
                  <p className="text-skill-light/50 text-xs flex items-center gap-1.5">
                    <Navigation size={9} aria-hidden="true" />
                    <span>{activeJob?.distance}</span>
                    <span className="opacity-30 mx-1" aria-hidden="true">·</span>
                    <span>Accepted {activeJob?.accepted_at}</span>
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
              </header>

              {/* Client details */}
              <div className="bg-white dark:bg-dark-card px-7 pt-6 pb-5">
                <dl className="space-y-3">
                  {[
                    { icon: User,       iconBg: 'bg-blue-50 dark:bg-blue-900/20',     iconColor: 'text-blue-500',    label: 'Client',          value: activeJob?.resident?.name    },
                    { icon: Phone,      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', label: 'Contact Number', value: activeJob?.resident?.phone, isPhone: true },
                    { icon: MapPin,     iconBg: 'bg-red-50 dark:bg-red-900/20',       iconColor: 'text-red-500',     label: 'Address',         value: activeJob?.resident?.address },
                    { icon: DollarSign, iconBg: 'bg-amber-50 dark:bg-amber-900/20',   iconColor: 'text-amber-500',   label: 'Agreed Budget',   value: activeJob?.budget            },
                  ].map(({ icon: Icon, iconBg, iconColor, label, value, isPhone }) => (
                    <div key={label} className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`} aria-hidden="true">
                        <Icon size={14} className={iconColor} />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</dt>
                        <dd className="text-sm font-semibold text-skill-dark dark:text-white leading-snug">
                          {isPhone ? (
                            <a href={`tel:${value}`} className="underline underline-offset-2 hover:text-skill-primary transition-colors">
                              {value}
                            </a>
                          ) : value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Mark complete */}
              <div className="bg-white dark:bg-dark-card px-7 pb-7 pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={completeJob}
                  aria-label="Mark this job as complete"
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-skill-primary/25 active:scale-[0.98]"
                >
                  <CheckCircle2 size={17} aria-hidden="true" />
                  Mark Job as Complete
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-2.5 leading-relaxed">
                  The resident will be prompted to rate you after you mark this complete.
                </p>
              </div>
            </section>

            {/* Cash reminder */}
            <aside
              aria-label="Cash payment reminder"
              className="flex items-start gap-3 p-4 bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm"
            >
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex-shrink-0" aria-hidden="true">
                <AlertTriangle size={13} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-skill-dark dark:text-white mb-0.5">Cash Reminder</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  All transactions are cash-only. Only mark complete once the client confirms the work is satisfactory.
                </p>
              </div>
            </aside>
          </div>
        )}

      </main>
    </div>
  );
}