import React, { useState } from 'react';
import {
  Search, Sun, Moon, Star, MapPin,
  Wrench, Zap, Hammer, Paintbrush,
  BadgeCheck, Phone, Clock, ChevronRight,
  SlidersHorizontal, X, CheckCircle2
} from 'lucide-react';

const WORKERS = [
  { id: 1, full_name: 'Juan Dela Cruz', service: 'Plumbing', skills: ['Plumbing', 'Pipe Fitting', 'Water Heater'], location: 'Brgy. 12, Carmen', rating: 4.8, jobs: 24, hourly_rate: 250, experience_years: 5, is_verified: true, availability: 'Weekdays', phone: '09XX-XXX-0001' },
  { id: 2, full_name: 'Pedro Reyes', service: 'Electrical', skills: ['Electrical', 'Wiring', 'Circuit Breaker'], location: 'Brgy. 40, Nazareth', rating: 4.5, jobs: 18, hourly_rate: 200, experience_years: 3, is_verified: true, availability: 'Anytime', phone: '09XX-XXX-0002' },
  { id: 3, full_name: 'Carlo Mendez', service: 'Carpentry', skills: ['Carpentry', 'Cabinet Making', 'Roofing'], location: 'Brgy. 3, Poblacion', rating: 4.2, jobs: 9, hourly_rate: 180, experience_years: 2, is_verified: true, availability: 'Weekends', phone: '09XX-XXX-0003' },
  { id: 4, full_name: 'Rene Gomez', service: 'Painting', skills: ['Painting', 'Cleaning', 'Tiling'], location: 'Brgy. 6, Lapasan', rating: 4.9, jobs: 31, hourly_rate: 220, experience_years: 7, is_verified: true, availability: 'Weekdays', phone: '09XX-XXX-0004' },
  { id: 5, full_name: 'Ben Santos', service: 'Electrical', skills: ['Electrical', 'Panel Upgrade', 'Wiring'], location: 'Brgy. 25, Macasandig', rating: 4.6, jobs: 15, hourly_rate: 210, experience_years: 4, is_verified: true, availability: 'Anytime', phone: '09XX-XXX-0005' },
  { id: 6, full_name: 'Noel Flores', service: 'Plumbing', skills: ['Plumbing', 'Drain Cleaning'], location: 'Brgy. 10, Consolacion', rating: 4.0, jobs: 7, hourly_rate: 160, experience_years: 1, is_verified: false, availability: 'Weekends', phone: '09XX-XXX-0006' },
];

const SERVICE_CONFIG = {
  Plumbing:   { icon: Wrench,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20'     },
  Electrical: { icon: Zap,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  Carpentry:  { icon: Hammer,     color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  Painting:   { icon: Paintbrush, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
};

const SERVICE_FILTERS = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting'];

export default function ResidentDirectory() {
  const [isDarkMode, setIsDarkMode]         = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');
  const [activeFilter, setActiveFilter]     = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookedIds, setBookedIds]           = useState([]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const filtered = WORKERS.filter((w) => {
    const matchSearch =
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'All' || w.service === activeFilter;
    return matchSearch && matchFilter;
  });

  function handleBook(worker) {
    setBookedIds((prev) => [...prev, worker.id]);
    setSelectedWorker(null);
  }

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">Find Workers</h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">Worker Directory</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skill-primary/40" size={18} />
              <input type="text" placeholder="Search by name, skill, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-skill-light dark:bg-dark-bg rounded-xl border-none text-sm w-80 focus:ring-2 focus:ring-skill-primary outline-none transition-all dark:text-white" />
            </div>
            <button onClick={toggleDarkMode} className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <SlidersHorizontal size={18} className="text-skill-primary flex-shrink-0" />
          {SERVICE_FILTERS.map((f) => {
            const cfg = SERVICE_CONFIG[f];
            const Icon = cfg?.icon;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeFilter === f ? 'bg-skill-primary text-white shadow-lg shadow-skill-primary/20' : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:border-skill-primary border border-transparent'}`}>
                {Icon && <Icon size={15} />}{f}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400 font-bold flex-shrink-0">{filtered.length} worker{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Search size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No workers found for your search.</p>
            <button onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} className="mt-4 text-skill-primary text-sm font-bold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((worker) => {
              const cfg = SERVICE_CONFIG[worker.service] || SERVICE_CONFIG['Plumbing'];
              const Icon = cfg.icon;
              const isBooked = bookedIds.includes(worker.id);
              return (
                <div key={worker.id} onClick={() => !isBooked && setSelectedWorker(worker)} className={`bg-white dark:bg-dark-card rounded-4xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5 hover:border-skill-primary/30 hover:shadow-md transition-all group ${isBooked ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${cfg.bg}`}><Icon size={24} className={cfg.color} /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-skill-dark dark:text-white group-hover:text-skill-primary transition-colors">{worker.full_name}</h3>
                          {worker.is_verified && <BadgeCheck size={16} className="text-skill-primary flex-shrink-0" />}
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 ${cfg.color}`}>{worker.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{worker.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {worker.skills.map((s) => (<span key={s} className="text-[10px] px-2.5 py-1 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-gray-300 rounded-lg font-semibold">{s}</span>))}
                  </div>
                  <div className="space-y-2 mb-5">
                    <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><MapPin size={12} className="text-gray-400 flex-shrink-0" />{worker.location}</p>
                    <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Clock size={12} className="text-gray-400 flex-shrink-0" />Available: {worker.availability}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <div>
                      <p className="text-xs text-gray-400">{worker.jobs} jobs · {worker.experience_years} yrs exp</p>
                      <p className="text-lg font-black text-skill-dark dark:text-white">₱{worker.hourly_rate}<span className="text-xs font-normal text-gray-400">/hr</span></p>
                    </div>
                    {isBooked ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs font-bold">
                        <CheckCircle2 size={13} /> Requested
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedWorker(worker); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-skill-primary hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-skill-primary/20"
                      >
                        Book Now <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm" onClick={() => setSelectedWorker(null)}>
          <div className="bg-white dark:bg-dark-card rounded-4xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {(() => { const cfg = SERVICE_CONFIG[selectedWorker.service] || SERVICE_CONFIG['Plumbing']; const Icon = cfg.icon; return (<div className={`p-3 rounded-2xl ${cfg.bg}`}><Icon size={28} className={cfg.color} /></div>); })()}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-xl text-skill-dark dark:text-white">{selectedWorker.full_name}</h2>
                    {selectedWorker.is_verified && <BadgeCheck size={18} className="text-skill-primary" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedWorker.service} Specialist</p>
                </div>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-skill-light dark:hover:bg-dark-bg rounded-xl transition-colors"><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-skill-dark dark:text-white flex items-center justify-center gap-1">{selectedWorker.rating}<Star size={16} className="text-amber-400 fill-amber-400" /></p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Rating</p>
              </div>
              <div className="flex-1 bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-skill-dark dark:text-white">{selectedWorker.jobs}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Jobs Done</p>
              </div>
              <div className="flex-1 bg-skill-light dark:bg-dark-bg rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-skill-dark dark:text-white">{selectedWorker.experience_years}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Yrs Exp</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><MapPin size={14} className="text-skill-primary flex-shrink-0" />{selectedWorker.location}</p>
              <p className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Phone size={14} className="text-skill-primary flex-shrink-0" />{selectedWorker.phone}</p>
              <p className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Clock size={14} className="text-skill-primary flex-shrink-0" />Available: {selectedWorker.availability}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedWorker.skills.map((s) => (<span key={s} className="text-xs px-3 py-1.5 bg-skill-primary/10 text-skill-dark dark:text-skill-primary rounded-xl font-bold">{s}</span>))}
            </div>
            <button
              onClick={() => handleBook(selectedWorker)}
              className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-skill-primary/20 text-sm active:scale-[0.98]"
            >
              Book {selectedWorker.full_name} — ₱{selectedWorker.hourly_rate}/hr
            </button>
          </div>
        </div>
      )}
    </div>
  );
}