import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import {
  UserCircle, Sun, Moon, Plus, X,
  Wrench, Save, BadgeCheck, Phone,
  MapPin, Clock, Edit3, CheckCircle2,
  Calendar, Shield,
} from 'lucide-react';
import { api } from '../../services/api';
import { SKILL_OPTIONS } from '../../data/mockData';

// Availability days selector 
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkerProfile() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [draft,     setDraft]     = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
        setDraft(data);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEdit   = () => { setDraft({ ...profile }); setIsEditing(true); setSaved(false); };
  const handleCancel = () => { setDraft({ ...profile }); setIsEditing(false); };
  const handleSave   = async () => {
    await api.updateProfile(draft);
    setProfile({ ...draft });
    setSaved(true);
    setIsEditing(false);
  };

  const toggleSkill = (skill) =>
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));

  // D-04: toggle a day in availability_schedule
  const toggleDay = (day) =>
    setDraft((prev) => {
      const current = prev.availability_schedule || [];
      return {
        ...prev,
        availability_schedule: current.includes(day)
          ? current.filter((d) => d !== day)
          : [...current, day],
      };
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-skill-light dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-skill-primary" />
      </div>
    );
  }
  if (!profile || !draft) {
    return (
      <div className="min-h-screen bg-skill-light dark:bg-dark-bg flex items-center justify-center">
        <p className="text-red-500 font-bold">Profile not found.</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg outline-none transition-all text-sm dark:text-white';
  const readClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg/60 rounded-lg text-sm text-skill-dark dark:text-white';

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">My Profile</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Worker Profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 size={14} /> Saved!
              </span>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 bg-skill-primary hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-skill-primary/20"
                >
                  <Save size={15} /> Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2 bg-skill-light dark:bg-dark-bg border border-skill-primary/20 hover:border-skill-primary text-skill-dark dark:text-white rounded-xl text-sm font-bold transition-all"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
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
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-4 space-y-5">

            {/* Identity Card */}
            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-xl p-8 text-white shadow-xl shadow-skill-dark/20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                  <UserCircle size={56} className="text-skill-primary" />
                </div>
                <h2 className="text-xl font-black mb-0.5">{profile.full_name}</h2>
                <p className="text-skill-primary text-[10px] font-bold uppercase tracking-widest mb-5">
                  Skilled Worker
                </p>
                <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-4 py-2.5 border border-white/10">
                  <BadgeCheck size={15} className="text-skill-primary" />
                  <span className="text-xs font-bold">Barangay Verified</span>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Quick Stats
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Yrs Exp.',   value: profile.experience_years       },
                  { label: 'Rating',     value: '4.8 ★', special: true          },
                  { label: 'Rate/day',   value: `₱${profile.daily_rate}`       },
                  { label: 'Jobs Done',  value: 12                              },
                ].map(({ label, value, special }) => (
                  <div key={label} className="bg-skill-light dark:bg-dark-bg rounded-lg p-4 text-center">
                    <p className={`text-xl font-black ${special ? 'text-amber-500' : 'text-skill-dark dark:text-white'}`}>
                      {value}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Shield size={10} /> Documents & Verification
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Government ID',      status: 'submitted' },
                  { label: 'Barangay Clearance', status: 'submitted' },
                  { label: 'Account Status',     status: 'verified'  },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-skill-dark dark:text-white">{label}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      status === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    }`}>
                      <CheckCircle2 size={9} />
                      {status === 'verified' ? 'Verified' : 'Submitted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-5">

            {/* Personal Information */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white text-base mb-6 flex items-center gap-2">
                <UserCircle size={18} className="text-skill-primary" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
                    : <p className={readClass}>{profile.full_name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="09XX-XXX-XXXX" />
                    : <p className={readClass + ' flex items-center gap-2'}><Phone size={13} className="text-gray-400" />{profile.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Address</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                    : <p className={readClass + ' flex items-center gap-2'}><MapPin size={13} className="text-gray-400" />{profile.address}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bio / Description</label>
                  {isEditing
                    ? <textarea rows={3} className={inputClass + ' resize-none'} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
                    : <p className={readClass + ' leading-relaxed'}>{profile.bio}</p>}
                </div>

              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white text-base mb-6 flex items-center gap-2">
                <Wrench size={18} className="text-skill-primary" /> Service Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Experience (years)</label>
                  {isEditing
                    ? <input type="number" min="0" className={inputClass} value={draft.experience_years} onChange={(e) => setDraft({ ...draft, experience_years: Number(e.target.value) })} />
                    : <p className={readClass}>{profile.experience_years} years</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Daily Rate (₱)</label>
                  {isEditing
                    ? <input type="number" min="0" className={inputClass} value={draft.daily_rate} onChange={(e) => setDraft({ ...draft, daily_rate: Number(e.target.value) })} />
                    : <p className={readClass}>₱{profile.daily_rate}/day</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Availability</label>
                  {isEditing ? (
                    <select className={inputClass} value={draft.availability} onChange={(e) => setDraft({ ...draft, availability: e.target.value })}>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  ) : (
                    <p className={readClass + ' flex items-center gap-2 capitalize'}>
                      <Clock size={13} className="text-gray-400" />{profile.availability}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(isEditing ? draft.skills : profile.skills).map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-skill-primary/10 text-skill-dark dark:text-skill-primary rounded-xl text-xs font-bold"
                    >
                      {skill}
                      {isEditing && (
                        <button onClick={() => toggleSkill(skill)} className="hover:text-red-500 transition-colors">
                          <X size={11} />
                        </button>
                      )}
                    </span>
                  ))}
                  {(isEditing ? draft.skills : profile.skills).length === 0 && (
                    <p className="text-xs text-gray-400 italic">No skills added yet.</p>
                  )}
                </div>

                {isEditing && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Add from list:</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.filter((s) => !draft.skills.includes(s)).map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-skill-light dark:bg-dark-bg border border-skill-primary/20 hover:border-skill-primary hover:bg-skill-primary/5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all"
                        >
                          <Plus size={10} /> {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Schedule */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white text-base mb-1 flex items-center gap-2">
                <Calendar size={18} className="text-skill-primary" /> Weekly Schedule
              </h3>
              {isEditing && (
                <p className="text-[10px] text-gray-400 mb-4 font-medium">
                  Tap a day to toggle your availability.
                </p>
              )}
              <div className="flex gap-2 flex-wrap mt-4">
                {DAYS.map((day) => {
                  const schedule = isEditing
                    ? (draft.availability_schedule || [])
                    : (profile.availability_schedule || []);
                  const isActive = schedule.includes(day);
                  return isEditing ? (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex-1 min-w-[48px] py-3 rounded-lg text-center transition-all border-2 ${
                        isActive
                          ? 'bg-skill-primary border-skill-primary text-white shadow-md shadow-skill-primary/20'
                          : 'bg-skill-light dark:bg-dark-bg border-transparent text-gray-400 hover:border-skill-primary/40'
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider">{day}</p>
                      {isActive && (
                        <div className="mt-1.5 flex justify-center">
                          <span className="w-1 h-1 bg-white/60 rounded-full" />
                        </div>
                      )}
                    </button>
                  ) : (
                    <div
                      key={day}
                      className={`flex-1 min-w-[48px] py-3 rounded-lg text-center transition-all ${
                        isActive
                          ? 'bg-skill-primary text-white shadow-md shadow-skill-primary/20'
                          : 'bg-skill-light dark:bg-dark-bg text-gray-400'
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider">{day}</p>
                      {isActive && (
                        <div className="mt-1.5 flex justify-center">
                          <span className="w-1 h-1 bg-white/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 font-medium">
                {(() => {
                  const schedule = isEditing
                    ? (draft.availability_schedule || [])
                    : (profile.availability_schedule || []);
                  if (schedule.length === 0) return 'No days selected';
                  if (schedule.length === 7) return 'Available every day';
                  return `Available on: ${schedule.join(', ')}`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}