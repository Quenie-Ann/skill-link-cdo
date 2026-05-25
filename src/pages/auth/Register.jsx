// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Mail, Lock, User, Phone, MapPin, AlertCircle, ChevronDown, Briefcase, Upload, X } from 'lucide-react';
import workspaceImg from '../../assets/background.jpg';

const BASE_URL = 'http://127.0.0.1:8000/api';

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [skillCategories, setSkillCategories] = useState([]);

  // Worker document files state
  const [certFile, setCertFile] = useState(null);
  const [clearanceFile, setClearanceFile] = useState(null);

  // Resident document files state
  const [residentDocFile, setResidentDocFile] = useState(null);
  const [residentDocType, setResidentDocType] = useState('government_id');

  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    address: '',
    contact_number: '',
    skill_category: '',
    declared_rate: '',
    years_experience: '',
    bio: '',
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    if (formData.role === 'worker') {
      fetch(`${BASE_URL}/skill-categories/`)
        .then(res => res.json())
        .then(data => setSkillCategories(data.results || data))
        .catch(() => setSkillCategories([]));
    }
  }, [formData.role]);

  function handleInput(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (registerError) setRegisterError('');
  }

  function validateStep1() {
    const e = {};
    if (!formData.role) e.role = 'Please select a role.';
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!formData.full_name.trim()) e.full_name = 'Full name is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    if (!formData.address.trim()) e.address = 'Address is required.';
    if (!formData.contact_number.trim()) e.contact_number = 'Contact number is required.';
    if (!formData.password.trim()) e.password = 'Password is required.';
    if (formData.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password) e.confirm_password = 'Passwords do not match.';
    if (formData.role === 'worker') {
      if (!formData.skill_category) e.skill_category = 'Skill category is required.';
      if (!formData.declared_rate) e.declared_rate = 'Declared rate is required.';
      if (Number(formData.declared_rate) <= 0) e.declared_rate = 'Rate must be greater than 0.';
    }
    if (formData.role === 'resident' && !residentDocFile) {
      e.residentDoc = 'Please upload a valid ID or proof of residence.';
    }
    return e;
  }

  function handleNext() {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);

    try {
      // Step 1 — Register user
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        full_name: formData.full_name.trim(),
        address: formData.address.trim(),
        contact_number: formData.contact_number.trim(),
      };

      if (formData.role === 'worker') {
        payload.skill_category = formData.skill_category;
        payload.declared_rate = Number(formData.declared_rate);
        payload.years_experience = Number(formData.years_experience) || 0;
        payload.bio = formData.bio.trim();
      }

      const res = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Registration failed.');
      }

      // Step 2 — Upload documents if worker and files selected
      if (formData.role === 'worker' && data.worker_profile_id) {
        if (certFile) {
          const certForm = new FormData();
          certForm.append('worker_id', data.worker_profile_id); // ← FIXED
          certForm.append('doc_type', 'certification');
          certForm.append('file', certFile);
          const certRes = await fetch(`${BASE_URL}/documents/upload/`, {
            method: 'POST',
            body: certForm,
          });
          if (!certRes.ok) {
            const certErr = await certRes.json();
            console.error('Certification upload failed:', certErr);
          }
        }

        if (clearanceFile) {
          const clearForm = new FormData();
          clearForm.append('worker_id', data.worker_profile_id); // ← FIXED
          clearForm.append('doc_type', 'barangay_clearance');
          clearForm.append('file', clearanceFile);
          const clearRes = await fetch(`${BASE_URL}/documents/upload/`, {
            method: 'POST',
            body: clearForm,
          });
          if (!clearRes.ok) {
            const clearErr = await clearRes.json();
            console.error('Barangay clearance upload failed:', clearErr);
          }
        }
      }

      // ✅ FIX: Gamiton na ang resident_profile_id (dili na data.id)
      if (formData.role === 'resident' && data.resident_profile_id && residentDocFile) {
        const residentForm = new FormData();
        residentForm.append('resident_id', data.resident_profile_id); // ← FIXED
        residentForm.append('doc_type', residentDocType);
        residentForm.append('file', residentDocFile);

        const docRes = await fetch(`${BASE_URL}/residents/documents/upload/`, {
          method: 'POST',
          body: residentForm,
        });

        if (!docRes.ok) {
          const docErr = await docRes.json();
          console.error('Document upload failed:', docErr);
          // Dili i-throw para makapadayon pa ang registration
          // Ang user registered na, ang document lang ang problema
        }
      }

      navigate('/login', {
        state: { message: 'Account created successfully! Please wait for admin verification.' }
      });

    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = (field) =>
    `w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-lg outline-none dark:text-white transition-colors ${
      errors[field] ? 'border-red-400' : 'border-transparent focus:border-skill-primary'
    }`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-skill-dark dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-2xl">

        {/* Left Side */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
          <img src={workspaceImg} className="absolute inset-0 w-full h-full object-cover" alt="Branding" />
          <div className="absolute inset-0 bg-skill-dark/40 backdrop-blur-[2px]" />
          <div className="absolute bottom-20 left-10 text-white hidden md:block">
            <h1 className="text-5xl font-bold mb-2">Skill-Link CDO</h1>
            <p className="text-xl opacity-90">Connecting Skills to Opportunities.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8 md:p-14 relative overflow-y-auto max-h-screen">

          <button onClick={() => setIsDark(!isDark)}
            className="absolute top-6 right-8 p-2 rounded-full bg-gray-100 dark:bg-slate-800">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-skill-dark dark:text-skill-primary">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join the Skill-Link CDO community</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-skill-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-skill-primary' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-skill-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {/* STEP 1 — Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">I am registering as a:</p>
              <div className="grid grid-cols-2 gap-4">
                <button type="button"
                  onClick={() => { setFormData(prev => ({ ...prev, role: 'worker' })); setErrors({}); }}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${formData.role === 'worker' ? 'border-skill-primary bg-skill-primary/10' : 'border-gray-200 dark:border-slate-700 hover:border-skill-primary/50'}`}>
                  <Briefcase className={`mx-auto mb-2 ${formData.role === 'worker' ? 'text-skill-primary' : 'text-gray-400'}`} size={32} />
                  <p className={`font-bold text-sm ${formData.role === 'worker' ? 'text-skill-primary' : 'text-gray-600 dark:text-gray-300'}`}>Skilled Worker</p>
                  <p className="text-xs text-gray-400 mt-1">Plumber, Electrician, Carpenter, etc.</p>
                </button>

                <button type="button"
                  onClick={() => { setFormData(prev => ({ ...prev, role: 'resident' })); setErrors({}); }}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${formData.role === 'resident' ? 'border-skill-primary bg-skill-primary/10' : 'border-gray-200 dark:border-slate-700 hover:border-skill-primary/50'}`}>
                  <User className={`mx-auto mb-2 ${formData.role === 'resident' ? 'text-skill-primary' : 'text-gray-400'}`} size={32} />
                  <p className={`font-bold text-sm ${formData.role === 'resident' ? 'text-skill-primary' : 'text-gray-600 dark:text-gray-300'}`}>Resident</p>
                  <p className="text-xs text-gray-400 mt-1">Looking for skilled workers</p>
                </button>
              </div>

              {errors.role && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {errors.role}</p>}

              <button onClick={handleNext}
                className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all mt-4">
                Continue
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-skill-primary font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          )}

          {/* STEP 2 — Details Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="full_name" type="text" value={formData.full_name} onChange={handleInput}
                    className={inputClass('full_name')} placeholder="Juan dela Cruz" />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="email" type="email" value={formData.email} onChange={handleInput}
                    className={inputClass('email')} placeholder="juan@email.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="address" type="text" value={formData.address} onChange={handleInput}
                    className={inputClass('address')} placeholder="Purok 3, Brgy. Bulua, CDO" />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="contact_number" type="text" value={formData.contact_number} onChange={handleInput}
                    className={inputClass('contact_number')} placeholder="09171234567" />
                </div>
                {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
              </div>

              {/* Resident-only fields */}
              {formData.role === 'resident' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Identity Document <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-3 mb-2">
                    {[
                      { value: 'government_id', label: 'Government-Issued ID' },
                      { value: 'proof_of_residence', label: 'Proof of Residence' },
                    ].map((type) => (
                      <button key={type.value} type="button"
                        onClick={() => setResidentDocType(type.value)}
                        className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                          residentDocType === type.value
                            ? 'border-skill-primary bg-skill-primary/10 text-skill-primary'
                            : 'border-gray-200 dark:border-slate-700 text-gray-400 hover:border-skill-primary/50'
                        }`}>
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    residentDocFile ? 'border-skill-primary bg-skill-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-skill-primary/50'
                  }`} onClick={() => document.getElementById('resident-doc-upload').click()}>
                    <input id="resident-doc-upload" type="file" className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setResidentDocFile(e.target.files[0])} />
                    {residentDocFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-skill-primary font-medium truncate">{residentDocFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setResidentDocFile(null); }}
                          className="text-red-400 hover:text-red-600 ml-2">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="text-gray-400" size={24} />
                        <p className="text-sm text-gray-400">Click to upload document</p>
                        <p className="text-xs text-gray-300">PDF, JPG, PNG</p>
                      </div>
                    )}
                  </div>
                  {errors.residentDoc && <p className="text-red-500 text-xs mt-1">{errors.residentDoc}</p>}
                </div>
              )}

              {/* Worker-only fields */}
              {formData.role === 'worker' && (
                <>
                  {/* Skill Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill Category</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select name="skill_category" value={formData.skill_category} onChange={handleInput}
                        className={`${inputClass('skill_category')} appearance-none`}>
                        <option value="">Select skill category</option>
                        {skillCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    {errors.skill_category && <p className="text-red-500 text-xs mt-1">{errors.skill_category}</p>}
                  </div>

                  {/* Declared Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Declared Rate (PHP/day)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₱</span>
                      <input name="declared_rate" type="number" value={formData.declared_rate} onChange={handleInput}
                        className={`w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-lg outline-none dark:text-white transition-colors ${errors.declared_rate ? 'border-red-400' : 'border-transparent focus:border-skill-primary'}`}
                        placeholder="500" min="1" />
                    </div>
                    {errors.declared_rate && <p className="text-red-500 text-xs mt-1">{errors.declared_rate}</p>}
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="years_experience" type="number" value={formData.years_experience} onChange={handleInput}
                        className={inputClass('years_experience')} placeholder="3" min="0" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio (optional)</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInput} rows={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-skill-primary rounded-lg outline-none dark:text-white resize-none"
                      placeholder="Short description of your skills and experience..." />
                  </div>

                  {/* Certification Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Certification <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${certFile ? 'border-skill-primary bg-skill-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-skill-primary/50'}`}
                      onClick={() => document.getElementById('cert-upload').click()}>
                      <input id="cert-upload" type="file" className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setCertFile(e.target.files[0])} />
                      {certFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-skill-primary font-medium truncate">{certFile.name}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setCertFile(null); }}
                            className="text-red-400 hover:text-red-600 ml-2">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="text-gray-400" size={24} />
                          <p className="text-sm text-gray-400">Click to upload certification</p>
                          <p className="text-xs text-gray-300">PDF, JPG, PNG</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barangay Clearance Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Barangay Clearance <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${clearanceFile ? 'border-skill-primary bg-skill-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-skill-primary/50'}`}
                      onClick={() => document.getElementById('clearance-upload').click()}>
                      <input id="clearance-upload" type="file" className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setClearanceFile(e.target.files[0])} />
                      {clearanceFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-skill-primary font-medium truncate">{clearanceFile.name}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setClearanceFile(null); }}
                            className="text-red-400 hover:text-red-600 ml-2">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="text-gray-400" size={24} />
                          <p className="text-sm text-gray-400">Click to upload barangay clearance</p>
                          <p className="text-xs text-gray-300">PDF, JPG, PNG</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="password" type="password" value={formData.password} onChange={handleInput}
                    className={inputClass('password')} placeholder="Min. 8 characters" />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleInput}
                    className={inputClass('confirm_password')} placeholder="••••••••" />
                </div>
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
              </div>

              {registerError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {registerError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-lg hover:border-skill-primary transition-all">
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 py-4 bg-skill-primary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-skill-primary font-semibold hover:underline">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;