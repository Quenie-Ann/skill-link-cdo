// src/pages/admin/RateGovernance.jsx
// Admin page for managing:
//   1. Skill Categories  — create, rename, deactivate
//   2. Job Types         — per-category problem list (replaces mockData hardcoding)
//   3. Rate Bands        — set min/max rate per category
//
// API calls (all admin-authenticated):
//   GET    /api/skill-categories/                           → list categories
//   POST   /api/admin/skill-categories/                     → create category
//   PATCH  /api/admin/skill-categories/<id>/                → rename / toggle
//   DELETE /api/admin/skill-categories/<id>/                → deactivate
//   GET    /api/skill-categories/<id>/job-types/            → list job types
//   POST   /api/admin/skill-categories/<id>/job-types/      → add job type
//   DELETE /api/admin/job-types/<id>/                       → remove job type
//   GET    /api/admin/rate-bands/                           → all bands overview
//   POST   /api/admin/skill-categories/<id>/rate-band/      → set band


import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import {
  Sun, Moon, Plus, X, ChevronDown, ChevronRight,
  Tag, Wrench, DollarSign, AlertCircle, CheckCircle2,
  Edit3, Trash2, Save, RefreshCw, Info,
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('barangayskill_session'))?.access || '';
  } catch { return ''; }
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = res.status === 204 ? {} : await res.json();
  if (!res.ok) throw new Error(
    typeof data === 'object'
      ? (data.error || data.detail || Object.values(data).flat().join(' '))
      : 'Request failed.'
  );
  return data;
}

// Small reusable components 

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 bg-skill-primary/10 rounded-xl">
        <Icon size={18} className="text-skill-primary" />
      </div>
      <div>
        <h2 className="font-bold text-skill-dark dark:text-white text-base">{title}</h2>
        {subtitle && (
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
      active
        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
        : 'bg-gray-100 dark:bg-dark-bg text-gray-400'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-bold max-w-sm ${
      type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
    }`}>
      {type === 'success'
        ? <CheckCircle2 size={16} />
        : <AlertCircle size={16} />}
      {message}
      <button onClick={onDismiss} className="ml-auto">
        <X size={14} />
      </button>
    </div>
  );
}

// Main Component

export default function RateGovernance() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [categories,    setCategories]    = useState([]);
  const [rateBands,     setRateBands]     = useState({});   // { category_id: { min, max } }
  const [jobTypes,      setJobTypes]      = useState({});   // { category_id: [{ id, name }] }
  const [expandedCat,   setExpandedCat]   = useState(null); // uuid of expanded category row
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null); // { message, type }

  // New category form
  const [newCatName,    setNewCatName]    = useState('');
  const [newCatDesc,    setNewCatDesc]    = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Edit category inline
  const [editingCat,    setEditingCat]    = useState(null); // uuid
  const [editCatName,   setEditCatName]   = useState('');

  // New job type form (per expanded category)
  const [newJobType,    setNewJobType]    = useState('');
  const [jtSubmitting,  setJtSubmitting]  = useState(false);

  // Rate band form (per expanded category)
  const [bandMin,       setBandMin]       = useState('');
  const [bandMax,       setBandMax]       = useState('');
  const [bandSubmitting,setBandSubmitting]= useState(false);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Load categories + rate band overview 
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, bands] = await Promise.all([
        apiFetch('/skill-categories/'),
        apiFetch('/admin/rate-bands/'),
      ]);
      setCategories(cats || []);
      const bandMap = {};
      (bands || []).forEach((b) => {
        bandMap[b.category_id] = {
          min: b.min_rate,
          max: b.max_rate,
          set: b.band_set,
          effective_date: b.effective_date,
        };
      });
      setRateBands(bandMap);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load job types for a category when it is expanded 
  const loadJobTypes = useCallback(async (categoryId) => {
    if (jobTypes[categoryId]) return; // already loaded
    try {
      const data = await apiFetch(`/skill-categories/${categoryId}/job-types/`);
      setJobTypes((prev) => ({ ...prev, [categoryId]: data || [] }));
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [jobTypes, notify]);

  function toggleExpand(catId) {
    if (expandedCat === catId) {
      setExpandedCat(null);
    } else {
      setExpandedCat(catId);
      loadJobTypes(catId);
      // Pre-fill rate band form from loaded data
      const band = rateBands[catId];
      setBandMin(band?.min ?? '');
      setBandMax(band?.max ?? '');
      setNewJobType('');
    }
  }

  // Category CRUD 
  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSubmitting(true);
    try {
      const created = await apiFetch('/admin/skill-categories/', {
        method: 'POST',
        body: JSON.stringify({
          category_name: newCatName.trim(),
          description:   newCatDesc.trim(),
        }),
      });
      setCategories((prev) => [...prev, created]);
      setNewCatName('');
      setNewCatDesc('');
      notify(`Category "${created.category_name}" created.`);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setCatSubmitting(false);
    }
  }

  async function handleSaveCatName(catId) {
    if (!editCatName.trim()) return;
    try {
      const updated = await apiFetch(`/admin/skill-categories/${catId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ category_name: editCatName.trim() }),
      });
      setCategories((prev) =>
        prev.map((c) => c.id === catId ? { ...c, category_name: updated.category_name } : c)
      );
      setEditingCat(null);
      notify('Category renamed.');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleDeactivateCategory(catId, name) {
    if (!window.confirm(
      `Deactivate "${name}"? Workers already in this category are unaffected, but it will no longer appear for new registrations.`
    )) return;
    try {
      await apiFetch(`/admin/skill-categories/${catId}/`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      notify(`"${name}" deactivated.`);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Job type CRUD 
  async function handleAddJobType(catId) {
    if (!newJobType.trim()) return;
    setJtSubmitting(true);
    try {
      const created = await apiFetch(
        `/admin/skill-categories/${catId}/job-types/`,
        { method: 'POST', body: JSON.stringify({ name: newJobType.trim() }) }
      );
      setJobTypes((prev) => ({
        ...prev,
        [catId]: [...(prev[catId] || []), created],
      }));
      setNewJobType('');
      notify(`Job type "${created.name}" added.`);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setJtSubmitting(false);
    }
  }

  async function handleDeleteJobType(catId, jtId, name) {
    try {
      await apiFetch(`/admin/job-types/${jtId}/`, { method: 'DELETE' });
      setJobTypes((prev) => ({
        ...prev,
        [catId]: (prev[catId] || []).filter((j) => j.id !== jtId),
      }));
      notify(`"${name}" removed.`);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Rate band 
  async function handleSetRateBand(catId, catName) {
    const min = parseFloat(bandMin);
    const max = parseFloat(bandMax);

    if (isNaN(min) || isNaN(max)) {
      notify('Both min and max must be numbers.', 'error');
      return;
    }
    if (min < 0 || max < 0) {
      notify('Rates cannot be negative.', 'error');
      return;
    }
    if (min >= max) {
      notify('Minimum must be less than maximum.', 'error');
      return;
    }

    setBandSubmitting(true);
    try {
      const band = await apiFetch(
        `/admin/skill-categories/${catId}/rate-band/`,
        {
          method: 'POST',
          body: JSON.stringify({ min_rate: min, max_rate: max }),
        }
      );
      setRateBands((prev) => ({
        ...prev,
        [catId]: { min: band.min_rate, max: band.max_rate, set: true, effective_date: band.effective_date },
      }));
      notify(
        `Rate band for "${catName}" set: ₱${min} – ₱${max}. ` +
        `Run enforce_rate_bands to flag out-of-band workers.`
      );
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBandSubmitting(false);
    }
  }

  // Render
  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">
              Rate Governance
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Categories · Job Types · Rate Bands
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 text-xs font-bold text-skill-primary hover:underline"
            >
              <RefreshCw size={13} /> Refresh
            </button>
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

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            Skill categories and job types defined here replace the hardcoded lists in the
            frontend. Rate bands set here are enforced at worker registration — a declared
            rate outside the band auto-flags the profile for admin review.
            After updating a rate band, run{' '}
            <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">
              python manage.py enforce_rate_bands
            </code>{' '}
            to apply the new band to existing workers.
          </p>
        </div>

        {/* ── Section 1: Create new category ── */}
        <section className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
          <SectionHeader
            icon={Tag}
            title="Skill Categories"
            subtitle="Create and manage categories"
          />

          <form onSubmit={handleCreateCategory} className="flex items-end gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Plumbing"
                className="w-full px-4 py-2.5 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg text-sm dark:text-white outline-none transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="e.g. Residential and commercial pipe work"
                className="w-full px-4 py-2.5 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg text-sm dark:text-white outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={catSubmitting || !newCatName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all flex-shrink-0"
            >
              <Plus size={14} />
              {catSubmitting ? 'Adding…' : 'Add Category'}
            </button>
          </form>

          {/* Category list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-skill-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 italic">
              No categories yet. Add one above.
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const isExpanded = expandedCat === cat.id;
                const band       = rateBands[cat.id];
                const types      = jobTypes[cat.id] || [];

                return (
                  <div
                    key={cat.id}
                    className="border border-skill-primary/10 dark:border-white/5 rounded-xl overflow-hidden"
                  >
                    {/* Category row */}
                    <div className="flex items-center gap-3 px-5 py-4 bg-skill-light/50 dark:bg-dark-bg/50">

                      <button
                        onClick={() => toggleExpand(cat.id)}
                        className="flex-shrink-0 text-skill-primary"
                      >
                        {isExpanded
                          ? <ChevronDown size={16} />
                          : <ChevronRight size={16} />}
                      </button>

                      {/* Name — inline edit */}
                      {editingCat === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            autoFocus
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-dark-card border-2 border-skill-primary rounded-lg text-sm dark:text-white outline-none"
                          />
                          <button
                            onClick={() => handleSaveCatName(cat.id)}
                            className="p-1.5 bg-skill-primary text-white rounded-lg hover:bg-emerald-600 transition-all"
                          >
                            <Save size={13} />
                          </button>
                          <button
                            onClick={() => setEditingCat(null)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-bold text-skill-dark dark:text-white text-sm">
                            {cat.category_name}
                          </span>
                          <StatusBadge active={cat.is_active} />
                        </div>
                      )}

                      {/* Rate band summary */}
                      <div className="hidden md:block text-xs text-gray-400 flex-shrink-0">
                        {band?.set
                          ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ₱{band.min} – ₱{band.max}
                            </span>
                          : <span className="text-amber-500 font-bold">No band set</span>
                        }
                      </div>

                      {/* Job type count */}
                      <div className="hidden lg:block text-xs text-gray-400 flex-shrink-0 w-24 text-right">
                        {isExpanded
                          ? `${types.length} job type${types.length !== 1 ? 's' : ''}`
                          : ''}
                      </div>

                      {/* Actions */}
                      {editingCat !== cat.id && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingCat(cat.id);
                              setEditCatName(cat.category_name);
                            }}
                            className="p-1.5 text-gray-400 hover:text-skill-primary transition-colors"
                            title="Rename"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeactivateCategory(cat.id, cat.category_name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div className="px-5 py-5 border-t border-skill-primary/5 dark:border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ── Job Types ── */}
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Wrench size={10} /> Job Types (Specific Problems)
                          </p>

                          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                            {types.length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-2">
                                No job types yet. Add below.
                              </p>
                            ) : (
                              types.map((jt) => (
                                <div
                                  key={jt.id}
                                  className="flex items-center justify-between px-3 py-2 bg-skill-light dark:bg-dark-bg rounded-lg"
                                >
                                  <span className="text-xs text-skill-dark dark:text-white font-medium">
                                    {jt.name}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleDeleteJobType(cat.id, jt.id, jt.name)
                                    }
                                    className="text-gray-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newJobType}
                              onChange={(e) => setNewJobType(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && handleAddJobType(cat.id)
                              }
                              placeholder="e.g. Fix leaking pipe"
                              className="flex-1 px-3 py-2 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg text-xs dark:text-white outline-none transition-all"
                            />
                            <button
                              onClick={() => handleAddJobType(cat.id)}
                              disabled={jtSubmitting || !newJobType.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex-shrink-0"
                            >
                              <Plus size={12} />
                              {jtSubmitting ? 'Adding…' : 'Add'}
                            </button>
                          </div>
                        </div>

                        {/* ── Rate Band ── */}
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <DollarSign size={10} /> Rate Band (PHP / day)
                          </p>

                          {band?.set && (
                            <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                                Current: ₱{band.min} – ₱{band.max}
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                                Effective {new Date(band.effective_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Min (₱)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={bandMin}
                                onChange={(e) => setBandMin(e.target.value)}
                                placeholder="300"
                                className="w-full px-3 py-2 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg text-sm dark:text-white outline-none transition-all"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Max (₱)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={bandMax}
                                onChange={(e) => setBandMax(e.target.value)}
                                placeholder="800"
                                className="w-full px-3 py-2 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg text-sm dark:text-white outline-none transition-all"
                              />
                            </div>
                            <button
                              onClick={() =>
                                handleSetRateBand(cat.id, cat.category_name)
                              }
                              disabled={bandSubmitting || !bandMin || !bandMax}
                              className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all flex-shrink-0"
                            >
                              <Save size={13} />
                              {bandSubmitting ? 'Saving…' : band?.set ? 'Update' : 'Set Band'}
                            </button>
                          </div>

                          <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                            Workers registering with a rate outside this range will be
                            auto-flagged for review. Updating an existing band does not
                            retroactively flag workers — run the management command after
                            saving.
                          </p>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}