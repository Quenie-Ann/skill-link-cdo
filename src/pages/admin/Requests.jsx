import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search, Filter, Calendar, AlertCircle,
  Sun, Moon, ClipboardList, CheckCircle2,
  Clock, Zap, XCircle, ChevronLeft,
  ChevronRight, MapPin, User, Briefcase,
  SlidersHorizontal, X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';


//  CONFIG
const PIPELINE = [
  { key: 'pending_match',   label: 'Pending Match',   icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'    },
  { key: 'offer_sent',      label: 'Offer Sent',      icon: Zap,          color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'        },
  { key: 'offer_accepted',  label: 'Offer Accepted',  icon: Briefcase,    color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20',  badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { key: 'completed',       label: 'Completed',       icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20',badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'},
  { key: 'cancelled',       label: 'Cancelled',       icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'            },
];
const STATUS_MAP  = Object.fromEntries(PIPELINE.map((p) => [p.key, p]));
const FILTER_TABS = ['All', ...PIPELINE.map((p) => p.key)];
const PAGE_SIZE   = 10;


//  PIPELINE STEPPER  (compact, for table row)
function MiniStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400">
        <XCircle size={10} aria-hidden="true" /> Cancelled
      </span>
    );
  }
  const steps      = PIPELINE.filter((p) => p.key !== 'cancelled');
  const currentIdx = steps.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0.5">
      {steps.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div
              title={step.label}
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                active ? 'bg-skill-primary shadow-sm shadow-skill-primary/30'
                : done  ? 'bg-skill-primary/30'
                :         'bg-gray-100 dark:bg-dark-bg'
              }`}
            >
              <step.icon size={8} aria-hidden="true" className={
                active ? 'text-white'
                : done  ? 'text-skill-primary'
                :         'text-gray-300 dark:text-gray-600'
              } />
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px w-3 flex-shrink-0 ${done || active ? 'bg-skill-primary/40' : 'bg-gray-100 dark:bg-dark-bg'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}


//  PAGINATION
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

//  MAIN COMPONENT
export default function AdminRequests() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page,         setPage]         = useState(1);
  const [selectedReq,  setSelectedReq]  = useState(null);

  useEffect(() => { fetchRequests(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, activeFilter]);

  async function fetchRequests() {
    try {
      setLoading(true); setError(null);
      const data = await api.getRequests();
      setRequests((data || []).map((req) => ({
        ...req,
        customer_name:   req.resident_name    ?? '—',
        service_type:    req.category_name    ?? '—',
        problem:         req.description      ?? '—',
        location:        req.location_address ?? '—',
        assigned_worker: null, // populated after offer_accepted in future
        budget:          req.budget_min && req.budget_max
          ? `₱${req.budget_min}–₱${req.budget_max}`
          : req.budget_min ? `₱${req.budget_min}` : '—',
      })));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }


  // Counts per status
  const counts = Object.fromEntries(
    PIPELINE.map(({ key }) => [key, requests.filter((r) => r.status === key).length])
  );

  const filtered = requests.filter((r) => {
    const matchFilter = activeFilter === 'All' || r.status === activeFilter;
    const matchSearch = [r.customer_name, r.service_type, r.assigned_worker]
      .some((s) => s?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">All Requests</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Service Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={14} aria-hidden="true" />
              <input type="search" placeholder="Search resident, service, worker…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search requests"
                className="pl-9 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-lg border border-skill-primary/10 text-sm w-64 focus:ring-2 focus:ring-skill-primary outline-none dark:text-white" />
            </div>
            <button type="button" onClick={fetchRequests}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-card border border-skill-primary/10 dark:border-white/5 rounded-lg hover:border-skill-primary text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all">
              <Filter size={13} aria-hidden="true" /> Refresh
            </button>
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

        {/* Pipeline Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {PIPELINE.map(({ key, label, icon: Icon, color, bg }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(activeFilter === key ? 'All' : key)}
              aria-pressed={activeFilter === key}
              className={`rounded-xl p-4 text-left border transition-all ${
                activeFilter === key
                  ? 'border-skill-primary bg-skill-primary/5 dark:bg-skill-primary/10 shadow-sm shadow-skill-primary/10'
                  : 'border-skill-primary/5 dark:border-white/5 bg-white dark:bg-dark-card hover:border-skill-primary/20'
              }`}>
              <div className={`p-2 rounded-lg mb-3 w-fit ${bg}`}>
                <Icon size={14} className={color} aria-hidden="true" />
              </div>
              <p className="text-2xl font-black text-skill-dark dark:text-white mb-0.5">{counts[key] ?? 0}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <SlidersHorizontal size={14} className="text-skill-primary flex-shrink-0" aria-hidden="true" />
          {FILTER_TABS.map((tab) => {
            const cfg = STATUS_MAP[tab];
            return (
              <button key={tab} type="button" onClick={() => setActiveFilter(tab)}
                aria-pressed={activeFilter === tab}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeFilter === tab
                    ? 'bg-skill-primary text-white shadow-sm'
                    : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:border-skill-primary/30'
                }`}>
                {cfg?.icon && <cfg.icon size={12} aria-hidden="true" />}
                {tab === 'All' ? 'All' : cfg?.label}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0">
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* TABLE */}
        <section aria-label="Requests list" className="bg-white dark:bg-dark-card rounded-xl border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-skill-primary border-t-transparent" aria-label="Loading requests" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <ClipboardList size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-400 font-medium">No requests match your filters.</p>
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')}
                  className="mt-3 text-skill-primary text-sm font-bold hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-skill-light/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-white/5">
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Resident</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Problem</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Accepted Worker</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Date</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Pipeline</th>
                      <th scope="col" className="px-5 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {paginated.map((req, i) => {
                      const cfg  = STATUS_MAP[req.status] || STATUS_MAP['pending_match'];
                      const Icon = cfg.icon;
                      return (
                        <tr key={req.id} className="hover:bg-skill-light/30 dark:hover:bg-dark-bg/30 transition-colors">

                          {/* # */}
                          <td className="px-5 py-4 text-[11px] text-gray-300 dark:text-gray-600 font-bold tabular-nums">
                            {start + i + 1}
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-4">
                            <p className="font-semibold text-skill-dark dark:text-white">{req.customer_name}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={9} aria-hidden="true" />
                              <span className="truncate max-w-[140px]">{req.location || '—'}</span>
                            </p>
                          </td>

                          {/* Service */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-skill-dark dark:text-gray-300">
                              <Icon size={11} className={cfg.color} aria-hidden="true" />
                              {req.service_type}
                            </span>
                          </td>

                          {/* Problem */}
                          <td className="px-4 py-4 hidden md:table-cell">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px] block">
                              {req.problem || '—'}
                            </span>
                          </td>

                          {/* Assigned Worker */}
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span className={`text-xs font-medium flex items-center gap-1 ${
                              req.assigned_worker
                                ? 'text-skill-dark dark:text-white'
                                : 'text-gray-300 dark:text-gray-600 italic'
                            }`}>
                              <User size={10} aria-hidden="true" />
                              {req.assigned_worker || 'Unassigned'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-center hidden md:table-cell">
                            <span className="text-xs text-gray-400">
                              {new Date(req.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </td>

                          {/* Pipeline stepper */}
                          <td className="px-4 py-4 text-center hidden lg:table-cell">
                            <MiniStepper status={req.status} />
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-center">
                            <button type="button" onClick={() => setSelectedReq(req)}
                              aria-label={`View request from ${req.customer_name}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-skill-light dark:bg-dark-bg text-skill-primary border border-skill-primary/20 hover:bg-skill-primary hover:text-white rounded-lg text-xs font-bold transition-all">
                              View
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
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} requests
              </p>
            </>
          )}
        </section>
      </main>

      {/* DETAIL MODAL */}
      {selectedReq && (
        <div role="dialog" aria-modal="true" aria-labelledby="rmodal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={() => setSelectedReq(null)}>
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden flex-shrink-0">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-skill-primary" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-skill-primary">
                      Request #{selectedReq.id}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedReq(null)} aria-label="Close"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    <X size={14} className="text-white/50" aria-hidden="true" />
                  </button>
                </div>
                <h2 id="rmodal-title" className="text-xl font-black mb-1">{selectedReq.customer_name}</h2>
                <p className="text-skill-light/60 text-xs">{selectedReq.service_type}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-skill-primary/10 rounded-full blur-2xl" aria-hidden="true" />
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">

              {/* Full pipeline stepper */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>
                <div className="flex items-center justify-between bg-skill-light dark:bg-dark-bg rounded-lg p-4">
                  {PIPELINE.filter((p) => p.key !== 'cancelled').map((step, idx, arr) => {
                    const currentIdx  = arr.findIndex((s) => s.key === selectedReq.status);
                    const isCancelled = selectedReq.status === 'cancelled';
                    const isDone      = !isCancelled && idx < currentIdx;
                    const isActive    = !isCancelled && idx === currentIdx;
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive ? 'bg-skill-primary shadow-lg shadow-skill-primary/30'
                            : isDone ? 'bg-skill-primary/30'
                            :          'bg-gray-100 dark:bg-dark-card'
                          }`}>
                            <step.icon size={13} aria-hidden="true" className={
                              isActive ? 'text-white'
                              : isDone  ? 'text-skill-primary'
                              :           'text-gray-300 dark:text-gray-600'
                            } />
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider text-center leading-tight max-w-[40px] ${
                            isActive ? 'text-skill-primary' : 'text-gray-400'
                          }`}>{step.label}</span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className={`flex-1 h-px mb-5 ${isDone || isActive ? 'bg-skill-primary/40' : 'bg-gray-200 dark:bg-dark-card'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {selectedReq.status === 'cancelled' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500 font-bold">
                    <XCircle size={12} aria-hidden="true" /> This request was cancelled.
                  </div>
                )}
              </div>

              {/* Details */}
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Resident', value: selectedReq.customer_name,  icon: User      },
                  { label: 'Service',  value: selectedReq.service_type,   icon: Briefcase },
                  { label: 'Date',     value: new Date(selectedReq.created_at).toLocaleDateString(), icon: Calendar },
                  { label: 'Budget',   value: selectedReq.budget
                      ? String(selectedReq.budget).replace(/\/hr$/i, '').trim() || '—'
                      : '—',                                               icon: Briefcase },
                  ...(
                    ['offer_accepted', 'completed'].includes(selectedReq.status)
                      ? [{ label: 'Accepted Worker', value: selectedReq.assigned_worker || '—', icon: User }]
                      : []
                  ),
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-skill-light dark:bg-dark-bg rounded-lg p-3.5">
                    <dt className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Icon size={9} aria-hidden="true" /> {label}
                    </dt>
                    <dd className="text-xs font-bold text-skill-dark dark:text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              <button type="button" onClick={() => setSelectedReq(null)}
                className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}