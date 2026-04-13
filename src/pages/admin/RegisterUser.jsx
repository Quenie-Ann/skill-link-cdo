// src/pages/admin/RegisterUser.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import {
  Sun, Moon, UserPlus, User, Briefcase, Home,
  Mail, Lock, Phone, MapPin, ChevronDown,
  CheckCircle2, AlertCircle, X, Eye, EyeOff,
  Wrench, FileText, BadgeCheck,
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('barangayskill_session'))?.access || '';
  } catch { return ''; }
}

// Field wrapper 
function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[10px] text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
          <AlertCircle size={9} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 rounded-xl text-sm
   text-skill-dark dark:text-white outline-none transition-all
   placeholder:text-gray-300 dark:placeholder:text-gray-600
   focus:border-skill-primary
   ${hasError
     ? 'border-red-300 dark:border-red-700'
     : 'border-skill-light dark:border-white/5 hover:border-skill-primary/30'}`;

// Role tabs 
const ROLES = [
  {
    key:   'worker',
    label: 'Skilled Worker',
    icon:  Briefcase,
    desc:  'Registers with skill category, declared rate, and years of experience.',
  },
  {
    key:   'resident',
    label: 'Resident',
    icon:  Home,
    desc:  'Registers with address and contact number only.',
  },
];

// Validation
function validate(role, form) {
  const errs = {};

  if (!form.full_name.trim())       errs.full_name      = 'Full name is required.';
  if (!form.email.trim())           errs.email          = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                    errs.email          = 'Enter a valid email address.';
  if (!form.password)               errs.password       = 'Password is required.';
  else if (form.password.length < 6) errs.password      = 'Password must be at least 6 characters.';
  if (!form.contact_number.trim())  errs.contact_number = 'Contact number is required.';
  if (!form.address.trim())         errs.address        = 'Address is required.';

  if (role === 'worker') {
    if (!form.skill_category)         errs.skill_category   = 'Select a skill category.';
    if (!form.declared_rate)          errs.declared_rate    = 'Declared rate is required.';
    else if (isNaN(form.declared_rate) || Number(form.declared_rate) <= 0)
                                      errs.declared_rate    = 'Enter a valid positive amount.';
    if (form.years_experience === '' || isNaN(form.years_experience) || Number(form.years_experience) < 0)
                                      errs.years_experience = 'Enter 0 or more years.';
  }

  return errs;
}

// MAIN COMPONENT
const EMPTY_FORM = {
  full_name: '', email: '', password: '',
  contact_number: '', address: '',
  skill_category: '', declared_rate: '', years_experience: '0', bio: '',
};

export default function RegisterUser() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [role,        setRole]        = useState('worker');
  const [categories,  setCategories]  = useState([]);
  const [showPw,      setShowPw]      = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [serverError, setServerError] = useState('');
  const [errors,      setErrors]      = useState({});
  const [form,        setForm]        = useState(EMPTY_FORM);

  // Load skill categories from backend
  useEffect(() => {
    fetch(`${BASE_URL}/skill-categories/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError)   setServerError('');
  }

  function switchRole(r) {
    setRole(r);
    setErrors({});
    setServerError('');
    setSuccess(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(role, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');

    try {
      if (role === 'worker') {
        // Worker: POST /api/workers/
        // WorkerCreateSerializer handles User + WorkerProfile atomically
        const res = await fetch(`${BASE_URL}/workers/`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            email:            form.email.trim().toLowerCase(),
            password:         form.password,
            full_name:        form.full_name.trim(),
            contact_number:   form.contact_number.trim(),
            address:          form.address.trim(),
            skill_category:   form.skill_category,
            declared_rate:    Number(form.declared_rate),
            years_experience: Number(form.years_experience),
            bio:              form.bio.trim(),
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(
            typeof d === 'object'
              ? Object.values(d).flat().join(' ')
              : 'Worker registration failed.'
          );
        }

      } else {
        // Resident: POST /api/residents/register/
        // ResidentRegisterView creates User + ResidentProfile atomically
        const res = await fetch(`${BASE_URL}/residents/register/`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            email:          form.email.trim().toLowerCase(),
            password:       form.password,
            full_name:      form.full_name.trim(),
            contact_number: form.contact_number.trim(),
            address:        form.address.trim(),
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Resident registration failed.');
        }
      }

      setSuccess({ name: form.full_name.trim(), role });
      setForm(EMPTY_FORM);
      setErrors({});

    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">
              Register User
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Walk-in Registration
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="max-w-2xl mx-auto">

          {/* Success Banner */}
          {success && (
            <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex-shrink-0">
                <BadgeCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Registration successful!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  <span className="font-bold">{success.name}</span> has been registered as a{' '}
                  {success.role === 'worker' ? 'Skilled Worker' : 'Resident'}. Their profile is now
                  pending verification in the User Verification queue.
                </p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all flex-shrink-0"
                aria-label="Dismiss"
              >
                <X size={14} className="text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          )}

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {ROLES.map(({ key, label, icon: Icon, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchRole(key)}
                className={`
                  relative flex flex-col items-start gap-2 p-5 rounded-xl border-2
                  text-left transition-all duration-200
                  ${role === key
                    ? 'bg-skill-primary/10 border-skill-primary shadow-lg shadow-skill-primary/10'
                    : 'bg-white dark:bg-dark-card border-skill-primary/10 dark:border-white/5 hover:border-skill-primary/30'
                  }
                `}
              >
                <div className={`p-2.5 rounded-xl ${
                  role === key ? 'bg-skill-primary/20' : 'bg-skill-light dark:bg-dark-bg'
                }`}>
                  <Icon size={18} className={role === key ? 'text-skill-primary' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    role === key ? 'text-skill-dark dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                {role === key && (
                  <CheckCircle2 size={14} className="text-skill-primary absolute top-4 right-4" />
                )}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white dark:bg-dark-card rounded-xl border border-skill-primary/5 dark:border-white/5 shadow-sm overflow-hidden"
          >
            {/* Form header */}
            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] px-8 py-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <UserPlus size={22} className="text-skill-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {role === 'worker' ? 'Skilled Worker Registration' : 'Resident Registration'}
                  </h2>
                  <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-widest">
                    Walk-in · Admin-verified on submission
                  </p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-skill-primary/10 rounded-full blur-2xl" />
            </div>

            <div className="p-8 space-y-6">

              {/* Server error */}
              {serverError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {serverError}
                </div>
              )}

              {/* Personal Details */}
              <div>
                <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User size={9} /> Personal Details
                </p>
                <div className="space-y-4">

                  <Field label="Full Name" required error={errors.full_name}>
                    <input
                      type="text" name="full_name" value={form.full_name}
                      onChange={handleChange} placeholder="e.g. Juan Dela Cruz"
                      className={inputCls(errors.full_name)} autoComplete="name"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email Address" required error={errors.email}>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                        <input
                          type="email" name="email" value={form.email}
                          onChange={handleChange} placeholder="juan@email.com"
                          className={`${inputCls(errors.email)} pl-10`} autoComplete="email"
                        />
                      </div>
                    </Field>

                    <Field label="Password" required error={errors.password} hint="Min. 6 characters">
                      <div className="relative">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                        <input
                          type={showPw ? 'text' : 'password'} name="password" value={form.password}
                          onChange={handleChange} placeholder="••••••••"
                          className={`${inputCls(errors.password)} pl-10 pr-11`} autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-skill-primary transition-colors"
                          aria-label={showPw ? 'Hide password' : 'Show password'}>
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Contact Number" required error={errors.contact_number}>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                        <input
                          type="tel" name="contact_number" value={form.contact_number}
                          onChange={handleChange} placeholder="09xxxxxxxxx"
                          className={`${inputCls(errors.contact_number)} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Barangay Address" required error={errors.address}>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                        <input
                          type="text" name="address" value={form.address}
                          onChange={handleChange} placeholder="Zone 1, Bulua, CDO"
                          className={`${inputCls(errors.address)} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Worker-only: Professional Details */}
              {role === 'worker' && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <div>
                    <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Wrench size={9} /> Professional Details
                    </p>
                    <div className="space-y-4">

                      <Field label="Skill Category" required error={errors.skill_category}>
                        <div className="relative">
                          <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                          <select
                            name="skill_category" value={form.skill_category}
                            onChange={handleChange}
                            className={`${inputCls(errors.skill_category)} pl-10 pr-10 appearance-none cursor-pointer`}
                          >
                            <option value="">Select a category…</option>
                            {categories.length > 0
                              ? categories.map((c) => (
                                  <option key={c.id} value={c.id}>{c.category_name}</option>
                                ))
                              : ['Plumbing', 'Electrical', 'Carpentry', 'Mason', 'Welding'].map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))
                            }
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Declared Daily Rate (₱)" required error={errors.declared_rate}
                          hint="Validated against the active rate band">
                          <input
                            type="number" name="declared_rate" value={form.declared_rate}
                            onChange={handleChange} placeholder="e.g. 550" min="1"
                            className={inputCls(errors.declared_rate)}
                          />
                        </Field>

                        <Field label="Years of Experience" required error={errors.years_experience}>
                          <input
                            type="number" name="years_experience" value={form.years_experience}
                            onChange={handleChange} placeholder="e.g. 5" min="0"
                            className={inputCls(errors.years_experience)}
                          />
                        </Field>
                      </div>

                      <Field label="Short Bio" hint="Optional — appears on the worker's public profile">
                        <div className="relative">
                          <FileText size={14} className="absolute left-4 top-3.5 text-gray-300 dark:text-gray-600 pointer-events-none" />
                          <textarea
                            name="bio" value={form.bio} onChange={handleChange} rows={3}
                            placeholder="e.g. Experienced plumber with 5+ years of residential work in CDO."
                            className={`${inputCls(false)} pl-10 resize-none`}
                          />
                        </div>
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* Verification notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Walk-in registrations are marked <strong>pending</strong> by default. Go to{' '}
                  <strong>User Verification</strong> to approve this profile immediately after
                  reviewing the submitted documents in person.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={submitting}
                className="
                  w-full flex items-center justify-center gap-2.5 py-4 rounded-xl
                  bg-skill-primary hover:bg-emerald-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-bold text-sm
                  shadow-lg shadow-skill-primary/25 transition-all duration-200
                "
              >
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering…</>
                  : <><UserPlus size={16} /> Register {role === 'worker' ? 'Worker' : 'Resident'}</>
                }
              </button>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}