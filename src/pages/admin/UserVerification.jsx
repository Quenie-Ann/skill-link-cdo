import React, { useState, useEffect } from 'react';
import {
  BadgeCheck, XCircle, AlertCircle, Users,
  Search, Sun, Moon, Star, MapPin, Phone,
  Clock, FileText, CheckCircle2, X,
  Shield, Eye, SlidersHorizontal,
  UserCircle, Briefcase, ChevronRight, ChevronLeft,
  Home, UserCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';

const STATUS_CFG = {
  verified: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Verified' },
  pending:  { bg: 'bg-amber-100 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500',   label: 'Pending'  },
  flagged:  { bg: 'bg-orange-100 dark:bg-orange-900/20',   text: 'text-orange-700 dark:text-orange-400',   dot: 'bg-orange-500',  label: 'Flagged'  },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/20',         text: 'text-red-700 dark:text-red-400',         dot: 'bg-red-500',     label: 'Rejected' },
};

const TAB_FILTERS = ['All', 'Pending', 'Verified', 'Flagged', 'Rejected'];
const PAGE_SIZE   = 10;

function getUserStatus(u) {
  if (u.verification_status === 'flagged')  return 'flagged';
  if (u.verification_status === 'rejected') return 'rejected';
  if (u.is_verified)                        return 'verified';
  return 'pending';
}

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

export default function UserVerification() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userType, setUserType] = useState('workers');
  const [workers,   setWorkers]   = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab,  setActiveTab]  = useState('All');
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState(null);
  const [actionType, setActionType] = useState(null);
  const [reason,     setReason]     = useState('');
  const [actLoading, setActLoading] = useState(false);
  const [actError,   setActError]   = useState('');

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setPage(1); setActiveTab('All'); setSearchTerm(''); }, [userType]);
  useEffect(() => { setPage(1); }, [searchTerm, activeTab]);

  async function fetchAll() {
    try {
      setLoading(true); setError(null);
      const [w, r] = await Promise.all([
        api.getWorkers(),
        api.getResidents ? api.getResidents() : Promise.resolve([]),
      ]);
      setWorkers((w || []).map((worker) => ({
        ...worker,
        service:          worker.skill_category_name ?? '—',
        location:         worker.address             ?? '—',
        skills:           worker.skill_category_name ? [worker.skill_category_name] : [],
        rating:           parseFloat(worker.avg_rating) || 0,
        hourly_rate:      worker.declared_rate       ?? null,
        daily_rate:       worker.declared_rate       ?? null,
        experience_years: worker.years_experience    ?? 0,
        phone:            worker.contact_number      ?? '—',
        documents:        worker.documents           || [],
      })));
      setResidents((r || []).map((resident) => ({
        ...resident,
        location:  resident.address        ?? '—',
        phone:     resident.contact_number ?? '—',
        documents: resident.documents      || [],
      })));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const activeList = userType === 'workers' ? workers : residents;

  const counts = {
    all:      activeList.length,
    pending:  activeList.filter((u) => getUserStatus(u) === 'pending').length,
    verified: activeList.filter((u) => getUserStatus(u) === 'verified').length,
    flagged:  activeList.filter((u) => getUserStatus(u) === 'flagged').length,
    rejected: activeList.filter((u) => getUserStatus(u) === 'rejected').length,
  };

  const filtered = activeList.filter((u) => {
    const status      = getUserStatus(u);
    const matchTab    = activeTab === 'All' || status === activeTab.toLowerCase();
    const searchIn    = userType === 'workers'
      ? [u.full_name, u.service, ...(u.skills || [])]
      : [u.full_name, u.phone, u.location];
    const matchSearch = searchIn.some((s) => s?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(start, start + PAGE_SIZE);

  async function handleApprove(u) {
    setActLoading(true); setActError('');
    try {
      if (userType === 'workers') {
        await api.verifyWorker(u.id, true);
        setWorkers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_verified: true } : x));
      } else {
        await (api.verifyResident ? api.verifyResident(u.id, true) : Promise.resolve());
        setResidents((prev) => prev.map((x) => x.id === u.id ? { ...x, is_verified: true } : x));
      }
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  async function handleReject(u) {
    if (!reason.trim()) { setActError('A reason is required.'); return; }
    setActLoading(true); setActError('');
    try {
      if (userType === 'workers') {
        await api.verifyWorker(u.id, false);
        setWorkers((prev) => prev.filter((x) => x.id !== u.id));
      } else {
        await (api.verifyResident ? api.verifyResident(u.id, false) : Promise.resolve());
        setResidents((prev) => prev.filter((x) => x.id !== u.id));
      }
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  async function handleRevoke(u) {
    if (!reason.trim()) { setActError('A reason is required.'); return; }
    setActLoading(true); setActError('');
    try {
      if (userType === 'workers') {
        await api.verifyWorker(u.id, false);
        setWorkers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_verified: false } : x));
      } else {
        await (api.verifyResident ? api.verifyResident(u.id, false) : Promise.resolve());
        setResidents((prev) => prev.map((x) => x.id === u.id ? { ...x, is_verified: false } : x));
      }
      closeModal();
    } catch (err) { setActError(err.message); }
    finally { setActLoading(false); }
  }

  function openUser(u)   { setSelected(u); setActionType(null); setReason(''); setActError(''); }
  function closeModal()  { setSelected(null); setActionType(null); setReason(''); setActError(''); }
  function clearAction() { setActionType(null); setReason(''); setActError(''); }

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">User Verification</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              {userType === 'workers' ? 'Worker Management' : 'Resident Management'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={14} aria-hidden="true" />
              <input type="search"
                placeholder={userType === 'workers' ? 'Search name, service, skills…' : 'Search name, phone, location…'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={`Search ${userType}`}
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

        <div className="flex items-center gap-2 mb-6">
          {[
            { key: 'workers',   label: 'Workers',  icon: UserCheck, count: workers.length   },
            { key: 'residents', label: 'Residents', icon: Home,      count: residents.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} type="button" onClick={() => setUserType(key)} aria-pressed={userType === key}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                userType === key
                  ? 'bg-skill-primary text-white border-skill-primary shadow-lg shadow-skill-primary/20'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-skill-primary/30'
              }`}>
              <Icon size={15} aria-hidden="true" />
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                userType === key ? 'bg-white/20 text-white' : 'bg-skill-light dark:bg-dark-bg text-gray-400'
              }`}>{count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: `Total ${userType === 'workers' ? 'Workers' : 'Residents'}`, count: counts.all, icon: userType === 'workers' ? UserCheck : Home, isGradient: true },
            { label: 'Pending',  count: counts.pending,  icon: AlertCircle, cls: 'text-amber-600 dark:text-amber-400'    },
            { label: 'Verified', count: counts.verified, icon: BadgeCheck,  cls: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Flagged',  count: counts.flagged,  icon: AlertCircle, cls: 'text-orange-600 dark:text-orange-400'   },
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

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <SlidersHorizontal size={14} className="text-skill-primary flex-shrink-0" aria-hidden="true" />
          {TAB_FILTERS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-skill-primary text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:border-skill-primary/30'
              }`}>
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-skill-light dark:bg-dark-bg text-gray-400'
              }`}>{counts[tab.toLowerCase()] ?? counts.all}</span>
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0">
            {filtered.length} {userType === 'workers' ? 'worker' : 'resident'}{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <section aria-label={`${userType === 'workers' ? 'Workers' : 'Residents'} list`}
          className="bg-white dark:bg-dark-card rounded-xl border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-skill-primary border-t-transparent" aria-label="Loading" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              {userType === 'workers'
                ? <UserCheck size={36} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" aria-hidden="true" />
                : <Home size={36} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" aria-hidden="true" />
              }
              <p className="text-sm text-gray-400 font-medium">No {userType} match your search.</p>
              <button type="button" onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
                className="mt-3 text-skill-primary text-sm font-bold hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-skill-light/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-white/5">
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {userType === 'workers' ? 'Worker' : 'Resident'}
                      </th>
                      {userType === 'workers' ? (
                        <>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Location</th>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Skills</th>
                          <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Rating</th>
                          <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Rate/day</th>
                        </>
                      ) : (
                        <>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Location</th>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Phone</th>
                          <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">ID Submitted</th>
                        </>
                      )}
                      <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th scope="col" className="px-5 py-3.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {paginated.map((u, i) => {
                      const status = getUserStatus(u);
                      const cfg    = STATUS_CFG[status];
                      return (
                        <tr key={u.id} className="hover:bg-skill-light/30 dark:hover:bg-dark-bg/30 transition-colors">
                          <td className="px-5 py-4 text-[11px] text-gray-300 dark:text-gray-600 font-bold tabular-nums">{start + i + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-skill-light dark:bg-dark-bg flex items-center justify-center flex-shrink-0">
                                <UserCircle size={18} className="text-skill-primary" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-skill-dark dark:text-white truncate flex items-center gap-1">
                                  {u.full_name}
                                  {status === 'verified' && <BadgeCheck size={12} className="text-skill-primary flex-shrink-0" aria-label="Verified" />}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">{u.phone || '—'}</p>
                              </div>
                            </div>
                          </td>
                          {userType === 'workers' ? (
                            <>
                              <td className="px-4 py-4"><span className="text-xs font-medium text-skill-dark dark:text-gray-300">{u.service || '—'}</span></td>
                              <td className="px-4 py-4 hidden md:table-cell">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin size={9} aria-hidden="true" /> {u.location || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4 hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {(u.skills || []).slice(0, 2).map((s) => (
                                    <span key={s} className="text-[9px] px-2 py-0.5 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-400 rounded font-medium">{s}</span>
                                  ))}
                                  {(u.skills || []).length > 2 && (
                                    <span className="text-[9px] px-2 py-0.5 bg-skill-light dark:bg-dark-bg text-gray-400 rounded">+{u.skills.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center hidden md:table-cell">
                                {u.rating > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-skill-dark dark:text-white">
                                    {u.rating} <Star size={10} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                                  </span>
                                ) : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                              </td>
                              <td className="px-4 py-4 text-center hidden lg:table-cell">
                                <span className="text-xs font-medium text-skill-dark dark:text-gray-300">
                                  {u.hourly_rate ? `₱${u.hourly_rate}` : '—'}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 hidden md:table-cell">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin size={9} aria-hidden="true" /> {u.location || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4 hidden md:table-cell">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Phone size={9} aria-hidden="true" /> {u.phone || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4 hidden lg:table-cell">
                                <span className="text-[10px] px-2.5 py-1 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-300 rounded font-semibold">
                                  {u.documents && u.documents.length > 0
                                    ? (u.documents[0].doc_type === 'proof_of_residence' ? 'Proof of Residence' : 'Government-Issued ID')
                                    : 'No document'}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button type="button" onClick={() => openUser(u)} aria-label={`Review ${u.full_name}`}
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
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} {userType}
              </p>
            </>
          )}
        </section>
      </main>

      {selected && (
        <div role="dialog" aria-modal="true" aria-labelledby="umodal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={closeModal}>
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-7 text-white relative overflow-hidden flex-shrink-0">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <UserCircle size={28} className="text-skill-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="umodal-title" className="font-black text-lg flex items-center gap-2">
                        {selected.full_name}
                        {getUserStatus(selected) === 'verified' && <BadgeCheck size={16} className="text-skill-primary" />}
                      </h2>
                      <p className="text-skill-light/60 text-xs">
                        {userType === 'workers' ? `${selected.service} Specialist` : 'Resident'}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={closeModal} aria-label="Close"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    <X size={15} className="text-white/60" aria-hidden="true" />
                  </button>
                </div>
                {(() => {
                  const st = getUserStatus(selected); const cfg = STATUS_CFG[st];
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

            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {userType === 'workers' && (
                <>
                  <dl className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Phone,     label: 'Phone',      value: selected.phone || '—' },
                      { icon: MapPin,    label: 'Location',   value: selected.location || '—' },
                      { icon: Briefcase, label: 'Daily Rate', value: selected.daily_rate ? `₱${selected.daily_rate}/day` : '—' },
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
                      {selected.documents && selected.documents.length > 0 ? (
                        selected.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between px-4 py-3 bg-skill-light dark:bg-dark-bg rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText size={12} className="text-skill-primary" aria-hidden="true" />
                              <span className="text-xs font-semibold text-skill-dark dark:text-white">
                                {doc.doc_type === 'certification' ? 'Certification' :
                                 doc.doc_type === 'barangay_clearance' ? 'Barangay Clearance' :
                                 doc.doc_type === 'government_id' ? 'Government-Issued ID' : doc.doc_type}
                              </span>
                            </div>
                            <a href={`http://127.0.0.1:8000${doc.file}`} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-bold text-skill-primary hover:text-emerald-600 flex items-center gap-1 transition-colors">
                              <Eye size={10} aria-hidden="true" /> View
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic px-4 py-3">No documents uploaded.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {userType === 'residents' && (
                <>
                  <dl className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Phone,  label: 'Phone',    value: selected.phone    || '—' },
                      { icon: MapPin, label: 'Location', value: selected.location || '—' },
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FileText size={9} aria-hidden="true" /> Identity Documents
                    </p>
                    <p className="text-[10px] text-gray-400 italic mb-3">
                      Resident submits either a Government-Issued ID or Proof of Residence.
                    </p>
                    <div className="space-y-2">
                      {selected.documents && selected.documents.length > 0 ? (
                        selected.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between px-4 py-3 bg-skill-light dark:bg-dark-bg rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText size={12} className="text-skill-primary" aria-hidden="true" />
                              <span className="text-xs font-semibold text-skill-dark dark:text-white">
                                {doc.doc_type === 'government_id' ? 'Government-Issued ID' : 'Proof of Residence'}
                              </span>
                              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                Submitted
                              </span>
                            </div>
                            <a href={`http://127.0.0.1:8000${doc.file}`} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-bold text-skill-primary hover:text-emerald-600 flex items-center gap-1 transition-colors">
                              <Eye size={10} aria-hidden="true" /> View
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic px-4 py-3">No documents uploaded.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {(actionType === 'reject' || actionType === 'revoke') && (
                <div>
                  <label htmlFor="modal-reason" className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                    Reason <span aria-hidden="true">*</span>
                  </label>
                  <textarea id="modal-reason" rows={3} value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={actionType === 'reject'
                      ? `Explain why this ${userType === 'workers' ? 'worker' : 'resident'} is being rejected...`
                      : 'Explain why verification is being revoked...'}
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

            <div className="p-5 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              {getUserStatus(selected) === 'pending' && (
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

              {getUserStatus(selected) === 'verified' && (
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

              {(getUserStatus(selected) === 'flagged' || getUserStatus(selected) === 'rejected') && (
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