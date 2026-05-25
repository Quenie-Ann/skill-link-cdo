// src/pages/resident/ResidentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Plus, Search, MapPin, ShieldCheck,
  Sun, Moon, ChevronRight,
  Clock, X, CheckCircle2,
  DollarSign, FileText, AlertCircle,
  Zap, Briefcase, XCircle, Star,
  RefreshCw,
} from 'lucide-react';
import {
  BLANK_FORM, SERVICE_CATEGORIES, BUDGET_RANGES,
} from '../../data/mockData';
import { api } from '../../services/api';

// ---------------------------------------------------------------------------
// Budget ranges based on DOLE Wage Order No. RX-24 (Wage Category I —
// Cagayan de Oro City, effective January 16, 2026).
// Current minimum daily wage: ₱500/day (8 hrs) → ₱62.50/hr.
// All ranges reflect labor cost only for residential, single-worker jobs
// up to 12 hours. Materials are settled separately by the two parties.
// ---------------------------------------------------------------------------
const SIMPLE_BUDGET_OPTIONS = [
  {
    value: '150-300',
    label: '₱150 – ₱300',
    desc:  'Quick fix · 1–2 hrs (e.g. tighten fittings, replace switch)',
  },
  {
    value: '300-500',
    label: '₱300 – ₱500',
    desc:  'Half-day · 3–5 hrs (e.g. unclog drain, patch wall, re-grout)',
  },
  {
    value: '500-800',
    label: '₱500 – ₱800',
    desc:  'Full day · 6–8 hrs (e.g. repipe section, rewire room)',
  },
  {
    value: '800-1200',
    label: '₱800 – ₱1,200',
    desc:  'Extended · up to 12 hrs (e.g. roof repair, full room carpentry)',
  },
];

// ---------------------------------------------------------------------------
// Job status pipeline
// ---------------------------------------------------------------------------
const JOB_PIPELINE = [
  { key: 'pending_match',  label: 'Pending Match',  icon: Clock        },
  { key: 'offer_sent',     label: 'Offer Sent',     icon: Zap          },
  { key: 'offer_accepted', label: 'Offer Accepted', icon: Briefcase    },
  { key: 'completed',      label: 'Done',           icon: CheckCircle2 },
];

const STATUS_COLORS = {
  pending_match:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  offer_sent:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  offer_accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Status label map — human readable
// ---------------------------------------------------------------------------
const STATUS_LABELS = {
  pending_match:  'Finding Workers',
  offer_sent:     'Offer Sent',
  offer_accepted: 'Worker Accepted ✓',
  completed:      'Completed',
  cancelled:      'Cancelled',
};

function RequestStepper({ status }) {
  const isCancelled = status === 'cancelled';
  const currentIdx  = JOB_PIPELINE.findIndex((s) => s.key === status);
  if (isCancelled) {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <XCircle size={11} className="text-red-400" />
        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Cancelled</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 mt-2">
      {JOB_PIPELINE.map((step, idx) => {
        const isDone   = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div
              title={step.label}
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-skill-primary' :
                isDone   ? 'bg-skill-primary/30' :
                           'bg-gray-100 dark:bg-dark-bg'
              }`}
            >
              <step.icon size={8} className={
                isActive ? 'text-white' :
                isDone   ? 'text-skill-primary' :
                           'text-gray-300 dark:text-gray-600'
              } />
            </div>
            {idx < JOB_PIPELINE.length - 1 && (
              <div className={`h-px w-3 flex-shrink-0 ${
                isDone || isActive ? 'bg-skill-primary/40' : 'bg-gray-200 dark:bg-dark-bg'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bug 2 fix: "Worker Accepted" toast notification shown on dashboard
// when polling detects a status change to offer_accepted.
// ---------------------------------------------------------------------------
function AcceptedToast({ request, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-xl max-w-sm animate-slide-up">
      <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-black text-sm">Worker Accepted Your Offer!</p>
        <p className="text-emerald-100 text-xs mt-0.5 leading-relaxed">
          Your request <span className="font-bold">"{request?.title}"</span> has been accepted.
          Check your requests for details.
        </p>
      </div>
      <button onClick={onDismiss} className="ml-auto hover:bg-emerald-700 rounded-lg p-1 transition-all flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper — parse simplified budget value to min/max numbers
// ---------------------------------------------------------------------------
function parseBudget(value) {
  if (!value) return { budget_min: null, budget_max: null };
  const parts = value.split('-').map(Number);
  return { budget_min: parts[0] ?? null, budget_max: parts[1] ?? null };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [requests,      setRequests]      = useState([]);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [step,          setStep]          = useState(1);
  const [form,          setForm]          = useState({ service_category: '', specific_problem: '', budget_range: '', notes: '', location: '', location_lat: null, location_lng: null });
  const [submitting,    setSubmitting]    = useState(false);
  const [formError,     setFormError]     = useState('');
  const [ratingTarget,  setRatingTarget]  = useState(null);
  const [locating,      setLocating]      = useState(false);
  const [jobTypes,         setJobTypes]         = useState([]);
  const [jobTypesLoading,  setJobTypesLoading]  = useState(false);

  // Bug 2: toast state for real-time offer_accepted notification
  const [acceptedToast, setAcceptedToast] = useState(null);

  // ---------------------------------------------------------------------------
  // Load job types from the API for the selected skill category.
  // Called when the resident advances from Step 1 to Step 2.
  // Replaces selectedCategory.problems (hardcoded in mockData.js).
  // ---------------------------------------------------------------------------
  const loadJobTypes = useCallback(async (categoryName) => {
    setJobTypesLoading(true);
    setJobTypes([]);
    try {
      // Step 1 — resolve category name → UUID
      const cats = await api.getSkillCategories();
      const match = (cats || []).find(
        (c) => c.category_name.toLowerCase() === categoryName.toLowerCase()
      );
      if (!match) {
        setJobTypesLoading(false);
        return;
      }
      // Step 2 — fetch job types for that category UUID
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const token = (() => {
        try { return JSON.parse(localStorage.getItem('barangayskill_session'))?.access || ''; }
        catch { return ''; }
      })();
      const res = await fetch(
        `${BASE_URL}/skill-categories/${match.id}/job-types/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to load job types.');
      const data = await res.json();
      setJobTypes((data || []).map((t) => t.name));
    } catch (err) {
      console.error('loadJobTypes error:', err);
      setJobTypes([]);
    } finally {
      setJobTypesLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Load requests — extracted into a reusable function so polling can call it
  // ---------------------------------------------------------------------------
  const loadRequests = useCallback(() => {
    api.getResidentRequests()
      .then((data) => {
        const incoming = data || [];

        // Bug 2: compare previous statuses to detect newly accepted offers
        setRequests((prev) => {
          incoming.forEach((newReq) => {
            const oldReq = prev.find((r) => r.id === newReq.id);
            if (
              oldReq &&
              oldReq.status !== 'offer_accepted' &&
              newReq.status === 'offer_accepted'
            ) {
              // Status just changed to accepted — show toast
              setAcceptedToast(newReq);
            }
          });
          return incoming;
        });
      })
      .catch(console.error);
  }, []);

  // ---------------------------------------------------------------------------
  // Bug 1 fix: Auto-fill location from resident profile on mount.
  // The resident no longer has to type their address — it is pre-filled
  // from their registered profile address.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadRequests();

    api.getResidentProfile()
      .then((profile) => {
        if (profile?.address) {
          setForm((prev) => ({ ...prev, location: profile.address }));
        }
      })
      .catch(console.error);
  }, [loadRequests]);

  // ---------------------------------------------------------------------------
  // Bug 2 fix: Poll every 15 seconds for status updates.
  // This gives the resident near-real-time feedback when a worker accepts
  // without requiring WebSockets. 15s is fast enough for demo purposes
  // and respectful of server load for a barangay-scale pilot.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const selectedCategory = SERVICE_CATEGORIES.find((c) => c.value === form.service_category);

  function openModal()  { setStep(1); setFormError(''); setJobTypes([]); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setStep(1); setFormError(''); setJobTypes([]);
    setForm({ service_category: '', specific_problem: '', budget_range: '', notes: '', location: '', location_lat: null, location_lng: null });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round to 7dp — raw browser coords (e.g. 8.454216000000001) exceed
        // DecimalField(max_digits=10, decimal_places=7) and cause a Django 400.
        const lat = parseFloat(pos.coords.latitude.toFixed(7));
        const lng = parseFloat(pos.coords.longitude.toFixed(7));
        setCoords({ lat, lng });
        setForm((prev) => ({
          ...prev,
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          location_lat: lat,
          location_lng: lng,
        }));
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not get your location. Please check browser permissions and try again.');
        setLocating(false);
      },
      {
        // FE-015: enableHighAccuracy: true forces GPS hardware — times out on
        // desktops and indoor devices (GeolocationPositionError code 3).
        // WiFi/IP triangulation (false) resolves in <1s and is precise enough
        // for barangay-level proximity scoring (accuracy within ~50–200m).
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Bug 1 fix: canProceed no longer requires schedule or preferred_start.
  // Those two fields are removed from the form entirely — they were redundant
  // and caused confusion. Budget, problem, and location are sufficient.
  // ---------------------------------------------------------------------------
  function canProceed() {
    if (step === 1) return !!form.service_category;
    if (step === 2) return !!form.specific_problem && !!form.budget_range && form.location.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError('');
    try {
      // Step 1 — resolve the skill category UUID from the category name
      let categoryId = null;
      try {
        const cats = await api.getSkillCategories();
        const match = (cats || []).find(
          (c) => c.category_name.toLowerCase() === form.service_category.toLowerCase()
        );
        categoryId = match?.id ?? null;
      } catch (_) {}

      // Step 2 — parse the simplified budget picker into min/max numbers
      const { budget_min, budget_max } = parseBudget(form.budget_range);

      // Step 3 — build a description string from the form fields.
      // This becomes the TF-IDF query text in the ML service
      // (appended to the job_type description once job_type is wired in).
      const description = [
        `Problem: ${form.specific_problem}`,
        `Budget: ${SIMPLE_BUDGET_OPTIONS.find((b) => b.value === form.budget_range)?.label ?? form.budget_range}`,
        form.notes ? `Notes: ${form.notes}` : '',
      ].filter(Boolean).join(' | ');

      // Step 4 — build the request body using the actual form state variables
      const body = {
        category:         categoryId,
        title:            form.specific_problem,
        description:      description,
        location_address: form.location,
        location_lat: form.location_lat,
        location_lng: form.location_lng,
        budget_min:       budget_min,
        budget_max:       budget_max,
      };

      // Step 5 — POST to Django, which calls the ML service internally
      const response = await api.createRequest(body);

      const jobRequest     = response.job_request    ?? response;
      const matchedWorkers = response.matched_workers ?? [];

      // Step 6 — refresh the requests list immediately
      loadRequests();
      closeModal();

      // Step 7 — navigate to ResidentDirectory with the ML results in state
      navigate('/resident/directory', {
        state: {
          matchRequest: {
            id:               jobRequest.id,
            service_category: form.service_category,
            specific_problem: form.specific_problem,
            budget_range:     form.budget_range,
            location:         form.location,
          },
          matchedWorkers: matchedWorkers,   // consumed by ResidentDirectory useEffect
          dataQuality:    null,
        },
      });

    } catch (err) {
      setFormError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg outline-none transition-all text-sm dark:text-white';

  // ---------------------------------------------------------------------------
  // Active requests — split for clarity on the dashboard
  // ---------------------------------------------------------------------------
  const activeRequests    = requests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const completedRequests = requests.filter((r) =>  ['completed', 'cancelled'].includes(r.status));

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Bug 2: Real-time accepted toast */}
      {acceptedToast && (
        <AcceptedToast
          request={acceptedToast}
          onDismiss={() => setAcceptedToast(null)}
        />
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Resident Portal</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Community Services
            </p>
          </div>
          <div className="flex items-center gap-3">
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

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">

        {/* Hero CTA — simplified, single clear action */}
        <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-skill-primary/20 text-skill-primary px-3 py-1.5 rounded-full font-bold uppercase tracking-widest mb-4 border border-skill-primary/20">
              <ShieldCheck size={10} /> Barangay Verified Workers
            </span>
            <h2 className="text-2xl font-extrabold mb-2 leading-tight">How can we help you today?</h2>
            <p className="text-skill-light/60 mb-6 text-sm">
              Find verified skilled workers in your barangay. Fast, safe, and community-backed.
            </p>
            <button
              onClick={openModal}
              className="flex items-center gap-3 bg-skill-primary hover:bg-emerald-500 text-white px-7 py-3.5 rounded-lg font-bold transition-all shadow-lg shadow-skill-primary/30"
            >
              <Plus size={18} />
              Book a Service
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-skill-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Bug 2 fix: Active Requests — prominently displayed with live status */}
        {activeRequests.length > 0 && (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-skill-primary/10 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-skill-primary animate-pulse" />
                <h3 className="font-bold text-skill-dark dark:text-white">Active Requests</h3>
              </div>
              <button
                onClick={loadRequests}
                className="flex items-center gap-1.5 text-xs text-skill-primary font-bold hover:underline"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {activeRequests.map((req) => (
                <div key={req.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-skill-dark dark:text-white truncate">
                      {req.title}
                    </p>
                    <RequestStepper status={req.status} />
                  </div>
                  {/* Bug 2: Status badge with prominent accepted state */}
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                    STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-400'
                  }`}>
                    {STATUS_LABELS[req.status] ?? req.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Category Quick Launch */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-skill-dark dark:text-white">Popular Services</h3>
            <button
              onClick={() => navigate('/resident/directory')}
              className="text-xs font-bold text-skill-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              Browse all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {SERVICE_CATEGORIES.map((service) => (
              <button
                key={service.value}
                onClick={openModal}
                className="p-4 bg-white dark:bg-dark-card hover:bg-skill-light dark:hover:bg-dark-bg transition-all rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 hover:border-skill-primary/20 group text-center flex flex-col items-center gap-2"
              >
                <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${service.bg}`}>
                  <service.icon className={service.color} size={22} />
                </div>
                <span className="font-bold text-skill-dark dark:text-white text-[10px] leading-tight">
                  {service.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Past Requests */}
        {completedRequests.length > 0 && (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white">Past Requests</h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-60 overflow-y-auto">
              {completedRequests.map((req) => (
                <div key={req.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">{req.title}</p>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                    STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-400'
                  }`}>
                    {STATUS_LABELS[req.status] ?? req.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {requests.length === 0 && (
          <div className="bg-white dark:bg-dark-card rounded-xl p-10 text-center border border-skill-primary/5 dark:border-white/5">
            <Briefcase size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-4">No service requests yet.</p>
            <button
              onClick={openModal}
              className="px-6 py-2.5 bg-skill-primary text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all"
            >
              Book Your First Service
            </button>
          </div>
        )}
      </main>

      {/* ── Job Request Modal — Bug 1 fixes applied ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-black text-skill-dark dark:text-white">Book a Service</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">
                  Step {step} of 3
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-100 dark:bg-dark-bg flex-shrink-0">
              <div
                className="h-full bg-skill-primary transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <div className="px-7 py-6 overflow-y-auto flex-1">

              {/* STEP 1: Category selection */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    What kind of service do you need?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICE_CATEGORIES.map((service) => (
                      <button
                        key={service.value}
                        onClick={() => setForm({ ...form, service_category: service.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.service_category === service.value
                            ? 'border-skill-primary bg-skill-primary/5 dark:bg-skill-primary/10'
                            : 'border-gray-100 dark:border-white/5 hover:border-skill-primary/30'
                        }`}
                      >
                        <div className={`p-2 rounded-lg w-fit mb-2 ${service.bg}`}>
                          <service.icon size={18} className={service.color} />
                        </div>
                        <p className={`font-bold text-sm ${
                          form.service_category === service.value
                            ? 'text-skill-primary'
                            : 'text-skill-dark dark:text-white'
                        }`}>
                          {service.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Details — Bug 1 fix: removed schedule + preferred_start */}
              {step === 2 && selectedCategory && (
                <div className="space-y-6">

                  {/* Problem */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      What is the problem? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {jobTypesLoading ? (
                        <div className="flex items-center justify-center py-5">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-skill-primary border-t-transparent" />
                        </div>
                      ) : jobTypes.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-3 px-1 leading-relaxed">
                          No job types configured for this category yet.
                          Contact the Barangay Administrator.
                        </p>
                      ) : (
                        jobTypes.map((p) => (
                          <button
                            key={p}
                            onClick={() => setForm({ ...form, specific_problem: p })}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-semibold text-left transition-all ${
                              form.specific_problem === p
                                ? 'border-skill-primary bg-skill-primary/5 text-skill-primary'
                                : 'border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:border-skill-primary/30'
                            }`}
                          >
                            {form.specific_problem === p
                              ? <CheckCircle2 size={14} className="text-skill-primary flex-shrink-0" />
                              : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />}
                            {p}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bug 1 fix: Budget — 4 clear, visually distinct options */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Budget Range <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SIMPLE_BUDGET_OPTIONS.map((b) => (
                        <button
                          key={b.value}
                          onClick={() => setForm({ ...form, budget_range: b.value })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            form.budget_range === b.value
                              ? 'border-skill-primary bg-skill-primary text-white'
                              : 'border-gray-100 dark:border-white/5 hover:border-skill-primary/30'
                          }`}
                        >
                          <p className={`font-black text-sm ${
                            form.budget_range === b.value ? 'text-white' : 'text-skill-dark dark:text-white'
                          }`}>
                            {b.label}
                          </p>
                          <p className={`text-[10px] mt-0.5 ${
                            form.budget_range === b.value ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {b.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bug 1 fix: Location — auto-filled from profile, still editable */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Job Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Loading your address..."
                        className={inputCls + ' pl-10'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className="mt-2 text-xs text-skill-primary font-bold flex items-center gap-1 hover:underline"
                    >
                      <MapPin size={11} /> {locating ? 'Getting location...' : 'Use my current location'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-skill-primary" />
                      Auto-filled from your registered address. Edit if the job is at a different location.
                    </p>
                  </div>

                  {/* Notes — optional */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Additional Notes
                      <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400" size={14} />
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Anything else the worker should know..."
                        className={inputCls + ' pl-10 resize-none'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Confirm */}
              {step === 3 && selectedCategory && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Review your request before submitting.
                  </p>
                  <div className="bg-skill-light/50 dark:bg-dark-bg/50 rounded-xl p-5 space-y-4">
                    {[
                      {
                        icon: <selectedCategory.icon size={15} className={selectedCategory.color} />,
                        bg: selectedCategory.bg,
                        label: 'Service',
                        value: selectedCategory.label,
                      },
                      {
                        icon: <FileText size={15} className="text-gray-400" />,
                        bg: 'bg-gray-100 dark:bg-dark-bg',
                        label: 'Problem',
                        value: form.specific_problem,
                      },
                      {
                        icon: <DollarSign size={15} className="text-emerald-500" />,
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        label: 'Budget',
                        value: SIMPLE_BUDGET_OPTIONS.find((b) => b.value === form.budget_range)?.label,
                      },
                      {
                        icon: <MapPin size={15} className="text-red-400" />,
                        bg: 'bg-red-50 dark:bg-red-900/20',
                        label: 'Location',
                        value: form.location,
                      },
                    ].map(({ icon, bg, label, value }, i, arr) => (
                      <React.Fragment key={label}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${bg}`}>{icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{label}</p>
                            <p className="text-sm font-semibold text-skill-dark dark:text-white mt-0.5 truncate">{value}</p>
                          </div>
                        </div>
                        {i < arr.length - 1 && <hr className="border-gray-200 dark:border-white/5" />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* What happens next */}
                  <div className="mt-4 p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-lg border border-skill-primary/20 space-y-2">
                    <p className="text-xs font-black text-skill-primary flex items-center gap-2">
                      <Zap size={13} /> What happens next
                    </p>
                    <ol className="space-y-1.5 pl-1">
                      {[
                        'ML engine ranks verified workers matching your request',
                        'You review the ranked list and choose your preferred worker',
                        'You send an offer — the worker accepts or declines',
                      ].map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="w-4 h-4 rounded-full bg-skill-primary/20 text-skill-primary font-black text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {formError && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={14} /> {formError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-7 pb-6 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              <button
                onClick={step > 1 ? () => setStep(step - 1) : closeModal}
                className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step < 3 ? (
                <button
                  disabled={!canProceed()}
                  onClick={() => {
                    setStep(step + 1);
                    if (step === 1 && form.service_category) {
                      loadJobTypes(form.service_category);
                    }
                  }}
                  className="flex items-center gap-2 px-7 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all"
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-7 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-70 text-white rounded-lg text-sm font-bold transition-all"
                >
                  {submitting ? 'Submitting...' : 'Find Matched Workers'}
                  {!submitting && <ChevronRight size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
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