import React, { useState, useEffect } from 'react';
import {
  BadgeCheck, XCircle, AlertCircle, Users,
  Search, Sun, Moon, Star, MapPin, Phone,
  Clock, FileText, CheckCircle2, X,
  Shield, Eye, SlidersHorizontal,
  UserCircle, Briefcase, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';

// ─────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────
const STATUS_CFG = {
  verified:  { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Verified'  },
  pending:   { bg: 'bg-amber-100 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500',   label: 'Pending'   },
  suspended: { bg: 'bg-red-100 dark:bg-red-900/20',         text: 'text-red-700 dark:text-red-400',         dot: 'bg-red-500',     label: 'Suspended' },
};

const TAB_FILTERS = ['All', 'Pending', 'Verified', 'Suspended'];
const PAGE_SIZE   = 10;

function getWorkerStatus(w) {
  if (w.is_suspended) return 'suspended';
  if (w.is_verified)  return 'verified';
  return 'pending';
}

// ─────────────────────────────────────────
//  PAGINATION
// ─────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
      <p className="text-xs text-gray-400">
        Page <strong className="text-skill-dark dark:text-white">{current}</strong> of{' '}
        <strong className="text-skill-dark dark:text-white">{total}</strong>
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(current - 1)} disabled={current === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:text-skill-dark dark:hover:text-white hover:bg-skill-light dark:hover:bg-dark-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page">
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <button key={p} type="button" onClick={() => onChange(p)}
            aria-current={p === current ? 'page' : undefined}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              p === current
                ? 'bg-skill-primary text-white shadow-sm'
                : 'text-gray-400 hover:bg-skill-light dark:hover:bg-dark-bg hover:text-skill-dark dark:hover:text-white'
            }`}>
            {p}
          </button>
        ))}
        <button type="button" onClick={() => onChange(current + 1)} disabled={current === total}
          className="p-1.5 rounded-lg text-gray-400 hover:text-skill-dark dark:hover:text-white hover:bg-skill-light dark:hover:bg-dark-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page">
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────
export default function AdminWorkers() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [workers,      setWorkers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [activeTab,    setActiveTab]    = useState('All');
  const [page,         setPage]         = useState(1);

  // Modal state
  const [selected,     setSelected]     = useState(null);
  const [actionType,   setActionType]   = useState(null);
  const [reason,       setReason]       = useState('');
  const [actLoading,   setActLoading]   = useState(false);
  const [actError,     setActError]     = useState('');

  useEffect(() => { fetchWorkers(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, activeTab]);

  async function fetchWorkers() {
    try {
      setLoading(true); setError(null);
      const data = await api.getWorkers();
      setWorkers(data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const counts = {
    all:       workers.length,
    pending:   workers.filter((w) => getWorkerStatus(w) === 'pending').length,
    verified:  workers.filter((w) => getWorkerStatus(w) === 'verified').length,
    suspended: workers.filter((w) => getWorkerStatus(w) === 'suspended').length,
  };

  const filtered = workers.filter((w) => {
    const status = getWorkerStatus(w);
    const matchTab    = activeTab === 'All' || status === activeTab.toLowerCase();
    const matchSearch = [w.full_name, w.service, ...(w.skills || [])]
      .some((s) => s?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(start, start + PAGE_SIZE);

  // ── Actions ──
  async function handleApprove(w) {
    setActLoading(true); setActError('');
    try {
      await api.verifyWorker(w.id, true);
      setWorkers((prev) => prev.map((x) => x.id === w.id ? { ...x, is_verified: true } : x));
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  async function handleReject(w) {
    if (!reason.trim()) { setActError('A reason is required.'); return; }
    setActLoading(true); setActError('');
    try {
      await api.verifyWorker(w.id, false);
      setWorkers((prev) => prev.filter((x) => x.id !== w.id));
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  async function handleRevoke(w) {
    if (!reason.trim()) { setActError('A reason is required.'); return; }
    setActLoading(true); setActError('');
    try {
      await api.verifyWorker(w.id, false);
      setWorkers((prev) => prev.map((x) => x.id === w.id ? { ...x, is_verified: false } : x));
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  function openWorker(w)  { setSelected(w); setActionType(null); setReason(''); setActError(''); }
  function closeModal()   { setSelected(null); setActionType(null); setReason(''); setActError(''); }
  function clearAction()  { setActionType(null); setReason(''); setActError(''); }

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Worker Verification</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">User Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={14} aria-hidden="true" />
              <input type="search" placeholder="Search name, service, skills…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search workers"
                className="pl-9 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-lg border border-skill-primary/10 text-sm w-64 focus:ring-2 focus:ring-skill-primary outline-none dark:text-white" />
            </div>
            <NotificationBell />
            <button type="button" onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 bg-skill-light dark:bg-dark-bg rounded-lg text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all">
              {isDarkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {error && (
          <div role="alert" className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={14} aria-hidden="true" /> {error}
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Workers', count: counts.all,       icon: Users,       isGradient: true  },
            { label: 'Pending',       count: counts.pending,   icon: AlertCircle, cls: 'text-amber-600 dark:text-amber-400'    },
            { label: 'Verified',      count: counts.verified,  icon: BadgeCheck,  cls: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Suspended',     count: counts.suspended, icon: XCircle,     cls: 'text-red-600 dark:text-red-400'         },
          ].map(({ label, count, icon: Icon, isGradient, cls }) => (
            <div key={label} className={`rounded-xl p-5 border shadow-sm ${
              isGradient
                ? 'bg-gradient-to-br from-skill-dark to-[#064e3b] border-transparent shadow-skill-dark/20'
                : 'bg-white dark:bg-dark-card border-skill-primary/5 dark:border-white/5'
            }`}>
              <div className={`p-2 rounded-lg mb-3 w-fit ${isGradient ? 'bg-white/10' : 'bg-skill-light dark:bg-dark-bg'}`}>
                <Icon size={15} className={isGradient ? 'text-skill-primary' : cls} aria-hidden="true" />
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isGradient ? 'text-white/50' : 'text-gray-400'}`}>{label}</p>
              <p className={`text-3xl font-black ${isGradient ? 'text-white' : 'text-skill-dark dark:text-white'}`}>{count}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <SlidersHorizontal size={14} className="text-skill-primary flex-shrink-0" aria-hidden="true" />
          {TAB_FILTERS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-skill-primary text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:border-skill-primary/30'
              }`}>
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-skill-light dark:bg-dark-bg text-gray-400'
              }`}>
                {counts[tab.toLowerCase()] ?? counts.all}
              </span>
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0">
            {filtered.length} worker{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ══ TABLE ══ */}
        <section aria-label="Workers list" className="bg-white dark:bg-dark-card rounded-xl border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-skill-primary border-t-transparent" aria-label="Loading workers" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Users size={36} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-400 font-medium">No workers match your search.</p>
              <button type="button" onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
                className="mt-3 text-skill-primary text-sm font-bold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-skill-light/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-white/5">
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Worker</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Location</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Skills</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Rating</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Rate/hr</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th scope="col" className="px-5 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {paginated.map((w, i) => {
                      const status = getWorkerStatus(w);
                      const cfg    = STATUS_CFG[status];
                      return (
                        <tr key={w.id} className="hover:bg-skill-light/30 dark:hover:bg-dark-bg/30 transition-colors">

                          {/* # */}
                          <td className="px-5 py-4 text-[11px] text-gray-300 dark:text-gray-600 font-bold tabular-nums">
                            {start + i + 1}
                          </td>

                          {/* Worker */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-skill-light dark:bg-dark-bg flex items-center justify-center flex-shrink-0">
                                <UserCircle size={18} className="text-skill-primary" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-skill-dark dark:text-white truncate flex items-center gap-1">
                                  {w.full_name}
                                  {status === 'verified' && <BadgeCheck size={12} className="text-skill-primary flex-shrink-0" aria-label="Verified" />}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">{w.phone || '—'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="px-4 py-4">
                            <span className="text-xs font-medium text-skill-dark dark:text-gray-300">{w.service || '—'}</span>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-4 hidden md:table-cell">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin size={9} aria-hidden="true" /> {w.location || '—'}
                            </span>
                          </td>

                          {/* Skills */}
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(w.skills || []).slice(0, 2).map((s) => (
                                <span key={s} className="text-[9px] px-2 py-0.5 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-400 rounded font-medium">{s}</span>
                              ))}
                              {(w.skills || []).length > 2 && (
                                <span className="text-[9px] px-2 py-0.5 bg-skill-light dark:bg-dark-bg text-gray-400 rounded">+{w.skills.length - 2}</span>
                              )}
                            </div>
                          </td>

                          {/* Rating */}
                          <td className="px-4 py-4 text-center hidden md:table-cell">
                            {w.rating > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-skill-dark dark:text-white">
                                {w.rating} <Star size={10} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </td>

                          {/* Rate */}
                          <td className="px-4 py-4 text-center hidden lg:table-cell">
                            <span className="text-xs font-medium text-skill-dark dark:text-gray-300">
                              {w.hourly_rate ? `₱${w.hourly_rate}` : '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-center">
                            <button type="button" onClick={() => openWorker(w)}
                              aria-label={`Review ${w.full_name}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-skill-light dark:bg-dark-bg text-skill-primary border border-skill-primary/20 hover:bg-skill-primary hover:text-white rounded-lg text-xs font-bold transition-all">
                              <Eye size={11} aria-hidden="true" /> Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination current={page} total={totalPages} onChange={setPage} />

              <p className="text-center text-xs text-gray-400 pb-3">
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} workers
              </p>
            </>
          )}
        </section>
      </main>

      {/* ══ DETAIL MODAL ══ */}
      {selected && (
        <div role="dialog" aria-modal="true" aria-labelledby="wmodal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={closeModal}>
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden flex-shrink-0">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <UserCircle size={28} className="text-skill-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="wmodal-title" className="font-black text-lg flex items-center gap-2">
                        {selected.full_name}
                        {getWorkerStatus(selected) === 'verified' && <BadgeCheck size={16} className="text-skill-primary" />}
                      </h2>
                      <p className="text-skill-light/60 text-xs">{selected.service} Specialist</p>
                    </div>
                  </div>
                  <button type="button" onClick={closeModal} aria-label="Close"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    <X size={15} className="text-white/60" aria-hidden="true" />
                  </button>
                </div>
                {(() => {
                  const st = getWorkerStatus(selected); const cfg = STATUS_CFG[st];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { icon: Phone,     label: 'Phone',      value: selected.phone || '—' },
                  { icon: MapPin,    label: 'Location',   value: selected.location || '—' },
                  { icon: Briefcase, label: 'Rate',       value: selected.hourly_rate ? `₱${selected.hourly_rate}/hr` : '—' },
                  { icon: Clock,     label: 'Experience', value: selected.experience_years ? `${selected.experience_years} yrs` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-skill-light dark:bg-dark-bg rounded-lg p-3.5">
                    <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Icon size={9} aria-hidden="true" /> {label}
                    </dt>
                    <dd className="text-sm font-bold text-skill-dark dark:text-white truncate">{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(selected.skills || []).length > 0
                    ? selected.skills.map((s) => (
                        <span key={s} className="px-3 py-1.5 bg-skill-primary/10 text-skill-dark dark:text-skill-primary rounded-lg text-xs font-bold">{s}</span>
                      ))
                    : <p className="text-xs text-gray-400 italic">No skills listed</p>
                  }
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <FileText size={9} aria-hidden="true" /> Documents
                </p>
                <div className="space-y-2">
                  {['Government-Issued ID', 'Barangay Clearance'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between px-4 py-3 bg-skill-light dark:bg-dark-bg rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-skill-primary" aria-hidden="true" />
                        <span className="text-xs font-semibold text-skill-dark dark:text-white">{doc}</span>
                      </div>
                      <button type="button" className="text-[10px] font-bold text-skill-primary hover:text-emerald-600 flex items-center gap-1 transition-colors">
                        <Eye size={10} aria-hidden="true" /> View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {(actionType === 'reject' || actionType === 'revoke') && (
                <div>
                  <label htmlFor="modal-reason" className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                    Reason <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
                  </label>
                  <textarea id="modal-reason" rows={3} value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={actionType === 'reject' ? 'Explain why this worker is being rejected...' : 'Explain why verification is being revoked...'}
                    className="w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-red-200 dark:border-red-800 focus:border-red-500 rounded-lg outline-none text-sm dark:text-white resize-none transition-all" />
                  {actError && (
                    <p role="alert" className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={10} aria-hidden="true" /> {actError}
                    </p>
                  )}
                </div>
              )}

              {actError && !actionType && (
                <p role="alert" className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={10} aria-hidden="true" /> {actError}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              {getWorkerStatus(selected) === 'pending' && (
                actionType !== 'reject' ? (
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setActionType('reject'); setActError(''); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <XCircle size={14} aria-hidden="true" /> Reject
                    </button>
                    <button type="button" disabled={actLoading} onClick={() => handleApprove(selected)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-skill-primary hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-skill-primary/20">
                      {actLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><BadgeCheck size={14} aria-hidden="true" /> Approve</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button type="button" onClick={clearAction}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">Cancel</button>
                    <button type="button" disabled={actLoading} onClick={() => handleReject(selected)}
                      className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold text-sm transition-all">
                      {actLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Rejection'}
                    </button>
                  </div>
                )
              )}

              {getWorkerStatus(selected) === 'verified' && (
                actionType !== 'revoke' ? (
                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal}
                      className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">Close</button>
                    <button type="button" onClick={() => { setActionType('revoke'); setActError(''); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-amber-200 dark:border-amber-800 text-amber-600 font-bold text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">
                      <Shield size={13} aria-hidden="true" /> Revoke Verification
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button type="button" onClick={clearAction}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">Cancel</button>
                    <button type="button" disabled={actLoading} onClick={() => handleRevoke(selected)}
                      className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm transition-all">
                      {actLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Revocation'}
                    </button>
                  </div>
                )
              )}

              {getWorkerStatus(selected) === 'suspended' && (
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">Close</button>
                  <button type="button" disabled={actLoading} onClick={() => handleApprove(selected)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-skill-primary hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-skill-primary/20">
                    {actLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={13} aria-hidden="true" /> Re-verify</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}