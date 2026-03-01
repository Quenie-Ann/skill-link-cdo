import React, { useState } from 'react';
import {
  UserCircle, Sun, Moon, Plus, X,
  Wrench, Zap, Hammer, Paintbrush,
  Save, Star, BadgeCheck, Phone,
  MapPin, Clock, Edit3, CheckCircle2
} from 'lucide-react';

// ── Skill tag options ──
const SKILL_OPTIONS = [
  'Plumbing', 'Pipe Fitting', 'Water Heater', 'Drain Cleaning',
  'Electrical', 'Wiring', 'Circuit Breaker', 'Panel Upgrade',
  'Carpentry', 'Cabinet Making', 'Roofing', 'Flooring',
  'Painting', 'Cleaning', 'Welding', 'Masonry', 'Tiling',
];

const SERVICE_ICONS = { Plumbing: Wrench, Electrical: Zap, Carpentry: Hammer, Painting: Paintbrush };

export default function WorkerProfile() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [saved, setSaved]           = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    full_name:        'Juan Dela Cruz',
    phone:            '09XX-XXX-XXXX',
    address:          'Brgy. 12, Carmen, CDO',
    bio:              'Experienced plumber with 5+ years of residential and commercial experience. Available for emergency calls.',
    experience_years: 5,
    hourly_rate:      250,
    skills:           ['Plumbing', 'Pipe Fitting', 'Water Heater'],
    availability:     'weekdays',
  });

  // Editable draft
  const [draft, setDraft] = useState({ ...profile });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  function handleEdit() {
    setDraft({ ...profile });
    setIsEditing(true);
    setSaved(false);
  }

  function handleSave() {
    setProfile({ ...draft });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setDraft({ ...profile });
    setIsEditing(false);
  }

  function toggleSkill(skill) {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }

  const inputClass =
    'w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-2xl outline-none transition-all text-sm dark:text-white';
  const readClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl text-sm text-skill-dark dark:text-white';

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">My Profile</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Worker Profile</p>
          </div>
          <div className="flex items-center gap-4">

            {/* Save feedback */}
            {saved && (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                <CheckCircle2 size={16} /> Profile saved!
              </span>
            )}

            {/* Edit / Save / Cancel */}
            {isEditing ? (
              <div className="flex items-center gap-3">
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
                  <Save size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2 bg-skill-light dark:bg-dark-bg border border-skill-primary/20 hover:border-skill-primary text-skill-dark dark:text-white rounded-xl text-sm font-bold transition-all"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            )}

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
        <div className="grid grid-cols-12 gap-8">

          {/* ── LEFT: Profile Card ── */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* Avatar + Name */}
            <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-4xl p-8 text-white shadow-xl shadow-skill-dark/20 text-center">
              <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                <UserCircle size={56} className="text-skill-primary" />
              </div>
              <h2 className="text-xl font-black mb-1">{profile.full_name}</h2>
              <p className="text-skill-primary text-xs font-bold uppercase tracking-widest mb-4">Skilled Worker</p>
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
                <BadgeCheck size={16} className="text-skill-primary" />
                <span className="text-xs font-bold">Barangay Verified</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5 space-y-4">
              <h3 className="font-bold text-skill-dark dark:text-white text-sm uppercase tracking-widest opacity-60">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-skill-dark dark:text-white">{profile.experience_years}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Yrs Exp.</p>
                </div>
                <div className="bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-skill-dark dark:text-white flex items-center justify-center gap-1">
                    4.8 <Star size={14} className="text-amber-400 fill-amber-400" />
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Rating</p>
                </div>
                <div className="bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-skill-dark dark:text-white">₱{profile.hourly_rate}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">per hour</p>
                </div>
                <div className="bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-skill-dark dark:text-white">12</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Jobs Done</p>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Editable Details ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Personal Info */}
            <div className="bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white text-lg mb-6 flex items-center gap-2">
                <UserCircle size={20} className="text-skill-primary" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
                    : <p className={readClass}>{profile.full_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="09XX-XXX-XXXX" />
                    : <p className={readClass + ' flex items-center gap-2'}><Phone size={14} className="text-gray-400" />{profile.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Address</label>
                  {isEditing
                    ? <input className={inputClass} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                    : <p className={readClass + ' flex items-center gap-2'}><MapPin size={14} className="text-gray-400" />{profile.address}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Bio / Description</label>
                  {isEditing
                    ? <textarea rows={3} className={inputClass + ' resize-none'} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
                    : <p className={readClass + ' leading-relaxed'}>{profile.bio}</p>}
                </div>

              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white dark:bg-dark-card rounded-4xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
              <h3 className="font-bold text-skill-dark dark:text-white text-lg mb-6 flex items-center gap-2">
                <Wrench size={20} className="text-skill-primary" /> Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Experience (years)</label>
                  {isEditing
                    ? <input type="number" min="0" className={inputClass} value={draft.experience_years} onChange={(e) => setDraft({ ...draft, experience_years: Number(e.target.value) })} />
                    : <p className={readClass}>{profile.experience_years} years</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Hourly Rate (₱)</label>
                  {isEditing
                    ? <input type="number" min="0" className={inputClass} value={draft.hourly_rate} onChange={(e) => setDraft({ ...draft, hourly_rate: Number(e.target.value) })} />
                    : <p className={readClass}>₱{profile.hourly_rate}/hr</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Availability</label>
                  {isEditing ? (
                    <select className={inputClass} value={draft.availability} onChange={(e) => setDraft({ ...draft, availability: e.target.value })}>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  ) : (
                    <p className={readClass + ' flex items-center gap-2 capitalize'}>
                      <Clock size={14} className="text-gray-400" />{profile.availability}
                    </p>
                  )}
                </div>

              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Skills</label>

                {/* Current skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isEditing ? draft.skills : profile.skills).map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-skill-primary/10 text-skill-dark dark:text-skill-primary rounded-xl text-xs font-bold"
                    >
                      {skill}
                      {isEditing && (
                        <button onClick={() => toggleSkill(skill)} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {(isEditing ? draft.skills : profile.skills).length === 0 && (
                    <p className="text-xs text-gray-400 italic">No skills added yet.</p>
                  )}
                </div>

                {/* Add skills when editing */}
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

          </div>
        </div>
      </main>
    </div>
  );
}