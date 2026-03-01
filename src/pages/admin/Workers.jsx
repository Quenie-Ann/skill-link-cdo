import { useState, useEffect } from 'react';
import { api } from '../../services/api';    // ← replaces old supabase
import Card from '../../components/common/Card';
import { AlertCircle, CheckCircle2, XCircle, Star } from 'lucide-react';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [formError, setFormError] = useState('');

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [experience,  setExperience]  = useState('');
  const [rate,        setRate]        = useState('');

  useEffect(() => { fetchWorkers(); }, []);

  async function fetchWorkers() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWorker(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.addWorker({
        full_name: fullName,
        email,
        experience_years: Number(experience),
        hourly_rate: Number(rate),
        skills: [],
      });
      setFullName(''); setEmail(''); setExperience(''); setRate('');
      await fetchWorkers(); // refresh from DB
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleToggleVerify(worker) {
    try {
      await api.verifyWorker(worker.id, !worker.is_verified);
      setWorkers((prev) =>
        prev.map((w) => w.id === worker.id ? { ...w, is_verified: !w.is_verified } : w)
      );
    } catch (err) {
      alert('Failed to update verification: ' + err.message);
    }
  }

  const totalWorkers  = workers.length;
  const averageRating = workers.length > 0
    ? (workers.reduce((a, w) => a + Number(w.rating || 0), 0) / workers.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-skill-dark dark:text-white">Workers Management</h1>

      {/* Add Worker Form */}
      <Card>
        <form onSubmit={handleAddWorker} className="mb-2">
          <h2 className="text-xl font-semibold mb-4">Add New Worker</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text"   placeholder="Full Name"          value={fullName}   onChange={(e) => setFullName(e.target.value)}   className="border p-2 rounded-xl" required />
            <input type="email"  placeholder="Email"              value={email}      onChange={(e) => setEmail(e.target.value)}      className="border p-2 rounded-xl" required />
            <input type="number" placeholder="Experience (years)" value={experience} onChange={(e) => setExperience(e.target.value)} className="border p-2 rounded-xl" min="0" required />
            <input type="number" placeholder="Hourly Rate (₱)"   value={rate}       onChange={(e) => setRate(e.target.value)}       className="border p-2 rounded-xl" min="0" required />
          </div>
          <button className="mt-4 bg-skill-primary hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
            Add Worker
          </button>
        </form>
      </Card>

      {/* Summary */}
      <div className="mb-8 mt-6">
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Workers</p>
              <h2 className="text-2xl font-bold">{totalWorkers}</h2>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <h2 className="text-2xl font-bold flex items-center gap-1">
                {averageRating}<Star size={18} className="text-amber-400 fill-amber-400" />
              </h2>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error} — Is the local server running?
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skill-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <Card key={worker.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{worker.full_name || 'Unknown'}</h3>
                <button
                  onClick={() => handleToggleVerify(worker)}
                  title={worker.is_verified ? 'Revoke verification' : 'Verify worker'}
                  className="transition-colors"
                >
                  {worker.is_verified
                    ? <CheckCircle2 size={20} className="text-skill-primary" />
                    : <XCircle size={20} className="text-gray-300 hover:text-amber-500" />}
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{worker.email}</p>
              <p className="text-sm mb-1">Skills: {(worker.skills || []).join(', ') || '—'}</p>
              <p className="text-sm">Experience: {worker.experience_years} yrs</p>
              <p className="text-sm">Rate: ₱{worker.hourly_rate}/hr</p>
              <p className="text-sm flex items-center gap-1">
                Rating: {worker.rating || 0}
                <Star size={13} className="text-amber-400 fill-amber-400" />
              </p>
              <span className={`mt-2 inline-block text-[10px] px-2 py-1 rounded-full font-bold uppercase ${worker.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {worker.is_verified ? 'Verified' : 'Pending'}
              </span>
            </Card>
          ))}
          {workers.length === 0 && !loading && (
            <p className="text-gray-500 col-span-3 text-center py-8">No workers registered yet.</p>
          )}
        </div>
      )}
    </div>
  );
} 