import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import RatingModal from '../../components/common/RatingModal';
import {
  Plus, Search, MapPin, ShieldCheck,
  Sun, Moon, ArrowUpRight, ChevronRight,
  Clock, X, ChevronLeft, CheckCircle2,
  DollarSign, FileText, Calendar, AlertCircle,
  Zap, Briefcase, XCircle, Star,
} from 'lucide-react';
import {
  BLANK_FORM, SERVICE_CATEGORIES,
  BUDGET_RANGES, PREFERRED_START_OPTIONS, SCHEDULE_OPTIONS,
} from '../../data/mockData';
import { api } from '../../services/api';


// Job status pipeline — R-06: SRS v1.0 Section 3.2 documented statuses
const JOB_PIPELINE = [
  { key: 'pending_match',  label: 'Pending Match',  icon: Clock        },
  { key: 'offer_sent',     label: 'Offer Sent',     icon: Zap          },
  { key: 'offer_accepted', label: 'Offer Accepted', icon: Briefcase    },
  { key: 'completed',      label: 'Done',           icon: CheckCircle2 },
];

// Status badge colours keyed to documented status values
const STATUS_COLORS = {
  pending_match:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  offer_sent:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  offer_accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Inline job status stepper 
function RequestStepper({ status }) {
  const isCancelled = status === 'cancelled';
  const currentIdx = JOB_PIPELINE.findIndex((s) => s.key === status);
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

// Static recent requests — replace with api.getRequests() in Phase 2 
export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [requests,   setRequests]   = useState([]);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');

  // Rating modal
  const [ratingTarget, setRatingTarget] = useState(null);

  // Load resident's requests on mount
  useEffect(() => {
    api.getResidentRequests().then(setRequests).catch(console.error);
  }, []);

  const selectedCategory = SERVICE_CATEGORIES.find((c) => c.value === form.service_category);

  function openModal() { setForm(BLANK_FORM); setStep(1); setFormError(''); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setStep(1); setForm(BLANK_FORM); setFormError(''); }

  function canProceed() {
    if (step === 1) return !!form.service_category;
    if (step === 2) return !!form.specific_problem && !!form.budget_range && !!form.preferred_start && !!form.schedule && form.location.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError('');
    try {
      await api.createRequest({
        customer_name: 'Maria Santos',
        service_type:  form.service_category,
        notes: [
          `Problem: ${form.specific_problem}`,
          `Budget: ${BUDGET_RANGES.find((b) => b.value === form.budget_range)?.label}`,
          `Preferred Start: ${PREFERRED_START_OPTIONS.find((p) => p.value === form.preferred_start)?.label}`,
          `Schedule: ${form.schedule}`,
          `Location: ${form.location}`,
          form.notes ? `Notes: ${form.notes}` : '',
        ].filter(Boolean).join(' | '),
      });
      closeModal();
      navigate('/resident/directory', {
        state: {
          matchRequest: {
            service_category: form.service_category,
            specific_problem: form.specific_problem,
            budget_range:     form.budget_range,
            preferred_start:  form.preferred_start,
            schedule:         form.schedule,
            location:         form.location,
          },
        },
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg outline-none transition-all text-sm dark:text-white';

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

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
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input
                type="text"
                placeholder="Search for services..."
                className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white"
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

      <main className="p-8 max-w-[1600px] mx-auto space-y-6">

        {/* ROW 1: Hero CTA + Trust Card */}
        <div className="grid grid-cols-12 gap-5">

          {/* Hero CTA */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-xl p-10 text-white relative overflow-hidden shadow-xl shadow-skill-dark/25">
            <div className="relative z-10 lg:w-3/5">
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-skill-primary/20 text-skill-primary px-3 py-1.5 rounded-full font-bold uppercase tracking-widest mb-5 border border-skill-primary/20">
                <ShieldCheck size={10} /> Barangay Verified Workers
              </span>
              <h2 className="text-3xl font-extrabold mb-3 leading-tight">
                How can we help you today?
              </h2>
              <p className="text-skill-light/60 mb-8 text-sm leading-relaxed">
                Connect with barangay-verified workers for all your household needs. Reliable service, just a click away.
              </p>
              <button
                onClick={openModal}
                className="flex items-center gap-3 bg-skill-primary hover:bg-white hover:text-skill-dark text-white px-8 py-4 rounded-lg font-bold transition-all group shadow-lg shadow-skill-primary/30"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Book a New Service
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center">
              <ShieldCheck size={120} className="text-white/5" />
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-skill-primary/10 rounded-full blur-3xl" />
          </div>

          {/* Trust / Security Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <ShieldCheck className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <h3 className="font-bold text-skill-dark dark:text-white text-lg leading-tight mb-2">
                Vetted Community Workers
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Every worker undergoes strict background checking by the Barangay Administration before joining.
              </p>
            </div>
            <button className="mt-6 text-sm font-bold text-skill-primary flex items-center gap-1.5 hover:gap-2.5 transition-all group">
              Security Policy
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ROW 2: Service Tiles + My Requests */}
        <div className="grid grid-cols-12 gap-5">

          {/* Popular Services Grid */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-skill-dark dark:text-white text-lg">Popular Services</h3>
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
                  className="p-5 bg-white dark:bg-dark-card hover:bg-skill-light dark:hover:bg-dark-bg transition-all rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 hover:border-skill-primary/20 group text-center flex flex-col items-center justify-center gap-2"
                >
                  <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${service.bg}`}>
                    <service.icon className={service.color} size={24} />
                  </div>
                  <span className="font-bold text-skill-dark dark:text-white text-[10px] tracking-tight leading-tight">
                    {service.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* My Requests Panel */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white">My Requests</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Recent activity</p>
              </div>
              <Clock size={16} className="text-gray-300" />
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 hover:bg-skill-light/30 dark:hover:bg-dark-bg/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-skill-dark dark:text-white group-hover:text-skill-primary transition-colors leading-tight">
                      {req.title}
                    </p>
                    <span className={`flex-shrink-0 text-[9px] ml-2 px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Pipeline stepper */}
                  <RequestStepper status={req.status} />

                  {/* Confirmed booking details — shown once worker has accepted */}
                  {req.status === 'offer_accepted' && req.confirmed_date && (
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-purple-500 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">{req.confirmed_date}</span>
                      </div>
                      {req.confirmed_price && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={10} className="text-emerald-500 flex-shrink-0" />
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{req.confirmed_price}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[10px] text-gray-400">{req.date}</p>

                    {/* Rate CTA for completed, unrated jobs */}
                    {req.status === 'completed' && !req.rating ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingTarget({
                            job:    { id: req.id, title: req.title, service: req.service },
                            worker: { id: req.id, full_name: req.worker, service: req.service },
                          });
                        }}
                        className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <Star size={10} className="fill-amber-400 text-amber-400" /> Rate Now
                      </button>
                    ) : req.rating ? (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < req.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    ) : (
                      <ArrowUpRight size={13} className="text-gray-300 group-hover:text-skill-primary transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => navigate('/resident/directory')}
                className="w-full py-3 rounded-lg bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-white text-xs font-bold hover:bg-skill-primary hover:text-white border border-skill-primary/10 transition-all"
              >
                Browse All Workers
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SERVICE REQUEST MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="p-1.5 hover:bg-skill-light dark:hover:bg-dark-bg rounded-xl transition-all"
                  >
                    <ChevronLeft size={16} className="text-skill-dark dark:text-white" />
                  </button>
                )}
                <div>
                  <h2 className="font-black text-skill-dark dark:text-white text-lg">Book a Service</h2>
                  <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
                    Step {step} of 3 — {['Choose Service', 'Fill Details', 'Confirm'][step - 1]}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-skill-light dark:hover:bg-dark-bg rounded-xl transition-all">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1.5 px-8 pt-4 flex-shrink-0">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-skill-primary' : 'bg-gray-200 dark:bg-dark-bg'
                  }`}
                />
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-8 py-6">

              {/* STEP 1: Service Category */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">What type of service do you need?</p>
                  {SERVICE_CATEGORIES.map((cat) => {
                    const Icon     = cat.icon;
                    const isActive = form.service_category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setForm({ ...form, service_category: cat.value, specific_problem: '' })}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                          isActive
                            ? 'border-skill-primary bg-skill-primary/5 dark:bg-skill-primary/10'
                            : 'border-gray-100 dark:border-white/5 bg-skill-light/50 dark:bg-dark-bg/50 hover:border-skill-primary/30'
                        }`}
                      >
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isActive ? 'bg-skill-primary/20' : cat.bg}`}>
                          <Icon size={20} className={isActive ? 'text-skill-primary' : cat.color} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-sm ${isActive ? 'text-skill-primary' : 'text-skill-dark dark:text-white'}`}>
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{cat.problems.length} common issues</p>
                        </div>
                        {isActive && <CheckCircle2 size={18} className="text-skill-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 2: Details */}
              {step === 2 && selectedCategory && (
                <div className="space-y-6">
                  {/* Specific Problem */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      What is the problem? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {selectedCategory.problems.map((p) => (
                        <button
                          key={p}
                          onClick={() => setForm({ ...form, specific_problem: p })}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-semibold text-left transition-all ${
                            form.specific_problem === p
                              ? 'border-skill-primary bg-skill-primary/5 text-skill-primary dark:bg-skill-primary/10'
                              : 'border-gray-100 dark:border-white/5 bg-skill-light/50 dark:bg-dark-bg/50 text-gray-600 dark:text-gray-300 hover:border-skill-primary/30'
                          }`}
                        >
                          {form.specific_problem === p
                            ? <CheckCircle2 size={14} className="text-skill-primary flex-shrink-0" />
                            : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />}
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Budget <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BUDGET_RANGES.map((b) => (
                        <button key={b.value} onClick={() => setForm({ ...form, budget_range: b.value })}
                          className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                            form.budget_range === b.value
                              ? 'border-skill-primary bg-skill-primary text-white'
                              : 'border-gray-100 dark:border-white/5 bg-skill-light/50 dark:bg-dark-bg/50 text-gray-600 dark:text-gray-300 hover:border-skill-primary/30'
                          }`}>
                          <DollarSign size={13} className={form.budget_range === b.value ? 'text-white' : 'text-gray-400'} />
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Start */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Preferred Start <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PREFERRED_START_OPTIONS.map((p) => (
                        <button key={p.value} onClick={() => setForm({ ...form, preferred_start: p.value })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            form.preferred_start === p.value
                              ? 'border-skill-primary bg-skill-primary/5 dark:bg-skill-primary/10'
                              : 'border-gray-100 dark:border-white/5 bg-skill-light/50 dark:bg-dark-bg/50 hover:border-skill-primary/30'
                          }`}>
                          <p className={`font-black text-sm ${form.preferred_start === p.value ? 'text-skill-primary' : 'text-skill-dark dark:text-white'}`}>{p.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Preferred Schedule <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SCHEDULE_OPTIONS.map((s) => (
                        <button key={s.value} onClick={() => setForm({ ...form, schedule: s.value })}
                          className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                            form.schedule === s.value
                              ? 'border-skill-primary bg-skill-primary text-white'
                              : 'border-gray-100 dark:border-white/5 bg-skill-light/50 dark:bg-dark-bg/50 text-gray-600 dark:text-gray-300 hover:border-skill-primary/30'
                          }`}>
                          <Calendar size={13} className={form.schedule === s.value ? 'text-white' : 'text-gray-400'} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Your Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Brgy. 12, Carmen, CDO"
                        className={inputCls + ' pl-10'} />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Additional Notes
                      <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400" size={14} />
                      <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Anything else the worker should know..."
                        className={inputCls + ' pl-10 resize-none'} />
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
                      { icon: <selectedCategory.icon size={15} className={selectedCategory.color} />, bg: selectedCategory.bg, label: 'Service',  value: selectedCategory.label },
                      { icon: <FileText size={15} className="text-gray-400" />,                       bg: 'bg-gray-100 dark:bg-dark-bg',            label: 'Problem',  value: form.specific_problem },
                      { icon: <DollarSign size={15} className="text-emerald-500" />,                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',   label: 'Budget',   value: BUDGET_RANGES.find((b) => b.value === form.budget_range)?.label },
                      { icon: <Clock size={15} className="text-purple-500" />,                         bg: 'bg-purple-50 dark:bg-purple-900/20',     label: 'Preferred Start', value: PREFERRED_START_OPTIONS.find((p) => p.value === form.preferred_start)?.label },
                      { icon: <Calendar size={15} className="text-blue-500" />,                       bg: 'bg-blue-50 dark:bg-blue-900/20',         label: 'Schedule', value: SCHEDULE_OPTIONS.find((s) => s.value === form.schedule)?.label },
                      { icon: <MapPin size={15} className="text-red-400" />,                          bg: 'bg-red-50 dark:bg-red-900/20',           label: 'Location', value: form.location },
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

                  {/* What happens next — ML results → resident selects → sends offer */}
                  <div className="mt-4 p-4 bg-skill-primary/5 dark:bg-skill-primary/10 rounded-lg border border-skill-primary/20 space-y-2">
                    <p className="text-xs font-black text-skill-primary flex items-center gap-2">
                      <Zap size={13} /> What happens next
                    </p>
                    <ol className="space-y-1.5 pl-1">
                      {[
                        'ML engine ranks verified workers matching your request',
                        'You review the ranked list and choose your preferred worker',
                        'You send an offer — the worker accepts or declines',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="w-4 h-4 rounded-full bg-skill-primary/20 text-skill-primary font-black text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
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

            {/* Footer */}
            <footer>
              <div className="flex items-center justify-between px-8 pb-7 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
                <button
                  onClick={step > 1 ? () => setStep(step - 1) : closeModal}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                >
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>

                {step < 3 ? (
                  <button
                    disabled={!canProceed()}
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-7 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-skill-primary/20"
                  >
                    Continue <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-7 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-70 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-skill-primary/20"
                  >
                    {submitting ? 'Submitting...' : 'Find Matched Workers'}
                    {!submitting && <ChevronRight size={14} />}
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* ── Rating Modal — triggered from "Rate Now" CTA ── */}
      {ratingTarget && (
        <RatingModal
          job={ratingTarget.job}
          worker={ratingTarget.worker}
          onSubmit={(data) => {
            console.log('Rating submitted:', data);
            // In Phase 2: await api.submitRating(data); then update local state
            setRatingTarget(null);
          }}
          onSkip={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
}