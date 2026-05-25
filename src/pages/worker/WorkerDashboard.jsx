import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import { api } from '../../services/api';
import {
  Zap, Sun, Moon, MapPin,
  CheckCircle2, XCircle, Star, BadgeCheck,
  ChevronRight, Phone, User, Briefcase,
  Calendar, DollarSign, Clock, X,
  Navigation, AlertTriangle
} from 'lucide-react';


//  STAT PILL
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

//  MAIN COMPONENT
export default function WorkerDashboard() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [worker,        setWorker]        = useState(null);
  const [incomingJob,   setIncomingJob]   = useState(null);
  const [activeJob,     setActiveJob]     = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [commitDate,    setCommitDate]    = useState('');
  const [completing,    setCompleting]    = useState(false);
  const [activeTab,     setActiveTab]     = useState('offers'); // 'offers' | 'inprogress'

  // On mount: fetch profile, incoming pending offer, AND active accepted job.
  // activeJob was previously pure in-memory state (set only in handleAccept).
  // Navigating away and returning reset it to null because useEffect never
  // rehydrated it from the API. Now getActiveJob() is called on every mount
  // so the In Progress tab correctly restores after navigation.
  useEffect(() => {
    async function fetchData() {
      const [profile, incomingRaw, activeRaw, stats] = await Promise.all([
        api.getProfile(),
        api.getIncomingJob(),
        api.getActiveJob(),
        api.getWorkerStats().catch(() => ({ total_completed: 0 })),
      ]);

      setWorker({
        ...profile,
        service:    profile.skill_category_name ?? 'Specialist',
        rating:     parseFloat(profile.avg_rating) || 0,
        // FE-013: populated from WorkerStatsView (GET /api/worker/stats/)
        // which counts offers where status='accepted' AND request status='completed'.
        jobs_done:  stats?.total_completed ?? 0,
        daily_rate: profile.declared_rate ?? 0,
        phone:      profile.contact_number ?? '—',
      });

      // Restore active job from API if one exists (offer status = accepted,
      // request status = offer_accepted). This covers the navigation-away case.
      if (activeRaw && activeRaw.id) {
        setActiveJob({
          id:              activeRaw.id,
          problem:         activeRaw.request_title       ?? 'Job Request',
          description:     activeRaw.request_description ?? '—',
          service:         activeRaw.category_name       ?? '—',
          distance:        '—',
          accepted_at:     '—',
          confirmed_date:  activeRaw.preferred_start_date
                             ? new Date(activeRaw.preferred_start_date)
                                 .toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                             : '—',
          confirmed_price: `₱${profile.declared_rate ?? '—'}/day`,
          resident: {
            name:    activeRaw.resident_name    ?? '—',
            phone:   '—',
            address: activeRaw.request_location ?? '—',
          },
        });
        // Auto-switch to In Progress tab so the worker sees the active job
        setActiveTab('inprogress');
      } else {
        setActiveJob(null);
      }

      // Only set incoming if API explicitly says has_offer: true
      const incoming = incomingRaw?.has_offer ? incomingRaw.offer : null;
      if (incoming && incoming.id) {
        setIncomingJob({
          ...incoming,
          problem:         incoming.request_title       ?? 'Job Request',
          description:     incoming.request_description ?? '—',
          service:         incoming.category_name       ?? '—',
          match_score:     incoming.match_score         ?? 0,
          distance:        '—',
          schedule:        '—',
          preferred_start: '—',
          resident: {
            name:    incoming.resident_name    ?? '—',
            address: incoming.request_location ?? '—',
          },
        });
      } else {
        setIncomingJob(null);
      }
    }
    fetchData().catch(console.error);
  }, []);

  // Accept: close modal, promote incomingJob → activeJob with confirmed date + rate
  function handleAccept() {
    const confirmed = {
      ...incomingJob,
      problem:         incomingJob.problem,
      resident:        incomingJob.resident,
      distance:        incomingJob.distance,
      accepted_at:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confirmed_date:  new Date(commitDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      confirmed_price: `₱${worker.daily_rate}/day`,
    };
    api.acceptMatch(incomingJob.id).catch(console.error);
    setShowDateModal(false);
    setIncomingJob(null);
    setActiveJob(confirmed);
    setActiveTab('inprogress'); // auto-switch to show the active job
  }

  // Decline: clear the offer, stay on offers tab
  function handleDecline() {
    api.declineMatch(incomingJob.id).catch(console.error);
    setIncomingJob(null);
  }

  // Complete: clear active job, switch back to offers tab
  async function handleComplete() {
    setCompleting(true);
    try {
      await api.markJobComplete(activeJob.id);
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
      setActiveJob(null);
      setActiveTab('offers');
    }
  }

  // D-02: Online/Offline toggle removed — documented as future enhancement

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* HEADER */}
      <header
        role="banner"
        className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-6 py-4"
      >
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <div>
            {/* Renamed from "Job Matches" — we'll use resident-initiated offers for the worker to accept */}
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Job Offers</h1>
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

        {/* WORKER IDENTITY CARD */}
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
          </div>

          {/* Stats */}
          <div className="flex gap-2 mt-4 flex-wrap" role="list" aria-label="Worker statistics">
            <div role="listitem"><StatPill icon={Star}         label="Rating"     value={worker.rating}                    highlight /></div>
            <div role="listitem"><StatPill icon={CheckCircle2} label="Jobs Done"  value={worker.jobs_done}                          /></div>
            <div role="listitem"><StatPill icon={DollarSign}   label="Daily Rate" value={`₱${worker.daily_rate}`}                    /></div>
          </div>
        </section>


        {/* TAB BAR */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm flex overflow-hidden"
        >
          {[
            { id: 'offers',     label: 'Job Offers',  Icon: Zap,      badge: !!incomingJob },
            { id: 'inprogress', label: 'In Progress',  Icon: Briefcase, badge: !!activeJob  },
          ].map(({ id, label, Icon, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-black transition-all border-b-2 ${
                  isActive
                    ? 'text-skill-primary border-skill-primary bg-skill-primary/5'
                    : 'text-gray-400 border-transparent hover:text-skill-dark dark:hover:text-white'
                }`}
              >
                <Icon size={13} aria-hidden="true" />
                {label}
                {badge && (
                  <span className="w-4 h-4 rounded-full bg-skill-primary text-white text-[9px] font-black flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            );
          })}
        </div>


        {/* ── OFFERS PANEL ── */}
        <div role="tabpanel" id="panel-offers" hidden={activeTab !== 'offers'}>

          {/* Waiting state */}
          {!incomingJob && (
            <section
              aria-labelledby="waiting-heading"
              aria-live="polite"
              className="bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <div className="px-8 py-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6" aria-hidden="true">
                  <div className="absolute inset-0 bg-skill-primary/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-3 bg-skill-primary/15 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                  <div className="relative w-24 h-24 bg-skill-primary/10 border-2 border-skill-primary/20 rounded-full flex items-center justify-center">
                    <Zap size={30} className="text-skill-primary" />
                  </div>
                </div>
                <h2 id="waiting-heading" className="text-lg font-black text-skill-dark dark:text-white mb-2">
                  Waiting for Offers
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs mx-auto">
                  You're visible to residents. When a resident selects you from their matched results, their offer will appear here.
                </p>
                <div className="flex justify-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-skill-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Incoming offer card */}
          {incomingJob && (
            <section
              aria-labelledby="incoming-heading"
              aria-live="assertive"
              aria-atomic="true"
              className="rounded-lg overflow-hidden shadow-2xl shadow-skill-dark/20 border border-skill-primary/20"
            >
              <header className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="flex items-center gap-2 mb-3">
                        <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skill-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-skill-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-skill-primary">New Job Offer</span>
                      </p>
                      <h2 id="incoming-heading" className="text-xl font-black leading-tight mb-1.5">{incomingJob?.problem}</h2>
                      <p className="text-skill-light/50 text-xs flex items-center gap-1.5">
                        <Navigation size={9} aria-hidden="true" />
                        <span>{incomingJob?.distance}</span>
                        <span className="opacity-30 mx-1" aria-hidden="true">·</span>
                        <span>Request {incomingJob?.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-5 flex-wrap" role="list" aria-label="Offer details">
                    <span role="listitem" className="flex items-center gap-1.5 bg-skill-primary/20 border border-skill-primary/30 rounded-xl px-3 py-1.5">
                      <Zap size={10} className="text-skill-primary" aria-hidden="true" />
                      <span className="text-[10px] font-black text-skill-primary">{incomingJob?.match_score}% ML Match</span>
                    </span>
                    <span role="listitem" className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                      <Briefcase size={10} className="text-white/50" aria-hidden="true" />
                      <span className="text-[10px] font-bold text-white/50">{incomingJob?.service}</span>
                    </span>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
              </header>

              <div className="bg-white dark:bg-dark-card px-7 pt-6 pb-5 space-y-4">
                <blockquote className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-l-2 border-skill-primary/30 pl-3 italic">
                  {incomingJob?.description}
                </blockquote>
                <dl className="space-y-3">
                  {[
                    // FE-012: Only fields actually returned by JobOfferSerializer are listed here.
                    // 'Preferred Start' and 'Preferred Schedule' removed — JobOffer has no such
                    // fields; those belong to JobRequest and are not forwarded by the serializer,
                    // so both rendered as '—'. Replaced with Category and Rate which are available.
                    { icon: User,       iconBg: 'bg-blue-50 dark:bg-blue-900/20',       iconColor: 'text-blue-500',    label: 'Resident',        value: incomingJob?.resident?.name    },
                    { icon: MapPin,     iconBg: 'bg-red-50 dark:bg-red-900/20',         iconColor: 'text-red-500',     label: 'Service Address', value: incomingJob?.resident?.address },
                    { icon: Briefcase,  iconBg: 'bg-purple-50 dark:bg-purple-900/20',   iconColor: 'text-purple-500',  label: 'Category',        value: incomingJob?.service           },
                    { icon: DollarSign, iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', label: 'Your Rate',       value: worker ? `₱${worker.daily_rate}/day` : '—' },
                  ].map(({ icon: Icon, iconBg, iconColor, label, value }) => (
                    <div key={label} className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`} aria-hidden="true"><Icon size={14} className={iconColor} /></div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</dt>
                        <dd className="text-sm font-semibold text-skill-dark dark:text-white leading-snug">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-white dark:bg-dark-card px-7 pb-7 pt-3 flex gap-3 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={handleDecline} aria-label={`Decline offer: ${incomingJob?.problem}`}
                  className="flex-none flex items-center gap-2 px-5 py-3.5 rounded-lg border-2 border-gray-200 dark:border-white/10 text-sm font-bold text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                  <XCircle size={15} aria-hidden="true" /> Decline
                </button>
                <button type="button" onClick={() => { setCommitDate(''); setShowDateModal(true); }} aria-label={`Accept offer: ${incomingJob?.problem}`}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-skill-primary hover:bg-emerald-600 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-skill-primary/25 active:scale-[0.98]">
                  <CheckCircle2 size={17} aria-hidden="true" /> Accept Offer
                </button>
              </div>
            </section>
          )}

        </div>{/* end offers panel */}


        {/* ── IN PROGRESS PANEL ── */}
        <div role="tabpanel" id="panel-inprogress" hidden={activeTab !== 'inprogress'}>

          {/* Empty state */}
          {!activeJob && (
            <section className="bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="px-8 py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center" aria-hidden="true">
                  <Briefcase size={30} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h2 className="text-lg font-black text-skill-dark dark:text-white mb-2">No Active Job</h2>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto mb-6">
                  Jobs you accept will appear here. You can track progress and mark them complete from this tab.
                </p>
                <button type="button" onClick={() => setActiveTab('offers')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-skill-primary hover:text-emerald-600 transition-colors">
                  <Zap size={12} aria-hidden="true" /> View Job Offers
                </button>
              </div>
            </section>
          )}

          {/* Active job card */}
          {activeJob && (
            <div className="space-y-4">
              <section aria-labelledby="active-heading" className="rounded-lg overflow-hidden shadow-lg border border-skill-primary/20">
                <header className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="flex items-center gap-2 mb-3">
                      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-skill-primary">Job In Progress</span>
                    </p>
                    <h2 id="active-heading" className="text-xl font-black leading-tight mb-1">{activeJob?.problem}</h2>
                    <p className="text-skill-light/50 text-xs flex items-center gap-1.5">
                      <Navigation size={9} aria-hidden="true" />
                      <span>{activeJob?.distance}</span>
                      <span className="opacity-30 mx-1" aria-hidden="true">·</span>
                      <span>Accepted {activeJob?.accepted_at}</span>
                    </p>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
                </header>

                <div className="bg-white dark:bg-dark-card px-7 pt-6 pb-5">
                  <dl className="space-y-3">
                    {[
                      { icon: User,       iconBg: 'bg-blue-50 dark:bg-blue-900/20',       iconColor: 'text-blue-500',    label: 'Client',          value: activeJob?.resident?.name,    isPhone: false },
                      { icon: Phone,      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', label: 'Contact Number',  value: activeJob?.resident?.phone,   isPhone: true  },
                      { icon: MapPin,     iconBg: 'bg-red-50 dark:bg-red-900/20',         iconColor: 'text-red-500',     label: 'Address',         value: activeJob?.resident?.address, isPhone: false },
                      { icon: Calendar,   iconBg: 'bg-purple-50 dark:bg-purple-900/20',   iconColor: 'text-purple-500',  label: 'Confirmed Start', value: activeJob?.confirmed_date,    isPhone: false },
                      { icon: DollarSign, iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', label: 'Confirmed Rate',  value: activeJob?.confirmed_price,   isPhone: false },
                    ].map(({ icon: Icon, iconBg, iconColor, label, value, isPhone }) => (
                      <div key={label} className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`} aria-hidden="true"><Icon size={14} className={iconColor} /></div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</dt>
                          <dd className="text-sm font-semibold text-skill-dark dark:text-white leading-snug">
                            {isPhone
                              ? <a href={`tel:${value}`} className="underline underline-offset-2 hover:text-skill-primary transition-colors">{value}</a>
                              : value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="bg-white dark:bg-dark-card px-7 pb-7 pt-3 border-t border-gray-100 dark:border-white/5">
                  <button type="button" onClick={handleComplete} disabled={completing} aria-label="Mark this job as complete"
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-skill-primary hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-skill-primary/25 active:scale-[0.98]">
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {completing ? 'Marking Complete…' : 'Mark Job as Complete'}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-2.5 leading-relaxed">
                    The resident will be prompted to rate you after you mark this complete.
                  </p>
                </div>
              </section>

              <aside aria-label="Cash payment reminder" className="flex items-start gap-3 p-4 bg-white dark:bg-dark-card rounded-lg border border-skill-primary/5 dark:border-white/5 shadow-sm">
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
        </div>{/* end in-progress panel */}

        {/* DATE COMMITMENT MODAL */}
        {showDateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
            onClick={() => setShowDateModal(false)}
          >
            <div
              className="bg-white dark:bg-dark-card rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div>
                  <h3 className="font-black text-skill-dark dark:text-white text-base">Confirm Start Date</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">
                    Job: <span className="text-skill-primary">{incomingJob?.problem ?? '—'}</span>
                  </p>
                </div>
                <button onClick={() => setShowDateModal(false)} className="p-2 hover:bg-skill-light dark:hover:bg-dark-bg rounded-xl transition-all">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Pick the date you will start this job. This date will be shown to the resident once you accept.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Your Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={commitDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCommitDate(e.target.value)}
                    className="w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg outline-none transition-all text-sm dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <DollarSign size={14} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    Your confirmed rate of <span className="font-black">₱{worker?.daily_rate}/day</span> will be shown to the resident.
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setShowDateModal(false)}
                  className="px-5 py-3 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">
                  Cancel
                </button>
                <button disabled={!commitDate} onClick={handleAccept}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-skill-primary hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-black text-sm transition-all shadow-lg shadow-skill-primary/20">
                  <CheckCircle2 size={15} /> Confirm &amp; Accept
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}